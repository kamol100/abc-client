import { expect, type Page } from "@playwright/test";

export const authUsername = process.env.E2E_AUTH_USERNAME ?? "kamol";
export const authPassword = process.env.E2E_AUTH_PASSWORD ?? "12345678";

export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto("/admin");

  const usernameInput = page.locator("#username");
  const passwordInput = page.locator("#password");
  await expect(usernameInput).toBeVisible({ timeout: 30000 });
  await expect(passwordInput).toBeVisible({ timeout: 30000 });

  await usernameInput.fill(authUsername);
  await passwordInput.fill(authPassword);

  const authCallbackResponse = page.waitForResponse(
    (response) =>
      response.url().includes("/api/auth/callback/credentials") &&
      response.request().method() === "POST"
  );

  await page.getByRole("button", { name: /login/i }).click();

  const callbackResponse = await authCallbackResponse;
  expect(callbackResponse.ok()).toBe(true);

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 30000 });
}
