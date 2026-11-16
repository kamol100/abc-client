import { randomUUID } from "node:crypto";
import {
  chooseOption,
  expect,
  expectNetworkRows,
  listTitle,
  networkRow,
  networks,
  openFilters,
  openNetworks,
  test,
  type Network,
} from "@/tests/e2e/networks/fixtures";

function matchingName(rows: Network[], term: string) {
  const needle = term.toLowerCase();
  return rows.filter((row) => row.name.toLowerCase().includes(needle)).map((row) => row.id).sort();
}

test("NW-L01 list shows names addresses operational status and the company total", async ({ page, staff }) => {
  const listed = await openNetworks(page, staff);
  await expectNetworkRows(page, listed.data);
  expect(new Set(listed.data.map((row) => row.id)).size).toBe(listed.data.length);
  await page.reload();
  const reloaded = await networks(staff);
  expect(reloaded.pagination.total).toBe(listed.pagination.total);
  expect(reloaded.data.map((row) => row.id)).toEqual(listed.data.map((row) => row.id));
  await expect(page.getByText(listTitle(reloaded.pagination.total), { exact: true })).toBeVisible();
  await expectNetworkRows(page, reloaded.data);
});

test("NW-L02 name filter keeps matching networks and drops the others", async ({ page, staff }) => {
  const listed = await networks(staff);
  const selected = listed.data.find((row) => row.name.trim().length >= 3);
  const excluded = listed.data.find((row) => row.id !== selected?.id && !row.name.toLowerCase().includes((selected?.name ?? "").toLowerCase()));
  if (!selected || !excluded) throw new Error("Name filter needs two networks with different names.");
  const filtered = await networks(staff, `name=${encodeURIComponent(selected.name)}`);
  expect(filtered.data.map((row) => row.id).sort()).toEqual(matchingName(listed.data, selected.name));
  expect(filtered.pagination.total).toBe(matchingName(listed.data, selected.name).length);
  await openNetworks(page, staff);
  await openFilters(page);
  await page.locator("#name").fill(selected.name);
  await expectNetworkRows(page, filtered.data);
  await expect(networkRow(page, excluded)).toHaveCount(0);
  await page.locator("#name").fill("");
  await expectNetworkRows(page, (await networks(staff)).data);
});

test("NW-L02 an unknown address filter is empty", async ({ page, staff }) => {
  const absent = `203.0.113.${randomUUID().replace(/\D/g, "").slice(0, 2) || "10"}`;
  const filtered = await networks(staff, `ip_address=${encodeURIComponent(absent)}`);
  expect(filtered.data.every((row) => (row.ip_address ?? "").includes(absent))).toBe(true);
  expect(filtered.pagination.total).toBe(0);
  await openNetworks(page, staff);
  await openFilters(page);
  await page.locator("#ip_address").fill(absent);
  await expect(page.getByText("No results", { exact: true })).toBeVisible();
  await expect(page.getByText(listTitle(0), { exact: true })).toBeVisible();
});

test("NW-L02 inactive status filter returns only inactive networks and reload restores the list", async ({ page, staff }) => {
  const baseline = await networks(staff);
  const filtered = await networks(staff, "status=0");
  expect(filtered.data.every((row) => Number(row.status ?? 0) === 0)).toBe(true);
  expect(filtered.pagination.total).toBe(baseline.data.filter((row) => Number(row.status ?? 0) === 0).length);
  await openNetworks(page, staff);
  await openFilters(page);
  await chooseOption(page, "status", "Inactive", false);
  await expectNetworkRows(page, filtered.data);
  await page.goto("/networks");
  await expectNetworkRows(page, (await networks(staff)).data);
});

