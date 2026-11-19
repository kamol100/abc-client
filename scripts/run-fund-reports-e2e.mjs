import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { cp, mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import { once } from "node:events";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const backend = resolve(process.env.ISP_BACKEND_DIR ?? join(root, "../isp-backend"));
const scratch = await mkdtemp(join(tmpdir(), "isp-fund-reports-e2e-"));
const artifacts = process.env.FR_E2E_ARTIFACT_DIR
  ? resolve(process.env.FR_E2E_ARTIFACT_DIR)
  : await mkdtemp(join(tmpdir(), "isp-fund-reports-e2e-report-"));
const password = randomBytes(24).toString("hex");
const children = new Set();
let broker;

function launch(command, args, options) {
  const child = spawn(command, args, options);
  children.add(child);
  child.once("exit", () => children.delete(child));
  return child;
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => {
    for (const child of children) child.kill("SIGTERM");
  });
}

async function listen(server) {
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  return server.address().port;
}

async function startApi() {
  const storage = join(scratch, "backend-storage");
  await mkdir(join(storage, "framework/views"), { recursive: true });
  const php = launch(join(backend, "scripts/ai/backend-test"), ["tests/Browser/FundReportFixture.php"], {
    cwd: backend,
    env: { ...process.env, FR_E2E_PASSWORD: password, FR_E2E_DISPOSABLE: "1", FR_E2E_STORAGE: storage },
    stdio: ["pipe", "pipe", "inherit"],
  });
  const lines = createInterface({ input: php.stdout });
  const pending = new Map();
  let sequence = 0;
  const accounts = await new Promise((ready, reject) => {
    function accept(line) {
      if (!line.startsWith("{")) return;
      const parsed = JSON.parse(line);
      if (parsed.fixture) {
        ready(parsed.fixture);
      } else {
        pending.get(parsed.id)?.(parsed);
        pending.delete(parsed.id);
      }
    }
    lines.on("line", accept);
    php.once("error", reject);
    php.once("exit", (code) => {
      reject(new Error(`The isolated Laravel fixture exited (${code}).`));
      for (const respond of pending.values()) respond({ status: 503, body: "", headers: {} });
      pending.clear();
    });
  });

  broker = createServer(async (request, response) => {
    if (!request.url?.startsWith("/api/")) {
      response.writeHead(404).end();
      return;
    }
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    const headers = Object.fromEntries(
      Object.entries(request.headers).filter(([key, value]) => typeof value === "string" && key !== "content-length"),
    );
    const id = ++sequence;
    pending.set(id, (result) => {
      response.writeHead(result.status, result.headers).end(Buffer.from(result.body, "base64"));
    });
    php.stdin.write(JSON.stringify({
      id, method: request.method, url: request.url, headers, body: Buffer.concat(chunks).toString("base64"),
    }) + "\n");
  });

  const port = await listen(broker);
  return { accounts, api: `http://127.0.0.1:${port}` };
}

async function startFrontend(api) {
  // A scratch checkout gives Next its own build cache and leaves the developer's app and environment alone.
  for (const name of ["app", "auth", "components", "content", "context", "data", "hooks", "lib", "types", "public",
    "package.json", "next.config.ts", "next-env.d.ts", "postcss.config.mjs", "tailwind.config.ts", "tsconfig.json", "proxy.ts", "i18n.ts"]) {
    await cp(join(root, name), join(scratch, name), { recursive: true });
  }
  await symlink(join(root, "node_modules"), join(scratch, "node_modules"), "dir");
  const fonts = join(scratch, "offline-fonts.cjs");
  await writeFile(fonts, 'module.exports = new Proxy({}, { get: () => "@font-face { font-family: Fixture; src: local(Arial); }" });');
  const probe = createServer();
  const port = await listen(probe);
  await new Promise((done) => probe.close(done));

  const next = launch(process.execPath, [join(root, "node_modules/next/dist/bin/next"), "dev", "--webpack", "--hostname", "127.0.0.1", "--port", String(port)], {
    cwd: scratch,
    env: {
      ...process.env,
      AUTH_URL: `http://app.isp.test:${port}`,
      NEXTAUTH_URL: "",
      AUTH_SECRET: randomBytes(32).toString("hex"),
      NEXTAPI_URL: api,
      NEXT_PUBLIC_API: api,
      NEXT_TELEMETRY_DISABLED: "1",
      NEXT_FONT_GOOGLE_MOCKED_RESPONSES: fonts,
    },
    stdio: ["ignore", "pipe", "inherit"],
  });
  await new Promise((ready, reject) => {
    createInterface({ input: next.stdout }).on("line", (line) => {
      process.stdout.write(line.replaceAll(password, "[redacted]") + "\n");
      if (line.includes("Ready in")) ready();
    });
    next.once("error", reject);
    next.once("exit", (code) => reject(new Error(`The isolated Next.js app exited (${code}).`)));
  });
  return port;
}

try {
  const { accounts, api } = await startApi();
  const port = await startFrontend(api);
  const playwright = launch(process.execPath, [join(root, "node_modules/@playwright/test/cli.js"), "test",
    "--config=playwright.fund-reports.config.ts", ...process.argv.slice(2)], {
    cwd: root,
    env: { ...process.env, TZ: "Asia/Dhaka", FR_E2E_ACCOUNTS: JSON.stringify(accounts), FR_E2E_PASSWORD: password, FR_E2E_ARTIFACT_DIR: artifacts, FR_E2E_API: api, FR_E2E_PORT: String(port) },
    stdio: "inherit",
  });
  const [code] = await once(playwright, "exit");
  console.log(`Fund report acceptance artifacts: ${artifacts}`);
  process.exitCode = code ?? 1;
} finally {
  broker?.close();
  broker?.closeAllConnections();
  const exits = [...children].map((child) => {
    const ended = once(child, "exit").catch(() => {});
    child.kill("SIGTERM");
    return ended;
  });
  await Promise.all(exits);
  await rm(scratch, { force: true, recursive: true });
}
