import { expect, test } from "@playwright/test";

test.describe("auth smoke", () => {
  test("loads admin login page", async ({ page }) => {
    const response = await page.goto("/admin");

    expect(response?.ok()).toBeTruthy();
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("redirects legacy login route to admin", async ({ page }) => {
    await page.goto("/login?callbackUrl=%2Fdashboard");

    await expect(page).toHaveURL(/\/admin\?callbackUrl=%2Fdashboard/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("redirects unauthenticated dashboard access to admin", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page).toHaveURL(/\/admin\?callbackUrl=%2Fdashboard/);
    await expect(page.locator("body")).toBeVisible();
  });
});

