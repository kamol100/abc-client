import { randomBytes, randomUUID } from "node:crypto";
import {
  chooseExactOption,
  companyRoles,
  companyZones,
  deleteOwnedStaff,
  deleteStaffNamed,
  expect,
  expectLoginForm,
  openCreate,
  requirePermissions,
  staffDetail,
  staffList,
  staffPassword,
  staffRow,
  staffSnapshot,
  test,
  uniqueChoice,
  withOwnedStaff,
  type Staff,
} from "@/tests/e2e/staffs/fixtures";

function phoneNumber(): string {
  const digits = Array.from(randomBytes(8), (byte) => String(byte % 10)).join("");
  return `018${digits}`;
}

// স্টাফের নাম না দিলে ও ছোট ফোন নম্বরে ত্রুটি দেখিয়ে ফর্ম খোলা রাখে কি না দেখি।
test("FT090-07 Invalid staff details: show errors for a missing name and short phone number", async ({ page, staff }) => {
  requirePermissions(staff, "staffs.access");
  const before = await staffList(staff);
  await openCreate(page);
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText("Name is required", { exact: true })).toBeVisible();
  await expect(page.locator("#phone").locator("xpath=following-sibling::p")).toHaveText("Required");
  await expect(page).toHaveURL(/\/staffs\/create$/);

  await page.locator("#name").fill("A");
  await page.locator("#phone").fill("0170000000");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText("Name must be at least 2 characters long", { exact: true })).toBeVisible();
  await expect(page.getByText("Phone number must be at least 11 digits", { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/staffs\/create$/);
  expect((await staffList(staff)).pagination.total).toBe(before.pagination.total);
});

// ২৫৬ অক্ষরের ইউজারনেমে ত্রুটি দেখায় এবং স্টাফ তৈরি হয় না কি না দেখি।
test("FT090-07 Staff username too long: reject 256 characters without creating an account", async ({ page, staff }) => {
  requirePermissions(staff, "staffs.access");
  const before = await staffList(staff);
  const username = `e2e${"x".repeat(253)}`;
  expect(username).toHaveLength(256);
  await openCreate(page);
  await page.locator("#name").fill("E2E Length");
  await page.locator("#username").fill(username);
  await page.locator("#password").fill(staffPassword());
  await page.locator("#phone").fill(phoneNumber());
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page).toHaveURL(/\/staffs\/create$/);
  await expect(page.getByText(/255/).first()).toBeVisible();
  await expect(page.locator("#username")).toHaveValue(username);
  expect((await staffList(staff)).pagination.total).toBe(before.pagination.total);
});

// আগে থাকা ইউজারনেমে নতুন স্টাফ তৈরি করতে দেয় না কি না দেখি।
test("FT090-07 Duplicate staff username: reject the request without creating another account", async ({ page, staff }) => {
  requirePermissions(staff, "staffs.create", "staffs.access");
  await withOwnedStaff(staff, async (owned) => {
    const before = await staffList(staff);
    await openCreate(page);
    await page.locator("#name").fill(`E2E Duplicate ${randomUUID().slice(0, 8)}`);
    await page.locator("#username").fill(owned.username);
    await page.locator("#password").fill(staffPassword());
    await page.locator("#phone").fill(phoneNumber());
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page).toHaveURL(/\/staffs\/create$/);
    const taken = "The username has already been taken within this company.";
    await expect(page.getByTitle(taken)).toBeVisible();
    await expect(page.getByRole("alert").filter({ hasText: taken })).toBeVisible();
    const after = await staffList(staff);
    expect(after.pagination.total).toBe(before.pagination.total);
    expect(after.data.filter((row) => row.user?.username === owned.username)).toHaveLength(1);
  });
});

// নতুন স্টাফের ফর্ম বাতিল করলে কোনো অ্যাকাউন্ট সেভ হয় না কি না দেখি।
test("FT090-06 Cancel new staff: return without saving an account", async ({ page, staff }) => {
  requirePermissions(staff, "staffs.access");
  const before = await staffList(staff);
  const name = `E2E Cancel ${randomUUID().slice(0, 8)}`;
  const username = `e2e${randomBytes(6).toString("hex")}`;
  await openCreate(page);
  await page.locator("#name").fill(name);
  await page.locator("#username").fill(username);
  await page.locator("#password").fill(staffPassword());
  await page.locator("#phone").fill(phoneNumber());
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page).toHaveURL(/\/staffs$/);
  const after = await staffList(staff);
  expect(after.pagination.total).toBe(before.pagination.total);
  expect(after.data.some((row) => row.user?.username === username || row.name === name)).toBe(false);
});

