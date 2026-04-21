import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PLAYWRIGHT_PORT ?? 3000);
const baseURL = `http://localhost:${port}`;
const backendApiUrl = process.env.NEXTAPI_URL ?? "http://localhost:8000";
const startCommand =
  process.platform === "win32"
    ? `set NEXTAPI_URL=${backendApiUrl}&& npm run dev -- --port ${port}`
    : `NEXTAPI_URL=${backendApiUrl} npm run dev -- --port ${port}`;

export default defineConfig({
  testDir: "./tests/e2e",
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
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: startCommand,
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120000,
  },
});

