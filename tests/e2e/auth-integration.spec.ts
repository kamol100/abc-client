import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "@/tests/e2e/helpers/auth";

test.describe("auth integration", () => {
  // সঠিক স্টাফ পরিচয় দিয়ে লগইন করলে ড্যাশবোর্ড খোলে কি না যাচাই করি।
  test("Staff login: accept valid credentials and open the dashboard", async ({ page, context }) => {
    test.setTimeout(90000);

    await loginAsAdmin(page);

    const cookies = await context.cookies();
    expect(
      cookies.some((cookie) => cookie.name.includes("authjs.session-token"))
    ).toBe(true);
    await expect(
      page.getByRole("navigation", { name: "breadcrumb" }).getByText("Dashboard")
    ).toBeVisible();
  });
});

