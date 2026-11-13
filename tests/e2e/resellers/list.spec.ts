import { randomUUID } from "node:crypto";
import {
  chooseOption,
  expect,
  expectResellerRows,
  openFilters,
  resellerDetail,
  resellers,
  resellerRow,
  sample,
  test,
} from "@/tests/e2e/resellers/fixtures";

test("RS-L01 list identities contact status counts and wallet match the API after reload", async ({ page, staff }) => {
  const listed = await resellers(staff);
  await page.goto("/resellers");
  const title = listed.pagination.total ? `Resellers (${listed.pagination.total})` : "Resellers";
  await expect(page.getByText(title, { exact: true })).toBeVisible();
  await expectResellerRows(page, listed.data);
  await page.reload();
  const reloaded = await resellers(staff);
  expect(reloaded.pagination.total).toBe(listed.pagination.total);
  expect(reloaded.data.map((row) => row.id)).toEqual(listed.data.map((row) => row.id));
  await expectResellerRows(page, reloaded.data);
});

test("RS-L02 name filter includes the selected reseller and reset restores the baseline", async ({ page, staff }) => {
  const reseller = await sample(staff);
  const expected = await resellers(staff, `name=${encodeURIComponent(reseller.name)}`);
  expect(expected.data.some((row) => row.id === reseller.id)).toBe(true);
  expect(expected.data.every((row) => row.name.toLowerCase().includes(reseller.name.toLowerCase()))).toBe(true);
  await page.goto("/resellers");
  await openFilters(page);
  await page.locator("#name").fill(reseller.name);
  await expectResellerRows(page, expected.data);
  await page.locator("#name").fill("");
  await expectResellerRows(page, (await resellers(staff)).data);
});

test("RS-L02 phone filter matches the API and excludes a non-matching number", async ({ page, staff }) => {
  const listed = await resellers(staff);
  const reseller = listed.data.find((row) => (row.phone ?? "").length >= 3);
  if (!reseller?.phone) throw new Error("Phone filter needs a reseller phone of at least 3 characters.");
  const expected = await resellers(staff, `phone=${encodeURIComponent(reseller.phone)}`);
  expect(expected.data.every((row) => (row.phone ?? "").includes(reseller.phone ?? ""))).toBe(true);
  await page.goto("/resellers");
  await openFilters(page);
  await page.locator("#phone").fill(reseller.phone);
  await expectResellerRows(page, expected.data);
  const absent = `000${randomUUID().replace(/\D/g, "").slice(0, 8)}`;
  await page.locator("#phone").fill(absent);
  const none = await resellers(staff, `phone=${encodeURIComponent(absent)}`);
  expect(none.pagination.total).toBe(0);
  await expectResellerRows(page, none.data);
});

test("RS-L02 username filter keeps only matching usernames and an unknown username is empty", async ({ page, staff }) => {
  const listed = await resellers(staff);
  const reseller = listed.data.find((row) => (row.user?.username ?? "").length >= 3);
  if (!reseller?.user?.username) throw new Error("Username filter needs a linked reseller username of at least 3 characters.");
  const username = reseller.user.username;
  const expected = await resellers(staff, `username=${encodeURIComponent(username)}`);
  expect(expected.data.some((row) => row.id === reseller.id)).toBe(true);
  expect(expected.data.every((row) => (row.user?.username ?? "").toLowerCase().includes(username.toLowerCase()))).toBe(true);
  await page.goto("/resellers");
  await openFilters(page);
  await page.locator("#username").fill(username);
  await expectResellerRows(page, expected.data);
  const absent = `nouser${randomUUID().replace(/-/g, "").slice(0, 10)}`;
  await page.locator("#username").fill(absent);
  const none = await resellers(staff, `username=${encodeURIComponent(absent)}`);
  expect(none.pagination.total).toBe(0);
  await expectResellerRows(page, none.data);
});

test("RS-L02 status filter matches included rows and reload clears it", async ({ page, staff }) => {
  const reseller = await sample(staff);
  const status = Number(reseller.status ?? 0) === 1 ? 1 : 0;
  const expected = await resellers(staff, `status=${status}`);
  expect(expected.data.every((row) => Number(row.status ?? 0) === status)).toBe(true);
  await page.goto("/resellers");
  await openFilters(page);
  await chooseOption(page, "status", status === 1 ? "Active" : "Inactive", false);
  await expectResellerRows(page, expected.data);
  await page.goto("/resellers");
  await expectResellerRows(page, (await resellers(staff)).data);
});

