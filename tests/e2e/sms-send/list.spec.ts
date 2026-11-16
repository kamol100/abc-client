import { randomUUID } from "node:crypto";
import type { Page } from "@playwright/test";
import {
  clientQuery,
  clientRow,
  dropdownChoices,
  expect,
  expectClientRows,
  filterForm,
  listTemplate,
  openClientList,
  smsClients,
  smsTemplates,
  test,
  type SmsClient,
  type SmsTemplate,
} from "@/tests/e2e/sms-send/fixtures";
import type { Session } from "@/tests/e2e/clients/fixtures";

async function listedTemplate(staff: Session) {
  const template = listTemplate(await smsTemplates(staff));
  const listed = await smsClients(staff, clientQuery(template));
  if (!listed.data.length) throw new Error("SMS client list needs at least one client with a phone.");
  return { template, listed };
}

function excluded(baseline: SmsClient[], filtered: SmsClient[]): SmsClient | undefined {
  return baseline.find((row) => filtered.every((match) => match.cid !== row.cid));
}

async function expectFiltered(page: Page, staff: Session, template: SmsTemplate, query: string, included: SmsClient) {
  const expected = await smsClients(staff, clientQuery(template, query));
  expect(expected.data.some((row) => row.cid === included.cid)).toBe(true);
  await expectClientRows(page, expected.data);
  await expect(page.locator("button[aria-current=page]")).toHaveText("1");
  return expected;
}

test("FT087-05 search includes the selected client, excludes another, and reset restores the list", async ({ page, staff }) => {
  const { template, listed } = await listedTemplate(staff);
  const client = listed.data.find((row) => (row.pppoe_username ?? "").trim().length >= 3);
  if (!client?.pppoe_username) throw new Error("Search needs a first-page SMS client username of at least 3 characters.");
  await openClientList(page, staff, template);
  await expectClientRows(page, listed.data);
  await page.locator("#any").fill(client.pppoe_username);
  await filterForm(page).locator("button[type=submit]").click();
  const expected = await expectFiltered(page, staff, template, `any=${encodeURIComponent(client.pppoe_username)}`, client);
  const missing = excluded(listed.data, expected.data);
  if (missing) await expect(clientRow(page, missing)).toHaveCount(0);
  await filterForm(page).locator("button[type=button]").click();
  await expectClientRows(page, (await smsClients(staff, clientQuery(template))).data);
});

test("FT087-05 an unknown search is empty and shows no request error", async ({ page, staff }) => {
  const { template, listed } = await listedTemplate(staff);
  const client = listed.data[0];
  const absent = `E2E-NO-SMS-${randomUUID()}`;
  await openClientList(page, staff, template);
  await page.locator("#any").fill(absent);
  await filterForm(page).locator("button[type=submit]").click();
  const none = await smsClients(staff, clientQuery(template, `any=${encodeURIComponent(absent)}`));
  expect(none.pagination.total).toBe(0);
  await expectClientRows(page, none.data);
  await expect(clientRow(page, client)).toHaveCount(0);
  await expect(page.getByText("Request failed", { exact: true })).toHaveCount(0);
  await page.locator("#any").fill("");
  await filterForm(page).locator("button[type=submit]").click();
  await expect(clientRow(page, client)).toBeVisible();
});

test("FT087-05 status filter keeps the selected status and hides the other", async ({ page, staff }) => {
  const { template } = await listedTemplate(staff);
  const active = await smsClients(staff, clientQuery(template, "status=1"));
  const inactive = await smsClients(staff, clientQuery(template, "status=0"));
  if (!active.data.length || !inactive.data.length) {
    throw new Error("Status exclusion needs both an active and an inactive SMS client.");
  }
  await openClientList(page, staff, template);
  await page.locator("#react-select-status-input").click();
  await page.getByRole("option", { name: "Active", exact: true }).click();
  await expectClientRows(page, active.data);
  expect(active.data.every((row) => row.status === 1)).toBe(true);
  await expect(clientRow(page, inactive.data[0])).toHaveCount(0);
  await page.locator("#react-select-status-input").click();
  await page.getByRole("option", { name: "Inactive", exact: true }).click();
  await expectClientRows(page, inactive.data);
  await expect(clientRow(page, active.data[0])).toHaveCount(0);
});

