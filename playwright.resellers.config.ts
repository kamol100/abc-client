import { defineConfig, devices } from "@playwright/test";
import { tenantCredentials } from "@/tests/e2e/clients/environment";

const tenant = process.env.E2E_TENANT ?? "cp";
if (tenant !== "cp" && tenant !== "mk") {
  throw new Error("Reseller company tests require E2E_TENANT=cp or mk.");
}
const artifactRoot = process.env.E2E_RESELLER_ARTIFACT_DIR ?? "playwright-report/resellers";

export default defineConfig({
  testDir: "./tests/e2e/resellers",
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
    baseURL: tenantCredentials(tenant).baseURL,
    locale: "en-US",
    timezoneId: "Asia/Dhaka",
    serviceWorkers: "block",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [{ name: "resellers-chromium" }],
});
