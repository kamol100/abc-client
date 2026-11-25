import { defineConfig, devices } from "@playwright/test";

const artifacts = process.env.MKS_E2E_ARTIFACT_DIR ?? "playwright-report/mikrotik-sync";

export default defineConfig({
  testDir: "./tests/e2e/mikrotik-sync",
  outputDir: `${artifacts}/artifacts`,
  timeout: 180_000,
  expect: { timeout: 15_000 },
  workers: 1,
  retries: 0,
  reporter: [
    ["list"],
    ["json", { outputFile: `${artifacts}/results.json` }],
    ["html", { outputFolder: `${artifacts}/html`, open: "never" }],
  ],
  use: {
    ...devices["Desktop Chrome"],
    locale: "en-US",
    timezoneId: "Asia/Dhaka",
    serviceWorkers: "block",
    actionTimeout: 15_000,
    video: "on",
    trace: "off",
    screenshot: "only-on-failure",
    launchOptions: {
      executablePath: process.env.MKS_E2E_CHROMIUM,
      slowMo: Number(process.env.MKS_E2E_SLOW_MO ?? "0"),
    },
  },
});