test("FT087-05 zone filter matches that zone and excludes a client in another zone", async ({ page, staff }) => {
  const { template, listed } = await listedTemplate(staff);
  const client = listed.data.find((row) => row.zone?.name);
  if (!client?.zone) throw new Error("Zone filter needs a first-page SMS client with a zone.");
  const zones = await dropdownChoices(staff, "dropdown-zones");
  const other = zones.find((row) => row.id !== client.zone?.id && row.name.trim().length > 0);
  if (!other) throw new Error("Zone exclusion needs a second zone.");
  await openClientList(page, staff, template);
  await page.locator("#react-select-zone_id-input").click();
  await page.locator("#react-select-zone_id-input").fill(client.zone.name);
  await page.getByRole("option", { name: client.zone.name, exact: true }).click();
  const expected = await smsClients(staff, clientQuery(template, `zone_id=${client.zone.id}`));
  expect(expected.pagination.total).toBeGreaterThan(0);
  expect(expected.data.every((row) => row.zone?.id === client.zone?.id)).toBe(true);
  await expectClientRows(page, expected.data);
  const elsewhere = await smsClients(staff, clientQuery(template, `zone_id=${other.id}`));
  expect(elsewhere.data.some((row) => row.cid === client.cid)).toBe(false);
  await page.locator("#react-select-zone_id-input").click();
  await page.locator("#react-select-zone_id-input").fill(other.name);
  await page.getByRole("option", { name: other.name, exact: true }).click();
  await expectClientRows(page, elsewhere.data);
  await expect(clientRow(page, client)).toHaveCount(0);
});

test("FT087-05 username, status, and network together match the API and reset clears them", async ({ page, staff }) => {
  const { template, listed } = await listedTemplate(staff);
  const client = listed.data.find((row) => (row.pppoe_username ?? "").trim().length >= 3 && row.network?.name);
  if (!client?.pppoe_username || !client.network) {
    throw new Error("Combined filters need a first-page SMS client with a username and a network.");
  }
  const status = client.status === 1 ? 1 : 0;
  const query = `any=${encodeURIComponent(client.pppoe_username)}&status=${status}&network_id=${client.network.id}`;
  await openClientList(page, staff, template);
  await page.locator("#any").fill(client.pppoe_username);
  await page.locator("#react-select-status-input").click();
  await page.getByRole("option", { name: status === 1 ? "Active" : "Inactive", exact: true }).click();
  await page.locator("#react-select-network_id-input").click();
  await page.locator("#react-select-network_id-input").fill(client.network.name);
  await page.getByRole("option", { name: client.network.name, exact: true }).click();
  const expected = await expectFiltered(page, staff, template, query, client);
  expect(expected.data.every((row) => row.status === status && row.network?.id === client.network?.id)).toBe(true);
  const missing = excluded(listed.data, expected.data);
  if (missing) await expect(clientRow(page, missing)).toHaveCount(0);
  await filterForm(page).locator("button[type=button]").click();
  await expect(page.locator("#any")).toHaveValue("");
  await expectClientRows(page, (await smsClients(staff, clientQuery(template))).data);
});

test("FT087-11 an empty filter is distinct from a failed request and clears back to data", async ({ page, staff }) => {
  const { template, listed } = await listedTemplate(staff);
  await openClientList(page, staff, template);
  await expect(clientRow(page, listed.data[0])).toBeVisible();
  const absent = `E2E-EMPTY-${randomUUID()}`;
  await page.locator("#any").fill(absent);
  await filterForm(page).locator("button[type=submit]").click();
  await expect(page.getByText("No results", { exact: true })).toBeVisible();
  await expect(page.locator(".text-destructive", { hasText: "Request failed" })).toHaveCount(0);
  await page.locator("#any").fill("");
  await filterForm(page).locator("button[type=submit]").click();
  await expect(page.getByText("No results", { exact: true })).toHaveCount(0);
  await expect(clientRow(page, listed.data[0])).toBeVisible();
});
