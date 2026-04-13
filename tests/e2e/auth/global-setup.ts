import { mkdirSync } from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const appPort = Number(process.env.PLAYWRIGHT_PORT ?? 3000);
const appBaseURL =
  process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${appPort}`;

const authUsername = process.env.PLAYWRIGHT_AUTH_USERNAME ?? "kamol";
const authPassword = process.env.PLAYWRIGHT_AUTH_PASSWORD ?? "12345678";
const storagePath = "playwright/.auth/user.json";

export default async function globalSetup() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ baseURL: appBaseURL });
  const page = await context.newPage();

  const callbackUrl = encodeURIComponent("/dashboard");
  await page.goto(`/admin?callbackUrl=${callbackUrl}`);
  await page.locator("#username").fill(authUsername);
  await page.locator("#password").fill(authPassword);
  await page.locator("button[type='submit']").click();
  await page.waitForURL(/\/dashboard/, { timeout: 30000 });

  mkdirSync(path.dirname(storagePath), { recursive: true });
  await context.storageState({ path: storagePath });
  await browser.close();
}
