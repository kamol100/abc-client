import { defineConfig, devices } from "@playwright/test";
import { tenantCredentials } from "@/tests/e2e/clients/environment";

function smsTenant(): "vp" | "mk" {
  const selected = process.env.E2E_TENANT ?? "vp";
  if (selected !== "vp" && selected !== "mk") {
    throw new Error("SMS send company tests require E2E_TENANT=vp or mk.");
  }
  return selected;
}

const tenant = smsTenant();
const artifactRoot = process.env.E2E_SMS_SEND_ARTIFACT_DIR ?? "playwright-report/sms-send";

export default defineConfig({
  testDir: "./tests/e2e/sms-send",
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
  projects: [{ name: "sms-send-chromium" }],
});
