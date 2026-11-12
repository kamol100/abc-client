import { defineConfig, devices } from "@playwright/test";
import { tenantCredentials } from "@/tests/e2e/clients/environment";

const selected = process.env.E2E_TENANT ?? "cp";
if (selected !== "cp" && selected !== "mk") throw new Error("E2E_TENANT must be cp or mk; APP is not a company-isolation persona.");
const { baseURL } = tenantCredentials(selected);
const artifactRoot = process.env.E2E_CLIENT_ARTIFACT_DIR ?? "playwright-report/client-suite";

// Deliberately independent of the preexisting config/global setup and tracked auth file.
export default defineConfig({
  testDir: "./tests/e2e/clients",
  outputDir: `${artifactRoot}/artifacts`,
  timeout: 45_000,
  expect: { timeout: 15_000 },
  workers: 1,
  retries: 0,
  forbidOnly: Boolean(process.env.CI),
  reporter: [["list"], ["html", { outputFolder: `${artifactRoot}/html`, open: "never" }], ["json", { outputFile: `${artifactRoot}/results.json` }]],
  use: { ...devices["Desktop Chrome"], baseURL, locale: "en-US", timezoneId: "Asia/Dhaka", serviceWorkers: "block", trace: "off", screenshot: "off", video: "off" },
  projects: [
    { name: "clients-chromium", testMatch: /read-only\.spec\.ts/ },
    { name: "clients-isolated", testMatch: /isolated\.spec\.ts/ },
  ],
});
