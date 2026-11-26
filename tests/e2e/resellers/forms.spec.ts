import { randomUUID } from "node:crypto";
import type { Page } from "@playwright/test";
import {
  chooseOption,
  choices,
  expect,
  requirePermissions,
  resellerDetail,
  resellers,
  sample,
  test,
  uniqueChoice,
} from "@/tests/e2e/resellers/fixtures";

const TAKEN = "The username has already been taken within this company.";

async function openCreate(page: Page) {
  await page.goto("/resellers/create");
  // Create mounts dropdowns and defaults after the inputs appear. Typing before that
  // is overwritten by the controlled name field.
  await page.waitForLoadState("networkidle");
  await expect(page.locator("#name")).toBeVisible();
  await expect(page.locator("#username")).toBeVisible();
}

async function fillInput(page: Page, selector: string, value: string) {
  const input = page.locator(selector);
  await expect(async () => {
    await input.fill(value);
    await expect(input).toHaveValue(value, { timeout: 500 });
  }).toPass();
}

// রিসেলারের আবশ্যক নাম, লগইন, ফোন বা নেটওয়ার্ক না থাকলে ত্রুটি দেখায় ও সেভ হয় না কি না দেখি।
test("RS-F02 Invalid reseller details: reject missing name, login details, phone, or network without saving", async ({ page, staff }) => {
  requirePermissions(staff, "resellers.access", "resellers.create");
  const before = await resellers(staff);
  await page.goto("/resellers");
  await page.getByRole("link", { name: "Add", exact: true }).click();
  await expect(page).toHaveURL(/\/resellers\/create$/);
  await expect(page.locator("#name")).toBeVisible();
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText("Name is required", { exact: true })).toBeVisible();
  await expect(page.getByText("Phone number is required", { exact: true })).toBeVisible();
  await expect(page.getByText("Network is required", { exact: true })).toBeVisible();

  const network = uniqueChoice(choices(await staff.get("dropdown-networks")), "network");
  await page.locator("#name").fill("E2E Reseller");
  await page.locator("#phone").fill("01712345678");
  await chooseOption(page, "network_id", network.name);
  await page.locator("#username").fill("");
  await page.locator("#password").fill("");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText("Username is required", { exact: true })).toBeVisible();
  await expect(page.getByText("Password is required", { exact: true })).toBeVisible();

  await page.locator("#name").fill("A");
  await page.locator("#phone").fill("017");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText("Name must be at least 2 characters", { exact: true })).toBeVisible();
  await expect(page.getByText("Phone number must be at least 11 digits", { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/resellers\/create$/);
  expect((await resellers(staff)).pagination.total).toBe(before.pagination.total);
});

