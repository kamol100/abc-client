import { chromium, type FullConfig } from "@playwright/test";
import { loginAsAdmin } from "@/tests/e2e/helpers/auth";

const authFile = "playwright/.auth/user.json";

export default async function globalSetup(config: FullConfig): Promise<void> {
  const baseURL = config.projects[0]?.use?.baseURL ?? "http://localhost:3000";
  const browser = await chromium.launch();
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();

  await loginAsAdmin(page);
  await context.storageState({ path: authFile });

  await browser.close();
}