// স্টাফ এডিটে সংরক্ষিত তথ্য আসে এবং বাতিল করলে আগের তথ্য থাকে কি না দেখি।
test("FT090-06 Edit staff: load saved details and preserve them when cancelled", async ({ page, staff }) => {
  requirePermissions(staff, "staffs.show", "staffs.edit");
  const listed = await staffList(staff);
  const row = listed.data.find((item) => item.user?.username);
  if (!row) throw new Error("Edit cancel needs a staff member with a username.");
  const before = await staffDetail(staff, row.id);
  await page.goto("/staffs");
  await staffRow(page, before).locator(`a[href="/staffs/edit/${before.id}"]`).click();
  await expect(page).toHaveURL(new RegExp(`/staffs/edit/${before.id}$`));
  await expect(page.locator("#name")).toHaveValue(before.name);
  await expect(page.locator("#phone")).toHaveValue(before.phone ?? "");
  await expect(page.locator("#designation")).toHaveValue(before.designation ?? "");
  await expect(page.locator("#name")).not.toHaveValue(/null|undefined/);
  if (before.gender === "male" || before.gender === "female") {
    await expect(page.locator(`#gender-${before.gender}`)).toBeChecked();
  }
  for (const zone of before.zones ?? []) {
    await expect(page.getByText(zone.name, { exact: true }).first()).toBeVisible();
  }
  const draft = `E2E Draft ${randomUUID().slice(0, 8)}`;
  await page.locator("#designation").fill(draft);
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page).toHaveURL(/\/staffs$/);
  expect(staffSnapshot(await staffDetail(staff, before.id))).toEqual(staffSnapshot(before));
});

// সঠিক স্টাফ তৈরি হয় এবং পরে বদলানো পদবি রিলোডের পরও থাকে কি না দেখি।
test("FT090-06 Create and edit staff: save the account and retain its updated designation after reload", async ({ page, staff }) => {
  requirePermissions(staff, "staffs.create", "staffs.edit", "staffs.show", "staffs.delete");
  const role = uniqueChoice(await companyRoles(staff), "Staff create role");
  const zones = await companyZones(staff);
  const zone = zones.length ? uniqueChoice(zones, "Staff create zone") : null;
  const username = `e2e${randomBytes(6).toString("hex")}`;
  const name = `E2E Saved ${randomUUID().slice(0, 8)}`;
  const phone = phoneNumber();
  const designation = "E2E Saved Clerk";
  let createdId = "";
  try {
    await openCreate(page);
    await page.locator("#name").fill(name);
    await page.locator("#username").fill(username);
    await page.locator("#password").fill(staffPassword());
    await page.locator("#phone").fill(phone);
    await page.locator("#designation").fill(designation);
    await page.locator("#gender-male").click();
    await chooseExactOption(page, "roles_id", role.name);
    if (zone) await chooseExactOption(page, "zone_ids", zone.name);
    const save = page.getByRole("button", { name: "Save", exact: true });
    await save.click();
    if (await save.isVisible()) await save.click();
    await expect(page).toHaveURL(/\/staffs$/);
    await expect.poll(async () => {
      const match = (await staffList(staff)).data.find((row) => row.user?.username === username);
      createdId = match?.id ?? "";
      return createdId;
    }).not.toBe("");
    const saved = await staffDetail(staff, createdId);
    expect(saved.name).toBe(name);
    expect(saved.phone).toBe(phone);
    expect(saved.designation).toBe(designation);
    expect(saved.user?.username).toBe(username);
    expect((saved.roles ?? []).some((item) => item.id === role.id)).toBe(true);
    if (zone) expect((saved.zones ?? []).some((item) => item.id === zone.id)).toBe(true);
    expect((await staffList(staff)).data.filter((row) => row.user?.username === username)).toHaveLength(1);

    const edited = `E2E Edited ${randomUUID().slice(0, 8)}`;
    await page.goto(`/staffs/edit/${createdId}`);
    await expect(page.locator("#name")).toHaveValue(name);
    await expect(page.locator("#phone")).toHaveValue(phone);
    await page.locator("#designation").fill(edited);
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page).toHaveURL(/\/staffs$/);
    await page.goto(`/staffs/edit/${createdId}`);
    await expect(page.locator("#designation")).toHaveValue(edited);
    const reread = await staffDetail(staff, createdId);
    expect(reread.designation).toBe(edited);
    expect(reread.name).toBe(name);
    expect(reread.phone).toBe(phone);
  } finally {
    if (createdId) await deleteOwnedStaff(staff, createdId);
    else await deleteStaffNamed(staff, username);
  }
});

