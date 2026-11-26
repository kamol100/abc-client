import {
  actorProfile,
  attemptLogin,
  expect,
  expectMenuName,
  loginToken,
  PLAN_DENIAL,
  readWithToken,
  requirePermissions,
  showStaffRow,
  staffDetail,
  staffList,
  staffPassword,
  staffSnapshot,
  tenantHost,
  test,
  withOwnedStaff,
} from "@/tests/e2e/staffs/fixtures";

// প্ল্যানে স্টাফ স্ট্যাটাস বদলের সুবিধা না থাকলে লক হয় না এবং লগইন চালু থাকে কি না দেখি।
test("FT090-01 Staff locking without plan access: reject the lock and keep login available", async ({ page, request, staff }) => {
  requirePermissions(staff, "staffs.edit", "staffs.access");
  const host = tenantHost(staff);
  await withOwnedStaff(staff, async (owned) => {
    const first = await attemptLogin(request, owned.username, owned.password, host);
    expect(first.status).toBe(200);
    const token = loginToken(first.body);
    expect((await readWithToken(request, token, "user-settings")).status).not.toBe(401);

    const denied = await staff.call(`staffs/${owned.record.id}/status`, "PUT", { status: "inactive" });
    expect(denied.status).toBe(402);
    expect(JSON.stringify(denied.body)).toContain("feature_not_in_plan");
    expect((await staffDetail(staff, owned.record.id)).status).toBe("active");

    const row = await showStaffRow(page, staff, owned.record);
    await row.getByRole("button", { name: "Lock account", exact: true }).click();
    await expect(page.getByText(PLAN_DENIAL, { exact: true })).toBeVisible();
    await expect(page.getByText("Staff account locked", { exact: true })).toHaveCount(0);
    await expect(row.getByText("Active", { exact: true })).toBeVisible();
    expect((await staffDetail(staff, owned.record.id)).status).toBe("active");
    expect((await readWithToken(request, token, "user-settings")).status).not.toBe(401);
    expect((await attemptLogin(request, owned.username, owned.password, host)).status).toBe(200);
  });
});

// নিজের লগইন করা স্টাফ অ্যাকাউন্ট লক করতে দেয় না এবং সক্রিয় রাখে কি না দেখি।
test("FT090-01 Lock your own staff account: reject the request and keep the account active", async ({ page, staff }) => {
  requirePermissions(staff, "staffs.edit", "staffs.access");
  const actor = await actorProfile(staff);
  if (!actor.staff?.id) throw new Error("Own-account lock needs the signed-in user to have a staff row.");
  const own = await staffDetail(staff, actor.staff.id);
  if (own.status === "inactive") throw new Error("Own-account lock needs the signed-in staff to be active.");
  if (own.user?.username !== actor.username) {
    throw new Error("Own-account lock needs the staff login to match the signed-in username.");
  }
  const denied = await staff.call(`staffs/${own.id}/status`, "PUT", { status: "inactive" });
  expect(denied.status).toBe(402);
  expect((await staffDetail(staff, own.id)).status).toBe("active");

  const row = await showStaffRow(page, staff, own);
  await expect(row.getByText("Active", { exact: true })).toBeVisible();
  await row.getByRole("button", { name: "Lock account", exact: true }).click();
  await expect(page.getByText(PLAN_DENIAL, { exact: true })).toBeVisible();
  await expect(page.getByText("You cannot change your own account status.", { exact: true })).toHaveCount(0);
  await expect(row.getByText("Active", { exact: true })).toBeVisible();
  expect((await staffDetail(staff, own.id)).status).toBe("active");
  expect((await staff.call("user-settings")).status).toBe(200);
});

