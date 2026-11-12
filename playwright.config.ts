import { existsSync, readFileSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

function loadE2EEnv(): void {
  if (!existsSync(".env.e2e")) {
    return;
  }

  for (const line of readFileSync(".env.e2e", "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separator = trimmed.indexOf("=");
    if (separator === -1) {
      continue;
    }

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, "");
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadE2EEnv();

const port = Number(process.env.PLAYWRIGHT_PORT ?? 3000);
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://vp.isp.test";
const backendApiUrl = process.env.NEXTAPI_URL ?? "http://localhost:8000";
const managesDevServer = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/.test(baseURL);
const startCommand =
  process.platform === "win32"
    ? `set NEXTAPI_URL=${backendApiUrl}&& npm run dev -- --port ${port}`
    : `NEXTAPI_URL=${backendApiUrl} npm run dev -- --port ${port}`;

export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/e2e/global-setup.ts",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      testIgnore: /global-setup\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  ...(managesDevServer
    ? {
        webServer: {
          command: startCommand,
          url: baseURL,
          reuseExistingServer: true,
          timeout: 120000,
        },
      }
    : {}),
});

