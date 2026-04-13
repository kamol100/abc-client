import { expect, test } from "@/tests/e2e/fixtures/authenticated";

test.describe.configure({ timeout: 120000 });

test.describe("Authenticated auth-guard behavior", () => {
  test("redirects /admin away for authenticated user", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("redirects legacy /login away for authenticated user", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