test("NW-L02 combined name and active status agree on the included network", async ({ page, staff }) => {
  const listed = await networks(staff);
  const selected = listed.data.find((row) => row.name.trim().length >= 3 && Number(row.status ?? 0) === 1);
  if (!selected) throw new Error("Combined filter needs an active network whose name is at least 3 characters.");
  const expectedIds = listed.data
    .filter((row) => row.name.toLowerCase().includes(selected.name.toLowerCase()) && Number(row.status ?? 0) === 1)
    .map((row) => row.id)
    .sort();
  const filtered = await networks(staff, `name=${encodeURIComponent(selected.name)}&status=1`);
  expect(filtered.data.map((row) => row.id).sort()).toEqual(expectedIds);
  await openNetworks(page, staff);
  await openFilters(page);
  await page.locator("#name").fill(selected.name);
  await chooseOption(page, "status", "Active", false);
  await expectNetworkRows(page, filtered.data);
});

test("NW-L03 pagination buttons follow the current page and do not repeat rows", async ({ page, staff }) => {
  const first = await openNetworks(page, staff);
  expect(first.pagination.total).toBeGreaterThan(0);
  await expectNetworkRows(page, first.data);
  await expect(page.getByRole("button", { name: "Go to previous page", exact: true })).toBeDisabled();
  if (first.pagination.total_pages < 2) {
    await expect(page.getByRole("button", { name: "Go to next page", exact: true })).toBeDisabled();
    return;
  }
  const second = await networks(staff, "page=2");
  expect(second.data.some((row) => first.data.some((known) => known.id === row.id))).toBe(false);
  await page.getByRole("button", { name: "Go to next page", exact: true }).click();
  await expectNetworkRows(page, second.data);
  await page.getByRole("button", { name: "Go to previous page", exact: true }).click();
  await expectNetworkRows(page, first.data);
});

test("NW-L04 an unmatched name shows an empty list and clearing it restores the rows", async ({ page, staff }) => {
  const listed = await networks(staff);
  const known = listed.data[0];
  if (!known) throw new Error("Empty-filter recovery needs at least one network.");
  const unmatched = `E2E-NO-NETWORK-${randomUUID()}`;
  const none = await networks(staff, `name=${encodeURIComponent(unmatched)}`);
  expect(none.pagination.total).toBe(0);
  expect(none.data).toEqual([]);
  await openNetworks(page, staff);
  await expect(networkRow(page, known)).toBeVisible();
  await openFilters(page);
  await page.locator("#name").fill(unmatched);
  await expect(page.getByText("No results", { exact: true })).toBeVisible();
  await expect(networkRow(page, known)).toHaveCount(0);
  await page.locator("#name").fill("");
  await expect(networkRow(page, known)).toBeVisible();
  await expect(page.getByText("No results", { exact: true })).toHaveCount(0);
});

test("NW-L05 column toggles hide only allowed columns and a fresh context shows them again", async ({ browser, page, staff }) => {
  const listed = await openNetworks(page, staff);
  const network = listed.data[0];
  if (!network) throw new Error("Column toggles need a visible network.");
  await page.getByRole("button").filter({ hasText: "View" }).click();
  await expect(page.getByRole("menuitemcheckbox", { name: "Name", exact: true })).toHaveCount(0);
  await expect(page.getByRole("menuitemcheckbox", { name: "Actions", exact: true })).toHaveCount(0);
  await page.getByRole("menuitemcheckbox", { name: "IP Address", exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("columnheader", { name: "IP Address", exact: true })).toHaveCount(0);
  await expect(page.getByRole("columnheader", { name: "Name", exact: true })).toBeVisible();
  await expect(networkRow(page, network).getByRole("button").filter({ has: page.locator("svg.lucide-square-pen") })).toBeVisible();

  const context = await browser.newContext({
    baseURL: staff.baseURL,
    storageState: staff.state,
    locale: "en-US",
    timezoneId: "Asia/Dhaka",
    serviceWorkers: "block",
  });
  try {
    const fresh = await context.newPage();
    await fresh.goto("/networks");
    await expect(fresh.getByRole("columnheader", { name: "IP Address", exact: true })).toBeVisible();
    await expect(fresh.getByRole("columnheader", { name: "Name", exact: true })).toBeVisible();
  } finally {
    await context.close();
  }
});
