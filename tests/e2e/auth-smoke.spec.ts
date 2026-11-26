import { expect, test } from "@playwright/test";

test.describe("auth smoke", () => {
  // স্টাফ লগইনের ঠিকানা সফলভাবে খোলে এবং পেজ দেখা যায় কি না যাচাই করি।
  test("Staff login page: load /admin successfully", async ({ page }) => {
    const response = await page.goto("/admin");

    expect(response?.ok()).toBeTruthy();
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.locator("body")).toBeVisible();
  });

  // গ্রাহকের লগইন পেজ খোলে এবং লগইনের পর ফেরার ঠিকানা URL-এ থাকে কি না দেখি।
  test("Client login page: load /login and retain the requested return page", async ({ page }) => {
    const response = await page.goto("/login?callbackUrl=%2Fclient%2Fdashboard");

    expect(response?.ok()).toBeTruthy();
    await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fclient%2Fdashboard/);
    await expect(page.locator("body")).toBeVisible();
  });

  // পুরোনো গ্রাহক লগইন ঠিকানা থেকে বর্তমান লগইন পেজে পাঠায় কি না দেখি।
  test("Old client login link: redirect to the current /login page", async ({ page }) => {
    await page.goto("/client/login?callbackUrl=%2Fclient%2Fdashboard");

    await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fclient%2Fdashboard/);
    await expect(page.locator("body")).toBeVisible();
  });

  // লগইন ছাড়া ড্যাশবোর্ড খুললে স্টাফ লগইনে পাঠায় কি না যাচাই করি।
  test("Dashboard access while signed out: redirect to staff login", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page).toHaveURL(/\/admin\?callbackUrl=%2Fdashboard/);
    await expect(page.locator("body")).toBeVisible();
  });
});

