import { defineConfig, devices } from "@playwright/test";
import { tenantCredentials } from "@/tests/e2e/clients/environment";

const { baseURL } = tenantCredentials("cp");
const artifactRoot = process.env.E2E_TICKET_ARTIFACT_DIR ?? "playwright-report/support-tickets";

// Independent of the legacy config, its global setup, and the tracked auth file.
export default defineConfig({
  testDir: "./tests/e2e/support-tickets",
  outputDir: `${artifactRoot}/artifacts`,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  workers: 1,
  retries: 0,
  forbidOnly: Boolean(process.env.CI),
  reporter: [
    ["list"],
    ["html", { outputFolder: `${artifactRoot}/html`, open: "never" }],
    ["json", { outputFile: `${artifactRoot}/results.json` }],
  ],
  use: {
    ...devices["Desktop Chrome"],
    baseURL,
    locale: "en-US",
    timezoneId: "Asia/Dhaka",
    serviceWorkers: "block",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [{ name: "support-tickets-chromium", testMatch: /.*\.spec\.ts/ }],
});
