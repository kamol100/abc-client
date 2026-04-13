import { expect, test } from "@/tests/e2e/fixtures/authenticated";

test.describe.configure({ timeout: 120000 });

test.describe("Authenticated end-to-end navigation", () => {
  test("redirects authenticated root access to dashboard", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("opens core protected routes without redirecting to login", async ({
    page,
  }) => {
    const routes = ["/dashboard", "/zones"];

    for (const route of routes) {
      await page.goto(route);
      const currentUrl = new URL(page.url());
      expect(currentUrl.pathname).toBe(route);
      await expect(page).not.toHaveURL(/\/admin/);
    }
  });

  test("keeps authenticated access with route query state", async ({ page }) => {
    await page.goto("/zones?page=1&keyword=zone");

    const currentUrl = new URL(page.url());
    expect(currentUrl.pathname).toBe("/zones");
    expect(currentUrl.searchParams.get("page")).toBe("1");
    expect(currentUrl.searchParams.get("keyword")).toBe("zone");
  });
});
