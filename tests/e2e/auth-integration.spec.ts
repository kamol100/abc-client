import { expect, test } from "@playwright/test";

const authUsername = process.env.E2E_AUTH_USERNAME ?? "kamol";
const authPassword = process.env.E2E_AUTH_PASSWORD ?? "12345678";

test.describe("auth integration", () => {
  test("logs in with real backend credentials and reaches dashboard", async ({ page, context }) => {
    test.setTimeout(60000);

    await page.goto("/admin");

    const usernameInput = page.locator("#username");
    const passwordInput = page.locator("#password");
    await expect(usernameInput).toBeVisible({ timeout: 30000 });
    await expect(passwordInput).toBeVisible({ timeout: 30000 });

    await usernameInput.fill(authUsername);
    await passwordInput.fill(authPassword);

    const authCallbackResponse = page.waitForResponse((response) => {
      return (
        response.url().includes("/api/auth/callback/credentials") &&
        response.request().method() === "POST"
      );
    });

    await page.getByRole("button", { name: /login/i }).click();

    const callbackResponse = await authCallbackResponse;
    expect(callbackResponse.ok()).toBe(true);

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 30000 });

    const cookies = await context.cookies();
    const hasSessionCookie = cookies.some((cookie) =>
      cookie.name.includes("authjs.session-token")
    );
    expect(hasSessionCookie).toBe(true);
  });
});

