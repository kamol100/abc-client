import { randomUUID } from "node:crypto";
import {
  authenticate,
  choices,
  expect,
  flag,
  openRowMenu,
  requirePermissions,
  resellerDetail,
  resellerRow,
  resellers,
  sample,
  settingRecord,
  TERMINATION_SETTING,
  test,
} from "@/tests/e2e/resellers/fixtures";

test("RS-D01 cancel delete keeps the reseller", async ({ page, staff }) => {
  requirePermissions(staff, "resellers.delete", "resellers.show");
  const reseller = await sample(staff);
  const before = await resellerDetail(staff, reseller.id);
  await page.goto("/resellers");
  await openRowMenu(page, reseller);
  await page.getByRole("menuitem", { name: "Delete" }).click();
  const dialog = page.getByRole("dialog", { name: "Confirm Delete" });
  await expect(dialog.getByText("Are you sure you want to delete this reseller?", { exact: true })).toBeVisible();
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(dialog).toBeHidden();
  const after = await resellerDetail(staff, reseller.id);
  expect(after.id).toBe(before.id);
  expect(after.name).toBe(before.name);
  expect(after.phone ?? null).toBe(before.phone ?? null);
  await page.reload();
  await expect(resellerRow(page, reseller)).toBeVisible();
});

test("RS-W01 recharge dialog shows the reseller balance and cancel does not change it", async ({ page, staff }) => {
  requirePermissions(staff, "resellers.access");
  if (!staff.profile.permissions.includes("reseller-wallet.recharge") && !staff.profile.permissions.includes("wallets.edit")) {
    throw new Error("Recharge dialog checks need reseller-wallet.recharge or wallets.edit.");
  }
  const reseller = (await resellers(staff)).data.find((row) => row.wallet?.id);
  if (!reseller?.wallet) throw new Error("Recharge dialog checks need a reseller wallet on the first page.");
  const before = reseller.wallet.balance;
  await page.goto("/resellers");
  await openRowMenu(page, reseller);
  await page.getByRole("menuitem", { name: "Recharge Wallet" }).click();
  const dialog = page.getByRole("dialog", { name: "Recharge Reseller Wallet" });
  await expect(dialog.getByText(reseller.name, { exact: true })).toBeVisible();
  await expect(dialog).toContainText(`Current Balance: ৳${new Intl.NumberFormat("en", { minimumFractionDigits: 0 }).format(before)}`);
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(dialog).toBeHidden();
  const after = (await resellers(staff)).data.find((row) => row.id === reseller.id);
  expect(after?.wallet?.balance).toBe(before);
});

test("RS-W02 a nonpositive amount and missing fund stay in the dialog and keep the balance", async ({ page, staff }) => {
  requirePermissions(staff, "resellers.access");
  const reseller = (await resellers(staff)).data.find((row) => row.wallet?.id);
  if (!reseller?.wallet) throw new Error("Recharge validation needs a reseller wallet on the first page.");
  const before = reseller.wallet.balance;
  await page.goto("/resellers");
  await openRowMenu(page, reseller);
  await page.getByRole("menuitem", { name: "Recharge Wallet" }).click();
  const dialog = page.getByRole("dialog", { name: "Recharge Reseller Wallet" });
  await dialog.locator("#balance").fill("0");
  await dialog.getByRole("button", { name: "Save", exact: true }).click();
  await expect(dialog.getByText("Amount must be greater than 0", { exact: true })).toBeVisible();
  await expect(dialog.getByText("Fund is required", { exact: true })).toBeVisible();
  await dialog.locator("#balance").fill("-5");
  await dialog.getByRole("button", { name: "Save", exact: true }).click();
  await expect(dialog.getByText("Amount must be greater than 0", { exact: true })).toBeVisible();
  await expect(dialog).toBeVisible();
  const after = (await resellers(staff)).data.find((row) => row.id === reseller.id);
  expect(after?.wallet?.balance).toBe(before);
});

