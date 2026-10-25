import { expect, test } from "@playwright/test";

test.describe("auth smoke", () => {
  test("loads admin login page", async ({ page }) => {
    const response = await page.goto("/admin");

    expect(response?.ok()).toBeTruthy();
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("loads the client login page at /login", async ({ page }) => {
    const response = await page.goto("/login?callbackUrl=%2Fclient%2Fdashboard");

    expect(response?.ok()).toBeTruthy();
    await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fclient%2Fdashboard/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("redirects the old client login route to /login", async ({ page }) => {
    await page.goto("/client/login?callbackUrl=%2Fclient%2Fdashboard");

    await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fclient%2Fdashboard/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("redirects unauthenticated dashboard access to admin", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page).toHaveURL(/\/admin\?callbackUrl=%2Fdashboard/);
    await expect(page.locator("body")).toBeVisible();
  });
});