// কোম্পানিতে একই ইউজারনেম থাকলে নতুন রিসেলার তৈরি আটকে দেয় কি না দেখি।
test("RS-F03 Duplicate reseller username: reject the request without creating another account", async ({ page, staff }) => {
  requirePermissions(staff, "resellers.create", "resellers.access");
  const existing = await sample(staff);
  const username = existing.user?.username;
  if (!username) throw new Error("Duplicate username check needs a reseller with a linked username.");
  const network = uniqueChoice(choices(await staff.get("dropdown-networks")), "network");
  const name = `E2E RS ${randomUUID()}`;
  const before = await resellers(staff);
  await openCreate(page);
  await fillInput(page, "#name", name);
  await page.locator("#username").fill(username);
  await page.locator("#password").fill(`e2e-${randomUUID()}`);
  await page.locator("#phone").fill("01712345678");
  await chooseOption(page, "network_id", network.name);
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText(TAKEN, { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/resellers\/create$/);
  await expect(page.locator("#name")).toHaveValue(name);
  const after = await resellers(staff, `any=${encodeURIComponent(name)}`);
  expect(after.pagination.total).toBe(0);
  expect((await resellers(staff)).pagination.total).toBe(before.pagination.total);
});

// রিসেলার এডিটে আগের তথ্য আসে এবং Cancel করলে সেটি বদলায় না কি না দেখি।
test("RS-F05 Edit reseller: load saved details and preserve them when cancelled", async ({ page, staff }) => {
  requirePermissions(staff, "resellers.edit", "resellers.show");
  const reseller = await resellerDetail(staff, (await sample(staff)).id);
  await page.goto(`/resellers/edit/${reseller.id}`);
  await expect(page.locator("#name")).toHaveValue(reseller.name);
  if (reseller.phone) await expect(page.locator("#phone")).toHaveValue(reseller.phone);
  if (reseller.network?.name) await expect(page.getByText(reseller.network.name, { exact: true }).first()).toBeVisible();
  await expect(page.locator("#username")).toHaveCount(0);
  await expect(page.locator("#password")).toHaveCount(0);
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page).toHaveURL(/\/resellers$/);
  const after = await resellerDetail(staff, reseller.id);
  expect(after.name).toBe(reseller.name);
  expect(after.phone ?? null).toBe(reseller.phone ?? null);
  expect(after.email ?? null).toBe(reseller.email ?? null);
  expect(after.prefix ?? null).toBe(reseller.prefix ?? null);
  expect(after.company ?? null).toBe(reseller.company ?? null);
  expect(Number(after.status ?? 0)).toBe(Number(reseller.status ?? 0));
  expect(after.billing_type ?? null).toBe(reseller.billing_type ?? null);
  expect(after.agent_id ?? null).toBe(reseller.agent_id ?? null);
  expect(after.commission ?? null).toBe(reseller.commission ?? null);
});

// নতুন রিসেলার ফর্ম বাতিল করলে কোনো অ্যাকাউন্ট তৈরি হয় না কি না দেখি।
test("RS-F06 Cancel new reseller: return without creating an account", async ({ page, staff }) => {
  requirePermissions(staff, "resellers.create", "resellers.access");
  const before = await resellers(staff);
  const name = `E2E RS ${randomUUID()}`;
  await openCreate(page);
  await fillInput(page, "#name", name);
  await page.locator("#phone").fill("01712345679");
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page).toHaveURL(/\/resellers$/);
  expect((await resellers(staff, `any=${encodeURIComponent(name)}`)).pagination.total).toBe(0);
  expect((await resellers(staff)).pagination.total).toBe(before.pagination.total);
});

// এজেন্টের কমিশন শূন্য বা ধনাত্মক পূর্ণসংখ্যা হতে হয় এবং ভুল মানে তৈরি হয় না কি না দেখি।
test("RS-F07 Agent commission: require a nonnegative whole number and reject invalid enrollment", async ({ page, staff }) => {
  requirePermissions(staff, "resellers.create", "resellers.access");
  const agent = uniqueChoice(choices(await staff.get("dropdown-agents")), "agent");
  const network = uniqueChoice(choices(await staff.get("dropdown-networks")), "network");
  const name = `E2E RS ${randomUUID()}`;
  const before = await resellers(staff);
  await openCreate(page);
  await fillInput(page, "#name", name);
  await page.locator("#username").fill(`e2ers${randomUUID().replace(/-/g, "").slice(0, 12)}`);
  await page.locator("#password").fill(`e2e-${randomUUID()}`);
  await page.locator("#phone").fill("01712345670");
  await chooseOption(page, "network_id", network.name);
  await page.getByRole("button", { name: "Billing Information", exact: true }).click();
  await chooseOption(page, "agent_id", agent.name);
  const commission = page.locator("#commission");
  await expect(commission).toBeVisible();
  await commission.fill("");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText("Commission is required", { exact: true })).toBeVisible();
  await commission.fill("-1");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText("Commission cannot be negative", { exact: true })).toBeVisible();
  await commission.fill("1.5");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText("Commission must be a whole number", { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/resellers\/create$/);
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  expect((await resellers(staff, `any=${encodeURIComponent(name)}`)).pagination.total).toBe(0);
  expect((await resellers(staff)).pagination.total).toBe(before.pagination.total);
});