test("RS-W05 an invalid fund, a foreign fund, and an unknown wallet do not change the balance", async ({ browser, staff }) => {
  requirePermissions(staff, "reseller-wallet.recharge");
  const reseller = (await resellers(staff)).data.find((row) => row.wallet?.id);
  if (!reseller?.wallet) throw new Error("Wallet denial checks need a reseller wallet on the first page.");
  const readBalance = async () => {
    const current = (await resellers(staff)).data.find((row) => row.id === reseller.id);
    return current?.wallet?.balance;
  };
  const before = await readBalance();
  const denied = async (fundId: number, walletUuid: string) => {
    const response = await staff.call("reseller-wallet-recharge", "POST", {
      walletUuid,
      balance: 1,
      fund_id: fundId,
      note: `E2E denied ${randomUUID()}`,
    });
    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(await readBalance()).toBe(before);
  };
  await denied(2147483646, reseller.wallet.id);
  const other = await authenticate(browser, staff.tenant === "cp" ? "mk" : "cp");
  try {
    const foreignFund = choices(await other.get("dropdown-funds"))[0];
    if (!foreignFund) throw new Error("Foreign fund denial needs a fund on the other company.");
    await denied(foreignFund.id, reseller.wallet.id);
  } finally {
    await other.dispose();
  }
  await denied(choices(await staff.get("dropdown-funds"))[0]?.id ?? 1, "00000000-0000-4000-8000-000000000099");
});

test("RS-S01 the reseller termination setting toggles, persists, and restores without changing company scope", async ({ page, staff }) => {
  requirePermissions(staff, "resellers.settings", "company-settings.access", "company-settings.edit");
  const listed = await resellers(staff);
  const reseller = listed.data[0];
  const sibling = listed.data.find((row) => row.id !== reseller?.id);
  if (!reseller) throw new Error("Reseller settings need a visible reseller.");
  const read = async (uuid?: string) => settingRecord(await staff.get(uuid ? `company/settings?reseller_uuid=${uuid}` : "company/settings"));
  const companyBefore = await read();
  const siblingBefore = sibling ? await read(sibling.id) : undefined;
  const original = flag((await read(reseller.id))[TERMINATION_SETTING]);
  const restore = async () => {
    await staff.call("company/settings", "POST", {
      reseller_uuid: reseller.id,
      settings: { [TERMINATION_SETTING]: original ? 1 : 0 },
    });
  };
  try {
    await page.goto("/resellers");
    await openRowMenu(page, reseller);
    await page.getByRole("menuitem", { name: "Reseller settings" }).click();
    const dialog = page.getByRole("dialog", { name: "Reseller Settings" });
    await expect(dialog.getByText("Auto Inactive Reseller Client Termination Date", { exact: true })).toBeVisible();
    await expect(dialog.getByText(original ? "Active" : "Inactive", { exact: true })).toBeVisible();
    await dialog.getByRole("switch").click();
    await expect(page.getByText("Setting updated successfully", { exact: true })).toBeVisible();
    await expect.poll(async () => flag((await read(reseller.id))[TERMINATION_SETTING])).toBe(!original);
    expect(flag((await read())[TERMINATION_SETTING])).toBe(flag(companyBefore[TERMINATION_SETTING]));
    if (sibling && siblingBefore) {
      expect(flag((await read(sibling.id))[TERMINATION_SETTING])).toBe(flag(siblingBefore[TERMINATION_SETTING]));
    }
    await dialog.getByRole("switch").click();
    await expect.poll(async () => flag((await read(reseller.id))[TERMINATION_SETTING])).toBe(original);
  } finally {
    await restore();
  }
});

test("RS-S03 a foreign reseller UUID cannot be read or written as settings", async ({ browser, staff }) => {
  requirePermissions(staff, "company-settings.access", "company-settings.edit");
  const reseller = await sample(staff);
  const before = settingRecord(await staff.get(`company/settings?reseller_uuid=${reseller.id}`));
  const other = await authenticate(browser, staff.tenant === "cp" ? "mk" : "cp");
  try {
    const shown = await other.call(`company/settings?reseller_uuid=${reseller.id}`);
    expect([403, 404]).toContain(shown.status);
    const posted = await other.call("company/settings", "POST", {
      reseller_uuid: reseller.id,
      settings: { [TERMINATION_SETTING]: flag(before[TERMINATION_SETTING]) ? 0 : 1 },
    });
    expect([403, 404]).toContain(posted.status);
  } finally {
    await other.dispose();
    const after = settingRecord(await staff.get(`company/settings?reseller_uuid=${reseller.id}`));
    expect(flag(after[TERMINATION_SETTING])).toBe(flag(before[TERMINATION_SETTING]));
  }
});
