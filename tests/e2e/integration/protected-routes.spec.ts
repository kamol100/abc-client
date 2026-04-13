import { expect, test } from "@playwright/test";

import { expectRedirectToLoginWithCallback } from "@/tests/e2e/helpers/auth";

test.describe("Protected route behavior (unauthenticated)", () => {
  test("redirects /dashboard to login with callback", async ({ page }) => {
    await page.goto("/dashboard");
    await expectRedirectToLoginWithCallback(page, "/dashboard");
  });

  test("redirects /zones query route to login with callback", async ({ page }) => {
    await page.goto("/zones?page=2&keyword=north");
    await expectRedirectToLoginWithCallback(page, "/zones?page=2&keyword=north");
  });

  test("redirects /users to login with callback", async ({ page }) => {
    await page.goto("/users");
    await expectRedirectToLoginWithCallback(page, "/users");
  });

  test("keeps root page public when unauthenticated", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Welcome to ISPTik")).toBeVisible();
  });

  test("redirects legacy /login route to /admin", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveURL(/\/admin$/);
  });
});
