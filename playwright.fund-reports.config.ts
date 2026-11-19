import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e/reports-funds",
  outputDir: `${process.env.FR_E2E_ARTIFACT_DIR ?? "playwright-report/reports-funds"}/artifacts`,
  timeout: 180_000,
  expect: { timeout: 15_000 },
  workers: 1,
  retries: 0,
  reporter: [
    ["list"],
    ["json", { outputFile: `${process.env.FR_E2E_ARTIFACT_DIR ?? "playwright-report/reports-funds"}/results.json` }],
  ],
  use: {
    ...devices["Desktop Chrome"],
    locale: "en-US",
    timezoneId: "Asia/Dhaka",
    serviceWorkers: "block",
    actionTimeout: 12_000,
    screenshot: "only-on-failure",
    launchOptions: { executablePath: process.env.FR_E2E_CHROMIUM },
  },
});
