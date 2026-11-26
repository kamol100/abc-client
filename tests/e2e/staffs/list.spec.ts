import {
  actorProfile,
  expect,
  expectStaffRows,
  listTitle,
  openStaffList,
  requirePermissions,
  staffDetail,
  staffList,
  test,
} from "@/tests/e2e/staffs/fixtures";

// API-এর স্টাফ তালিকায় আসে এবং রিলোডের পরও দেখা যায় কি না যাচাই করি।
test("FT090-04 Staff list: show saved staff and keep them visible after reload", async ({ page, staff }) => {
  const listed = await staffList(staff);
  if (!listed.pagination.total) throw new Error("Staff list checks need at least one staff member.");
  await openStaffList(page, listed);
  await page.reload();
  const reloaded = await staffList(staff);
  expect(reloaded.pagination.total).toBe(listed.pagination.total);
  expect(reloaded.data.map((row) => row.id)).toEqual(listed.data.map((row) => row.id));
  await expect(page.getByText(listTitle(reloaded.pagination.total), { exact: true })).toBeVisible();
  await expectStaffRows(page, reloaded.data);
});

// স্টাফ তৈরির সরাসরি পেজ ও রিলোডের পর ফর্ম দেখা যায় কি না দেখি।
test("FT090-04 New staff page: show the create form before and after reload", async ({ page, staff }) => {
  requirePermissions(staff, "staffs.access");
  await page.goto("/staffs/create");
  await expect(page.getByRole("button", { name: "Basic Information" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Salary Information" })).toBeVisible();
  await expect(page.locator("#name")).toBeVisible();
  await expect(page.locator("#phone")).toBeVisible();
  await expect(page.locator("#gender-male")).toBeChecked();
  await expect(page.getByRole("button", { name: "Save", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Cancel", exact: true })).toBeVisible();
  await page.reload();
  if (await page.getByRole("heading", { name: "502 Bad Gateway" }).count()) {
    await page.reload();
  }
  await expect(page.getByRole("button", { name: "Basic Information" })).toBeVisible();
  await expect(page.locator("#name")).toBeVisible();
  await expect(page.locator("#name")).toHaveValue("");
});

// স্টাফের সরাসরি এডিট পেজ ও রিলোডে সংরক্ষিত নাম আসে কি না দেখি।
test("FT090-04 Edit staff page: load the saved name before and after reload", async ({ page, staff }) => {
  requirePermissions(staff, "staffs.show", "staffs.edit");
  const listed = await staffList(staff);
  const row = listed.data.find((item) => item.user?.username);
  if (!row) throw new Error("Edit route needs a staff member with a username.");
  const detail = await staffDetail(staff, row.id);
  await page.goto(`/staffs/edit/${detail.id}`);
  await expect(page.locator("#name")).toHaveValue(detail.name);
  await expect(page.locator("#phone")).toHaveValue(detail.phone ?? "");
  await expect(page.locator("#username")).toHaveCount(0);
  await expect(page.locator("#password")).toHaveCount(0);
  await page.reload();
  await expect(page.locator("#name")).toHaveValue(detail.name);
  await expect(page).toHaveURL(new RegExp(`/staffs/edit/${detail.id}$`));
});

// প্রথম পেজে Previous বন্ধ থাকে এবং শিরোনামে পুরো স্টাফের সংখ্যা দেখায় কি না দেখি।
test("FT090-05 Staff pagination: disable Previous on page one and show the complete staff count", async ({ page, staff }) => {
  const listed = await staffList(staff);
  if (!listed.pagination.total) throw new Error("Pagination checks need at least one staff member.");
  await openStaffList(page, listed);
  await expect(page.getByRole("button", { name: "Go to previous page" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Go to first page" })).toBeDisabled();
  expect(listed.data.length).toBeLessThanOrEqual(listed.pagination.total);
  if (listed.pagination.total_pages < 2) {
    await expect(page.getByRole("button", { name: "Go to next page" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Go to last page" })).toBeDisabled();
    expect(listed.data.length).toBe(listed.pagination.total);
    return;
  }
  expect(listed.data.length).toBeLessThan(listed.pagination.total);
  const second = await staffList(staff, "page=2");
  expect(second.pagination.current_page).toBe(2);
  expect(second.data.every((row) => !listed.data.some((first) => first.id === row.id))).toBe(true);
  await page.getByRole("button", { name: "Go to next page" }).click();
  await expect(page.getByText(listTitle(second.pagination.total), { exact: true })).toBeVisible();
  await expectStaffRows(page, second.data);
  await page.getByRole("button", { name: "Go to previous page" }).click();
  await expectStaffRows(page, listed.data);
});

// স্টাফ তালিকায় আগে সেভ করা প্রতি পেজের সারিসংখ্যা দেখায় কি না দেখি।
test("FT090-05 Staff page size: show the saved rows-per-page preference", async ({ page, staff }) => {
  const profile = await actorProfile(staff);
  const size = profile.staff?.item_per_page ?? 10;
  await page.goto("/staffs");
  await expect(page.locator("#results-per-page")).toContainText(`${size} / page`);
  await expect(page.locator("#results-per-page")).toBeVisible();
  const after = await actorProfile(staff);
  expect(after.staff?.item_per_page ?? 10).toBe(size);
});

// কলামের নিয়ন্ত্রণ দিয়ে স্টাফের পদবি লুকানো ও আবার দেখানো যায় কি না দেখি।
test("FT090-05 Staff designation column: hide it and show it again using column controls", async ({ page, staff }) => {
  const listed = await staffList(staff);
  if (!listed.data.length) throw new Error("Column visibility needs a visible staff row.");
  await openStaffList(page, listed);
  const view = page.locator("button", { hasText: /^View$/ });
  await expect(view).toHaveCount(1);
  const designation = page.getByRole("menuitemcheckbox", { name: "Designation", exact: true });
  const header = page.getByRole("columnheader", { name: "Designation", exact: true });
  await view.click();
  await expect(designation).toBeVisible();
  await designation.click();
  await expect(header).toHaveCount(0);
  await expect(page.getByRole("columnheader", { name: "Name", exact: true })).toBeVisible();
  await view.click();
  await designation.click();
  await expect(header).toBeVisible();
  await expectStaffRows(page, listed.data);
});
