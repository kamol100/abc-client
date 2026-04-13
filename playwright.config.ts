import { defineConfig, devices } from "@playwright/test";

const appPort = Number(process.env.PLAYWRIGHT_PORT ?? 3000);
const appBaseURL =
  process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${appPort}`;
const backendBaseURL =
  process.env.PLAYWRIGHT_BACKEND_BASE_URL ?? "http://localhost:8000";

export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/e2e/auth/global-setup.ts",
  testIgnore: /auth\.setup/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: appBaseURL,
    trace: "on-first-retry",
  },
  webServer: {
    command: `npm run dev -- --port ${appPort}`,
    url: appBaseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      ...process.env,
      NEXTAPI_URL: backendBaseURL,
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
