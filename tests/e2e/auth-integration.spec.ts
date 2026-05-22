import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "@/tests/e2e/helpers/auth";

test.describe("auth integration", () => {
  test("logs in with real backend credentials and reaches dashboard", async ({ page, context }) => {
    test.setTimeout(60000);

    await loginAsAdmin(page);

    const cookies = await context.cookies();
    const hasSessionCookie = cookies.some((cookie) =>
      cookie.name.includes("authjs.session-token")
    );
    expect(hasSessionCookie).toBe(true);
  });
});

