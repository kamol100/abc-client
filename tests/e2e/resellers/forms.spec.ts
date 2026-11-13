import { randomUUID } from "node:crypto";
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

async function openCreate(page: import("@playwright/test").Page) {
  await page.goto("/resellers/create");
  await expect(page.locator("#name")).toBeVisible();
  await expect(page.locator("#username")).toBeVisible();
}

test("RS-F02 missing name credentials phone and network stay on the form and create nothing", async ({ page, staff }) => {
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

test("RS-F03 a duplicate company username is rejected and the draft is not created", async ({ page, staff }) => {
  requirePermissions(staff, "resellers.create", "resellers.access");
  const existing = await sample(staff);
  const username = existing.user?.username;
  if (!username) throw new Error("Duplicate username check needs a reseller with a linked username.");
  const network = uniqueChoice(choices(await staff.get("dropdown-networks")), "network");
  const name = `E2E RS ${randomUUID()}`;
  const before = await resellers(staff);
  await openCreate(page);
  await page.locator("#name").fill(name);
  await page.locator("#username").fill(username);
  await page.locator("#password").fill(`e2e-${randomUUID()}`);
  await page.locator("#phone").fill("01712345678");
  await chooseOption(page, "network_id", network.name);
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText(TAKEN, { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/resellers\/create$/);
  await expect(page.locator("#name")).toHaveValue(name);
  const after = await resellers(staff, `name=${encodeURIComponent(name)}`);
  expect(after.pagination.total).toBe(0);
  expect((await resellers(staff)).pagination.total).toBe(before.pagination.total);
});

test("RS-F05 edit hydrates the saved reseller and cancel leaves it unchanged", async ({ page, staff }) => {
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

test("RS-F06 cancel create stores no reseller", async ({ page, staff }) => {
  requirePermissions(staff, "resellers.create", "resellers.access");
  const before = await resellers(staff);
  const name = `E2E RS ${randomUUID()}`;
  await openCreate(page);
  await page.locator("#name").fill(name);
  await page.locator("#phone").fill("01712345679");
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page).toHaveURL(/\/resellers$/);
  expect((await resellers(staff, `name=${encodeURIComponent(name)}`)).pagination.total).toBe(0);
  expect((await resellers(staff)).pagination.total).toBe(before.pagination.total);
});

test("RS-F07 an agent requires a nonnegative whole-number commission and creates nothing", async ({ page, staff }) => {
  requirePermissions(staff, "resellers.create", "resellers.access");
  const agent = uniqueChoice(choices(await staff.get("dropdown-agents")), "agent");
  const network = uniqueChoice(choices(await staff.get("dropdown-networks")), "network");
  const name = `E2E RS ${randomUUID()}`;
  const before = await resellers(staff);
  await openCreate(page);
  await page.locator("#name").fill(name);
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
  expect((await resellers(staff, `name=${encodeURIComponent(name)}`)).pagination.total).toBe(0);
  expect((await resellers(staff)).pagination.total).toBe(before.pagination.total);
});