// স্টাফের জোন ও বেতনের লাইন এডিটে আসে এবং বাতিল করলে অপরিবর্তিত থাকে কি না দেখি।
test("FT090-03 Staff zones and salary lines: load saved values and retain them when editing is cancelled", async ({ page, staff }) => {
  requirePermissions(staff, "staffs.show", "staffs.edit");
  await withOwnedStaff(staff, async (owned) => {
    if (!owned.zone) throw new Error("Zone persistence needs a company zone.");
    const before = await staffDetail(staff, owned.record.id);
    expect((before.zones ?? []).some((zone) => zone.id === owned.zone?.id)).toBe(true);
    expect(before.salary_items ?? []).toEqual([
      expect.objectContaining(owned.salaryItem),
    ]);
    expect(before.salary_deductions ?? []).toEqual([
      expect.objectContaining(owned.deduction),
    ]);
    await page.goto(`/staffs/edit/${before.id}`);
    await expect(page.locator("#name")).toHaveValue(before.name);
    await expect(page.getByText(owned.zone.name, { exact: true }).first()).toBeVisible();
    await expect(page.getByText(owned.role.name, { exact: true }).first()).toBeVisible();
    await page.getByRole("button", { name: "Salary Information" }).click();
    await expect(page.locator('[id="salary_items.0.items_label"]')).toHaveValue(owned.salaryItem.items_label);
    await expect(page.locator('[id="salary_items.0.items_value"]')).toHaveValue(String(owned.salaryItem.items_value));
    await expect(page.locator('[id="salary_deductions.0.deductions_label"]')).toHaveValue(owned.deduction.deductions_label);
    await expect(page.locator('[id="salary_deductions.0.deductions_value"]')).toHaveValue(String(owned.deduction.deductions_value));
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(page).toHaveURL(/\/staffs$/);
    expect(staffSnapshot(await staffDetail(staff, before.id))).toEqual(staffSnapshot(before));
  });
});

// ভুল স্টাফ ফর্ম দুবার সেভ করলেও কোনো অ্যাকাউন্ট তৈরি হয় না কি না দেখি।
test("FT090-11 Repeat invalid staff save: create no account after two submissions", async ({ page, staff }) => {
  requirePermissions(staff, "staffs.access");
  const before = await staffList(staff);
  await openCreate(page);
  const save = page.getByRole("button", { name: "Save", exact: true });
  await save.click();
  await save.click();
  await expect(page.getByText("Name is required", { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/staffs\/create$/);
  expect((await staffList(staff)).pagination.total).toBe(before.pagination.total);
});

// নতুন স্টাফের ফর্মে লেখা অবস্থায় বের হলে খসড়া সেভ হয় না কি না দেখি।
test("FT090-11 Leave the new staff form: discard the unsaved draft", async ({ page, staff }) => {
  requirePermissions(staff, "staffs.access");
  const before = await staffList(staff);
  const username = `e2e${randomBytes(6).toString("hex")}`;
  await openCreate(page);
  await page.locator("#name").fill(`E2E Interrupted ${randomUUID().slice(0, 8)}`);
  await page.locator("#username").fill(username);
  await page.locator("#phone").fill(phoneNumber());
  await page.getByRole("button", { name: /user menu/i }).click();
  await page.getByText("Sign out", { exact: true }).click();
  await expectLoginForm(page);
  const after = await staffList(staff);
  expect(after.pagination.total).toBe(before.pagination.total);
  expect(after.data.some((row: Staff) => row.user?.username === username)).toBe(false);
});
