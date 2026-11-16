import { randomUUID } from "node:crypto";
import {
  editButton,
  expect,
  expectControlValue,
  networkDetail,
  networkRow,
  networks,
  openNetworks,
  requirePermissions,
  sameConfig,
  test,
} from "@/tests/e2e/networks/fixtures";

test("NW-F02 missing and short fields stay in the dialog and create nothing", async ({ page, staff }) => {
  requirePermissions(staff, "networks.create");
  const before = await openNetworks(page, staff);
  await page.getByRole("button", { name: "Add", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Add Network" });
  await expect(dialog.locator("#name")).toBeVisible();
  await dialog.getByRole("button", { name: "Save", exact: true }).click();
  await expect(dialog.getByText("Network name is required", { exact: true })).toBeVisible();
  await expect(dialog.getByText("IP address is required", { exact: true })).toBeVisible();
  await expect(dialog.getByText("Mikrotik user is required", { exact: true })).toBeVisible();
  await expect(dialog.getByText("Password must be at least 5 characters", { exact: true })).toHaveCount(0);

  await dialog.locator("#name").fill("A");
  await dialog.locator("#ip_address").fill("1.2");
  await dialog.locator("#mikrotik_user").fill("u");
  await dialog.locator("#mikrotik_password").fill("abcd");
  await dialog.getByRole("button", { name: "Save", exact: true }).click();
  await expect(dialog.getByText("Network name must be at least 2 characters", { exact: true })).toBeVisible();
  await expect(dialog.getByText("A valid IP address is required", { exact: true })).toBeVisible();
  await expect(dialog.getByText("Mikrotik user must be at least 2 characters", { exact: true })).toBeVisible();
  await expect(dialog.getByText("Password must be at least 5 characters", { exact: true })).toBeVisible();
  await expect(dialog).toBeVisible();
  expect((await networks(staff)).pagination.total).toBe(before.pagination.total);
});

test("NW-F04 cancel create stores nothing and a nameless API create is rejected", async ({ page, staff }) => {
  requirePermissions(staff, "networks.create");
  const before = await openNetworks(page, staff);
  const name = `E2E Net ${randomUUID()}`;
  await page.getByRole("button", { name: "Add", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Add Network" });
  await dialog.locator("#name").fill(name);
  await dialog.locator("#ip_address").fill("127.0.0.1");
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(dialog).toBeHidden();
  const afterCancel = await networks(staff);
  expect(afterCancel.pagination.total).toBe(before.pagination.total);
  expect(afterCancel.data.some((row) => row.name === name)).toBe(false);

  const rejected = await staff.call("networks", "POST", { ip_address: "127.0.0.1" });
  expect(rejected.status).toBe(422);
  const afterReject = await networks(staff);
  expect(afterReject.pagination.total).toBe(before.pagination.total);
  expect(afterReject.data.map((row) => row.id)).toEqual(before.data.map((row) => row.id));
});

test("NW-F05 edit hydrates the saved network and cancel leaves every network unchanged", async ({ page, staff }) => {
  requirePermissions(staff, "networks.edit", "networks.show");
  const listed = await openNetworks(page, staff);
  const selected = listed.data[0];
  const sibling = listed.data.find((row) => row.id !== selected?.id);
  if (!selected || !sibling) throw new Error("Edit hydration needs two company networks.");
  const saved = await networkDetail(staff, selected.id);
  const siblingBefore = await networkDetail(staff, sibling.id);
  await editButton(networkRow(page, selected)).click();
  const dialog = page.getByRole("dialog", { name: "Edit Network" });
  await expectControlValue(dialog.locator("#name"), saved.name);
  await expectControlValue(dialog.locator("#ip_address"), saved.ip_address ?? "");
  await expectControlValue(dialog.locator("#mikrotik_user"), saved.mikrotik_user ?? "");
  await expectControlValue(dialog.locator("#mikrotik_password"), saved.mikrotik_password ?? "");
  await expectControlValue(dialog.locator("#web_port"), saved.web_port == null ? "" : String(saved.web_port));
  await expectControlValue(dialog.locator("#notes"), saved.notes ?? "");
  await expect(dialog.getByText(Number(saved.status ?? 0) === 1 ? "Active" : "Inactive", { exact: true })).toBeVisible();
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(dialog).toBeHidden();
  expect(sameConfig(await networkDetail(staff, selected.id), saved)).toBe(true);
  expect(sameConfig(await networkDetail(staff, sibling.id), siblingBefore)).toBe(true);
});

test("NW-F08 cancel and a rejected save leave the saved network unchanged", async ({ page, staff }) => {
  requirePermissions(staff, "networks.edit", "networks.show");
  const listed = await openNetworks(page, staff);
  const selected = listed.data[0];
  if (!selected) throw new Error("Edit cancel needs a visible network.");
  const saved = await networkDetail(staff, selected.id);
  const sibling = listed.data.find((row) => row.id !== selected.id);
  const siblingBefore = sibling ? await networkDetail(staff, sibling.id) : null;

  await editButton(networkRow(page, selected)).click();
  const dialog = page.getByRole("dialog", { name: "Edit Network" });
  await expectControlValue(dialog.locator("#name"), saved.name);
  await dialog.locator("#name").fill(`E2E Net ${randomUUID()}`);
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(dialog).toBeHidden();
  expect(sameConfig(await networkDetail(staff, selected.id), saved)).toBe(true);

  await editButton(networkRow(page, selected)).click();
  const reopened = page.getByRole("dialog", { name: "Edit Network" });
  await expectControlValue(reopened.locator("#name"), saved.name);
  await reopened.locator("#name").fill("");
  await reopened.getByRole("button", { name: "Save", exact: true }).click();
  await expect(reopened.getByText("Network name must be at least 2 characters", { exact: true })).toBeVisible();
  await expect(reopened).toBeVisible();
  expect(sameConfig(await networkDetail(staff, selected.id), saved)).toBe(true);
  if (sibling && siblingBefore) expect(sameConfig(await networkDetail(staff, sibling.id), siblingBefore)).toBe(true);
});
