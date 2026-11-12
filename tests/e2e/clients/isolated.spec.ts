import { randomUUID } from "node:crypto";
import { test, expect, openClientCreate, clientId, requirePermissions } from "@/tests/e2e/clients/fixtures";
import { isolatedFixtures } from "@/tests/e2e/clients/environment";

// This project fails preflight rather than silently skipping without an isolated fake-backed fixture.
test.beforeEach(async ({ staff }) => { isolatedFixtures(staff.tenant); });


test("CL-F04 edit hydrates owned UUID and persists name while preserving billing", async ({ page, staff, ownedClient }) => {
  const id = clientId(ownedClient);
  const updated = `E2E updated ${randomUUID()}`;
  await page.goto(`/clients/edit/${id}`);
  await expect(page.locator("#name")).toHaveValue(ownedClient.name);
  await page.locator("#name").fill(updated);
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page).toHaveURL(`${staff.baseURL}/clients`);
  await page.goto(`/clients/edit/${id}`);
  await expect(page.locator("#name")).toHaveValue(updated);
  const saved = await staff.detail(id);
  expect(saved.name).toBe(updated);
  expect(saved.billing_term).toBe(ownedClient.billing_term);
  expect(saved.billing_type).toBe(ownedClient.billing_type);
  expect(saved.payment_deadline).toBe(ownedClient.payment_deadline);
});

test("CL-F08 cancel edit preserves original saved values", async ({ page, staff, ownedClient }) => {
  const id = clientId(ownedClient);
  await page.goto(`/clients/edit/${id}`);
  await expect(page.locator("#name")).toHaveValue(ownedClient.name);
  await page.locator("#name").fill(`E2E cancelled ${randomUUID()}`);
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page).toHaveURL(`${staff.baseURL}/clients`);
  expect((await staff.detail(id)).name).toBe(ownedClient.name);
});

test("CL-F10 clearing optional IP persists blank without string markers", async ({ page, staff, ownedClient }) => {
  const id = clientId(ownedClient);
  await page.goto(`/clients/edit/${id}`);
  await expect(page.locator("#name")).toHaveValue(ownedClient.name);
  await page.locator("#ip_address").fill("");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page).toHaveURL(`${staff.baseURL}/clients`);
  await page.goto(`/clients/edit/${id}`);
  await expect(page.locator("#ip_address")).toHaveValue("");
  const value = (await staff.detail(id)).ip_address;
  expect(value == null || value === "").toBe(true);
});

 test("CL-F01 creates client through UI and persists network/package identity", async ({ page, staff }) => {
   const fixture = isolatedFixtures(staff.tenant);
   requirePermissions(staff, "clients.create", "clients.delete", "archived-clients.delete");
   const username = `e2e-${randomUUID()}`;
   const name = `E2E browser ${randomUUID()}`;
   try {
     await openClientCreate(page);
     await page.locator("#name").fill(name);
     await page.locator("#pppoe_username").fill(username);
     await page.locator("#pppoe_password").fill(randomUUID());
     await page.locator("#phone").fill("01700000002");
     await page.getByRole("radio", { name: "No", exact: true }).check();
     for (const [field, label] of [["network_id", fixture.network.name], ["package_id", fixture.package.name]]) {
       await page.locator(`#react-select-${field}-input`).fill(label);
       await page.getByRole("option", { name: label, exact: true }).click();
     }
     await page.getByRole("button", { name: "Save", exact: true }).click();
     await expect(page).toHaveURL(`${staff.baseURL}/clients`);
     const created = (await staff.list(`any=${encodeURIComponent(username)}`)).data.filter(c => c.pppoe_username === username);
     expect(created).toHaveLength(1);
     const saved = await staff.detail(clientId(created[0]));
     expect(saved.name).toBe(name);
     expect(saved.network?.id).toBe(fixture.network.id);
     expect(saved.package?.id).toBe(fixture.package.id);
     await page.goto(`/clients/view/${clientId(created[0])}`);
     await expect(page.getByText(name, { exact: true })).toBeVisible();
     await page.reload();
     await expect(page.getByText(name, { exact: true })).toBeVisible();
   } finally {
     // Resolve only this UUID-tagged test identity even if save/assertion failed.
     const created = (await staff.list(`any=${encodeURIComponent(username)}`)).data.filter(c => c.pppoe_username === username);
     for (const row of created) {
       const removed = await staff.call(`clients/${clientId(row)}`, "DELETE");
       if (removed.status !== 200) throw new Error("Created client cleanup failed; inspect isolated fixture.");
       const purged = await staff.call(`archived-clients/${clientId(row)}`, "DELETE");
       if (![200, 404].includes(purged.status)) throw new Error("Created client archive cleanup failed.");
     }
   }
 });
