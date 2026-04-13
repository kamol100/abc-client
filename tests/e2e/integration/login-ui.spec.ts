import { expect, test } from "@playwright/test";

import {
  expectLoginSuccessRedirect,
  loginFromUI,
} from "@/tests/e2e/helpers/auth";

test.describe("Login user flow", () => {
  test("logs in and redirects to requested callback route", async ({ page }) => {
    await loginFromUI(page, { callbackUrl: "/zones" });
    await expectLoginSuccessRedirect(page, "/zones");
  });

  test("shows auth error and stays on /admin with invalid password", async ({
    page,
  }) => {
    await loginFromUI(page, {
      callbackUrl: "/dashboard",
      credentials: { password: "wrong-password" },
    });

    await page.waitForURL((url) => url.pathname === "/admin", { timeout: 30000 });
    const currentUrl = new URL(page.url());
    expect(currentUrl.pathname).toBe("/admin");
    expect(currentUrl.searchParams.get("callbackUrl")).toBe("/dashboard");
    expect(currentUrl.pathname).not.toBe("/dashboard");
  });
});
