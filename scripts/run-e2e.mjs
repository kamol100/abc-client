import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(import.meta.url);
const cli = require.resolve("@playwright/test/cli");
const args = process.argv.slice(2);

// Each feature keeps its own authentication, fixtures and reports. Discover new
// root-level suite configs automatically so the standard command includes them.
const configs = readdirSync(root)
  .filter((name) => /^playwright(?:\..+)?\.config\.ts$/.test(name))
  .sort();

if (args.some((arg) => arg === "--config" || arg === "-c" || arg.startsWith("--config="))) {
  console.error("Use a focused suite command to select a config; test:e2e runs all suite configs.");
  process.exit(1);
}

let failed = false;
const results = [];
for (const config of configs) {
  console.log(`\nRunning Playwright suite: ${config}`);
  const result = spawnSync(process.execPath, [cli, "test", `--config=${config}`, ...args], {
    cwd: root,
    env: process.env,
    stdio: "inherit",
  });
  if (result.signal === "SIGINT" || result.signal === "SIGTERM") {
    process.exit(result.signal === "SIGINT" ? 130 : 143);
  }
  const succeeded = !result.error && result.status === 0;
  if (result.error) console.error(`Unable to run ${config}: ${result.error.message}`);
  results.push(`${config}: ${succeeded ? "completed" : "failed"}`);
  failed ||= !succeeded;
}

console.log(`\nPlaywright suite results:\n${results.join("\n")}`);
process.exitCode = failed ? 1 : 0;