test("RS-L02 zone filter matches the API page for the selected zone", async ({ page, staff }) => {
  const listed = await resellers(staff);
  const reseller = listed.data.find((row) => row.zone?.name);
  if (!reseller?.zone) throw new Error("Zone filter needs a reseller with a zone on the first page.");
  const expected = await resellers(staff, `zone_id=${reseller.zone.id}`);
  expect(expected.data.length).toBeGreaterThan(0);
  expect(expected.data.every((row) => row.zone?.id === reseller.zone?.id)).toBe(true);
  await page.goto("/resellers");
  await openFilters(page);
  await chooseOption(page, "zone_id", reseller.zone.name);
  await expectResellerRows(page, expected.data);
});

test("RS-L02 network filter matches the API page for the selected network", async ({ page, staff }) => {
  const listed = await resellers(staff);
  let network: { id: number; name: string } | undefined;
  for (const row of listed.data) {
    const detail = await resellerDetail(staff, row.id);
    if (detail.network?.name) {
      network = detail.network;
      break;
    }
  }
  if (!network) throw new Error("Network filter needs a first-page reseller with a network.");
  const expected = await resellers(staff, `network_id=${network.id}`);
  expect(expected.pagination.total).toBeGreaterThan(0);
  await page.goto("/resellers");
  await openFilters(page);
  await chooseOption(page, "network_id", network.name);
  await expectResellerRows(page, expected.data);
  const probe = expected.data[0];
  if (probe) expect((await resellerDetail(staff, probe.id)).network?.id).toBe(network.id);
});

test("RS-L02 combined name and status filters agree with the API", async ({ page, staff }) => {
  const reseller = await sample(staff);
  const status = Number(reseller.status ?? 0) === 1 ? 1 : 0;
  const expected = await resellers(staff, `name=${encodeURIComponent(reseller.name)}&status=${status}`);
  expect(expected.data.some((row) => row.id === reseller.id)).toBe(true);
  await page.goto("/resellers");
  await openFilters(page);
  await page.locator("#name").fill(reseller.name);
  await chooseOption(page, "status", status === 1 ? "Active" : "Inactive", false);
  await expectResellerRows(page, expected.data);
  await page.goto("/resellers");
  await expectResellerRows(page, (await resellers(staff)).data);
});

test("RS-L03 pagination buttons match the current page bounds", async ({ page, staff }) => {
  const first = await resellers(staff);
  expect(first.pagination.total).toBeGreaterThan(0);
  await page.goto("/resellers");
  await expectResellerRows(page, first.data);
  await expect(page.getByRole("button", { name: "Go to previous page", exact: true })).toBeDisabled();
  if (first.pagination.total_pages < 2) {
    await expect(page.getByRole("button", { name: "Go to next page", exact: true })).toBeDisabled();
    return;
  }
  const second = await resellers(staff, "page=2");
  expect(second.data.some((row) => first.data.some((known) => known.id === row.id))).toBe(false);
  await page.getByRole("button", { name: "Go to next page", exact: true }).click();
  await expectResellerRows(page, second.data);
  await page.getByRole("button", { name: "Go to previous page", exact: true }).click();
  await expectResellerRows(page, first.data);
});

test("RS-L04 an unmatched name is empty and clearing it restores the list", async ({ page, staff }) => {
  const reseller = await sample(staff);
  await page.goto("/resellers");
  await expect(resellerRow(page, reseller)).toBeVisible();
  await resellerRow(page, reseller).getByRole("button", { name: "Open menu" }).click();
  await expect(page.getByRole("menuitem", { name: "View" })).toBeVisible();
  await page.keyboard.press("Escape");
  await openFilters(page);
  const unmatched = `E2E-NO-RESELLER-${randomUUID()}`;
  await page.locator("#name").fill(unmatched);
  const none = await resellers(staff, `name=${encodeURIComponent(unmatched)}`);
  expect(none.pagination.total).toBe(0);
  await expect(page.getByText("No results", { exact: true })).toBeVisible();
  await expect(page.getByText(reseller.name, { exact: true })).toHaveCount(0);
  await page.locator("#name").fill("");
  await expect(resellerRow(page, reseller)).toBeVisible();
  await expect(page.getByText("No results", { exact: true })).toHaveCount(0);
});
