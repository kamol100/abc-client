import { expect, requirePermissions, test } from "@/tests/e2e/platform-support/fixtures";

// প্রকাশিত হেল্প লেখা দেখা যায়, ভাষা বদলায় এবং অজানা আর্টিকেল দেখায় না কি না দেখি।
test("PS-E14 Help articles: show published content, switch language, and hide unknown articles", async ({ page, staff }) => {
  requirePermissions(staff, "platform-support.access");
  await page.goto("/help");
  await expect(page.getByRole("heading", { name: "Help", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Getting started" }).click();
  await expect(page).toHaveURL(/\/help\/support\/getting-started$/);
  await expect(page.getByRole("heading", { name: "Getting started", exact: true })).toBeVisible();
  await expect(page.getByRole("article").getByText("Support Tickets")).toBeVisible();

  await page.getByRole("button", { name: "বাংলা", exact: true }).click();
  await expect(page.getByRole("heading", { name: "শুরু করা", exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/help\/support\/getting-started$/);
  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Getting started", exact: true })).toBeVisible();

  await page.goto("/help");
  await page.getByRole("tab", { name: "FAQs" }).click();
  await expect(page.getByRole("link").first()).toBeVisible();
  await page.getByRole("tab", { name: "Videos" }).click();
  await expect(page.getByText("No video is configured.", { exact: true })).toBeVisible();

  const query = "q".repeat(81);
  await page.goto("/help");
  await page.locator("#help-search").fill(query);
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.locator("p[role='alert']")).toContainText("Help could not be loaded.");
  await expect(page.getByRole("heading", { name: query })).toHaveCount(0);

  const missing = await page.goto("/help/not-a-published-article");
  expect(missing?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Getting started", exact: true })).toHaveCount(0);
});

// কোম্পানির হেল্পে প্ল্যাটফর্মের নিজস্ব গাইড লুকায় এবং পেজ কনটেক্সট বন্ধ থাকে কি না দেখি।
test("PS-E15 Company help: hide the platform-only guide and keep page context disabled", async ({ page, staff }) => {
  requirePermissions(staff, "platform-support.access");
  if (staff.profile.permissions.includes("platform-support-admin.access")) {
    throw new Error("Selected company persona includes platform-support-admin.access, so it cannot prove a tenant guide hide.");
  }
  const hidden = await page.goto("/help/platform/inbox");
  expect(hidden?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Platform inbox", exact: true })).toHaveCount(0);

  await page.goto("/clients");
  await page.getByTestId("platform-support-launcher").click();
  const include = page.getByTestId("help-include-page");
  await expect(include).not.toBeChecked();
  await expect(page.getByTestId("help-include-path")).toHaveCount(0);
  await expect(page.getByText("Query strings, hashes, and form values are left out.")).toBeVisible();
});
