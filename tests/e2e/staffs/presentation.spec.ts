import {
  expect,
  listTitle,
  openCreate,
  staffList,
  test,
} from "@/tests/e2e/staffs/fixtures";

test("FT090-10 the staff list shows rows instead of a request failure", async ({ page, staff }) => {
  const listed = await staffList(staff);
  if (!listed.pagination.total) throw new Error("The loaded staff list needs at least one staff member.");
  await page.goto("/staffs");
  await expect(page.getByText(listTitle(listed.pagination.total), { exact: true })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Name", exact: true })).toBeVisible();
  await expect(page.getByText("No results", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Request failed", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Failed to load data", { exact: true })).toHaveCount(0);
  await page.reload();
  await expect(page.getByText(listTitle(listed.pagination.total), { exact: true })).toBeVisible();
  await expect(page.getByText("Request failed", { exact: true })).toHaveCount(0);
});

test("FT090-12 mobile width, Bangla, dark mode, and keyboard keep staff controls usable", async ({ page, staff }) => {
  const listed = await staffList(staff);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/staffs");
  await expect(page.locator('a[href="/staffs/create"]')).toBeVisible();
  const mobileName = page.getByRole("columnheader", { name: "Name", exact: true });
  try {
    await expect(mobileName).toBeVisible({ timeout: 8_000 });
  } catch {
    await page.reload();
    await expect(page.locator('a[href="/staffs/create"]')).toBeVisible();
    await expect(mobileName).toBeVisible();
  }
  await page.getByRole("radio", { name: "Bangla", exact: true }).click();
  await expect(page.getByRole("columnheader", { name: "নাম", exact: true })).toBeVisible();
  await page.getByRole("radio", { name: "English", exact: true }).click();
  await expect(page.getByRole("columnheader", { name: "Name", exact: true })).toBeVisible();

  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(page.getByText(listTitle(listed.pagination.total), { exact: true })).toBeVisible();
  await page.getByRole("radio", { name: "Bangla", exact: true }).click();
  const banglaTitle = listed.pagination.total ? `স্টাফ (${listed.pagination.total})` : "স্টাফ";
  await expect(page.getByText(banglaTitle, { exact: true })).toBeVisible();
  await page.getByRole("radio", { name: "English", exact: true }).click();
  await expect(page.getByText(listTitle(listed.pagination.total), { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Customize theme", exact: true }).click();
  await page.getByRole("radio", { name: "Dark", exact: true }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(page.getByText(listTitle(listed.pagination.total), { exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await page.reload();
  const nameHeader = page.getByRole("columnheader", { name: "Name", exact: true });
  try {
    await expect(page.locator("html")).toHaveClass(/dark/);
    await expect(nameHeader).toBeVisible({ timeout: 8_000 });
  } catch {
    await page.reload();
    await expect(page.locator("html")).toHaveClass(/dark/);
    await expect(nameHeader).toBeVisible();
  }

  await openCreate(page);
  await page.locator("#name").focus();
  await expect(page.locator("#name")).toBeFocused();
  await page.keyboard.type("A");
  await expect(page.locator("#name")).toHaveValue("A");
  await page.keyboard.press("Tab");
  await page.getByRole("button", { name: "Cancel", exact: true }).focus();
  await expect(page.getByRole("button", { name: "Cancel", exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/staffs$/);
  expect((await staffList(staff)).pagination.total).toBe(listed.pagination.total);
  await expect(page.getByText("Password reset", { exact: true })).toHaveCount(0);
});