// ছোট পাসওয়ার্ডে রিসেট আটকে দেয় এবং বাতিলের পর আগের পাসওয়ার্ড চলে কি না দেখি।
test("FT090-02 Staff password too short: reject the reset and retain the working password after cancel", async ({ page, request, staff }) => {
  requirePermissions(staff, "staffs.edit");
  const host = tenantHost(staff);
  await withOwnedStaff(staff, async (owned) => {
    const row = await showStaffRow(page, staff, owned.record);
    await row.getByRole("button", { name: "Reset password", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Reset password" });
    await expect(dialog.getByText(owned.record.name, { exact: true })).toBeVisible();
    await dialog.locator("#password").fill("short");
    await dialog.getByRole("button", { name: "Reset password", exact: true }).click();
    await expect(dialog.getByText("Password must be at least 8 characters", { exact: true })).toBeVisible();
    await expect(page.getByText("Password reset", { exact: true })).toHaveCount(0);
    await dialog.locator("#password").fill(staffPassword());
    await dialog.getByRole("button", { name: "Close", exact: true }).click();
    await expect(dialog).toBeHidden();
    const login = await attemptLogin(request, owned.username, owned.password, host);
    expect(login.status).toBe(200);
  });
});

// প্ল্যানে অনুমতি না থাকলে সঠিক পাসওয়ার্ড দিয়েও রিসেট হয় না এবং পুরোনোটি চলে কি না দেখি।
test("FT090-02 Password reset without plan access: reject the reset and retain the original password", async ({ page, request, staff }) => {
  requirePermissions(staff, "staffs.edit", "staffs.show");
  const host = tenantHost(staff);
  const actor = await actorProfile(staff);
  const unrelated = (await staffList(staff)).data.find((row) => row.id !== actor.staff?.id);
  const unrelatedBefore = unrelated ? staffSnapshot(await staffDetail(staff, unrelated.id)) : null;
  await withOwnedStaff(staff, async (owned) => {
    const opened = await attemptLogin(request, owned.username, owned.password, host);
    expect(opened.status).toBe(200);
    const token = loginToken(opened.body);
    const nextPassword = staffPassword();
    const denied = await staff.call(`staffs/${owned.record.id}/password`, "PUT", { password: nextPassword });
    expect(denied.status).toBe(402);
    expect(JSON.stringify(denied.body)).toContain("feature_not_in_plan");

    const row = await showStaffRow(page, staff, owned.record);
    await row.getByRole("button", { name: "Reset password", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Reset password" });
    await dialog.locator("#password").fill(nextPassword);
    await dialog.getByRole("button", { name: "Reset password", exact: true }).click();
    await expect(page.getByText(PLAN_DENIAL, { exact: true })).toBeVisible();
    await expect(page.getByText("Password reset", { exact: true })).toHaveCount(0);
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Close", exact: true }).click();

    expect((await attemptLogin(request, owned.username, owned.password, host)).status).toBe(200);
    expect((await readWithToken(request, token, "user-settings")).status).not.toBe(401);
    expect((await attemptLogin(request, owned.username, nextPassword, host)).status).toBe(401);
    expect((await staff.call("user-settings")).status).toBe(200);
    if (unrelatedBefore) {
      expect(staffSnapshot(await staffDetail(staff, unrelatedBefore.id))).toEqual(unrelatedBefore);
    }
  });
});

// স্টাফে সুইচ করলে সঠিক পরিচয়ে ঢোকে এবং বের হলে আগের ব্যবহারকারী ফিরে আসে কি না দেখি।
test("FT090-03 Switch to a staff account: enter that identity and return to the original user on leave", async ({ page, staff }) => {
  requirePermissions(staff, "impersonate.staff", "staffs.access");
  const actor = await actorProfile(staff);
  await withOwnedStaff(staff, async (owned) => {
    const row = await showStaffRow(page, staff, owned.record);
    await row.getByRole("button", { name: "Login as this staff member", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Login as this staff member" });
    await expect(dialog.getByText(
      `Log in as ${owned.record.name}? You can switch back to your account afterward.`,
      { exact: true },
    )).toBeVisible();
    await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByText("Impersonating", { exact: true })).toHaveCount(0);
    await expectMenuName(page, actor.name);
    await page.keyboard.press("Escape");

    await row.getByRole("button", { name: "Login as this staff member", exact: true }).click();
    await page.getByRole("dialog", { name: "Login as this staff member" }).getByRole("button", { name: "Login", exact: true }).click();
    await expect(page.getByText("Impersonating", { exact: true })).toBeVisible();
    await expectMenuName(page, owned.record.name);
    await page.keyboard.press("Escape");

    await page.getByRole("button").filter({ hasText: "Impersonating" }).click();
    await page.getByRole("menuitem", { name: "Exit Impersonation", exact: true }).click();
    await expect(page.getByText("Impersonating", { exact: true })).toHaveCount(0);
    await expectMenuName(page, actor.name);
    await page.keyboard.press("Escape");
    await page.reload();
    const menu = page.getByRole("button", { name: "User menu", exact: true });
    const broken = page.getByRole("heading", { name: /This page couldn.t load|502 Bad Gateway/ });
    await expect(menu.or(broken)).toBeVisible();
    if (await broken.isVisible()) await page.getByRole("button", { name: "Reload", exact: true }).click();
    await expect(menu).toBeVisible();
    await expect(page.getByText("Impersonating", { exact: true })).toHaveCount(0);
    await expectMenuName(page, actor.name);
    expect((await staff.call("user-settings")).status).toBe(200);
    const actorAgain = await actorProfile(staff);
    expect(actorAgain.username).toBe(actor.username);
    expect(actorAgain.name).toBe(actor.name);
  });
});

// স্টাফ অ্যাকাউন্টের ডিলিট বাতিল করলে অ্যাকাউন্টটি থেকে যায় কি না দেখি।
test("FT090-11 Cancel staff deletion: keep the staff account", async ({ page, staff }) => {
  requirePermissions(staff, "staffs.delete", "staffs.show");
  const actor = await actorProfile(staff);
  const listed = await staffList(staff);
  const target = listed.data.find((row) => row.user?.username && row.user.username !== actor.username);
  if (!target) throw new Error("Delete cancel needs a staff row other than the signed-in user.");
  const before = await staffDetail(staff, target.id);
  const row = await showStaffRow(page, staff, before);
  await row.getByRole("button").last().click();
  const dialog = page.getByRole("dialog", { name: "Confirm Delete" });
  await expect(dialog.getByText("Are you sure you want to delete this item? This action cannot be undone.")).toBeVisible();
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(dialog).toBeHidden();
  await row.getByRole("button").last().click();
  await expect(page.getByRole("dialog", { name: "Confirm Delete" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Confirm Delete" })).toBeHidden();
  expect(staffSnapshot(await staffDetail(staff, before.id))).toEqual(staffSnapshot(before));
  expect((await staffList(staff)).data.some((row) => row.id === before.id)).toBe(true);
});
