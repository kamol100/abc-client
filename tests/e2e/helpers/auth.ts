import { expect, type Page } from "@playwright/test";

export const authUsername = process.env.E2E_AUTH_USERNAME ?? "vp";
export const authPassword = process.env.E2E_AUTH_PASSWORD ?? "12345678";

export async function loginAsAdmin(page: Page): Promise<void> {
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt += 1) {
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

    try {
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 20000 });
      return;
    } catch (error) {
      lastError = error;
      const csrfMismatch = page.url().includes("error=MissingCSRF");
      if (!csrfMismatch || attempt === 1) {
        throw error;
      }
    }
  }

  throw lastError;
}
