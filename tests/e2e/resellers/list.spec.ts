import { randomUUID } from "node:crypto";
import {
  chooseOption,
  expect,
  expectResellerRows,
  matchesAny,
  openFilters,
  resellerDetail,
  resellers,
  resellerRow,
  sample,
  searchResellers,
  test,
  type Reseller,
} from "@/tests/e2e/resellers/fixtures";
import type { Session } from "@/tests/e2e/clients/fixtures";

// রিসেলারের যোগাযোগ, স্ট্যাটাস, ক্লায়েন্ট সংখ্যা ও ওয়ালেটের হিসাব রিলোডের পর API-এর সঙ্গে মেলে কি না দেখি।
test("RS-L01 Reseller list: show saved contact details, status, client counts, and wallet balance after reload", async ({ page, staff }) => {
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

async function expectAnyPage(staff: Session, rows: Reseller[], term: string) {
  for (const row of rows) {
    if (matchesAny(row, term)) continue;
    expect(matchesAny(await resellerDetail(staff, row.id), term)).toBe(true);
  }
}

// নাম দিয়ে সঠিক রিসেলার আসে এবং সার্চ মুছলে আগের তালিকা ফেরে কি না দেখি।
test("RS-L02 Search resellers by name: show matches and restore the list when cleared", async ({ page, staff }) => {
  const reseller = await sample(staff);
  const expected = await resellers(staff, `any=${encodeURIComponent(reseller.name)}`);
  expect(expected.data.some((row) => row.id === reseller.id)).toBe(true);
  await expectAnyPage(staff, expected.data, reseller.name);
  await page.goto("/resellers");
  await searchResellers(page, reseller.name);
  await expectResellerRows(page, expected.data);
  await page.locator("#any").fill("");
  await expectResellerRows(page, (await resellers(staff)).data);
});

// ফোন নম্বর ফিল্টারে মিল থাকা রিসেলার আসে এবং অন্য নম্বর বাদ যায় কি না দেখি।
test("RS-L02 Search resellers by phone: show matching numbers and hide nonmatches", async ({ page, staff }) => {
  const listed = await resellers(staff);
  const reseller = listed.data.find((row) => (row.phone ?? "").length >= 3);
  if (!reseller?.phone) throw new Error("Phone filter needs a reseller phone of at least 3 characters.");
  const expected = await resellers(staff, `any=${encodeURIComponent(reseller.phone)}`);
  expect(expected.data.some((row) => row.id === reseller.id)).toBe(true);
  await expectAnyPage(staff, expected.data, reseller.phone);
  await page.goto("/resellers");
  await searchResellers(page, reseller.phone);
  await expectResellerRows(page, expected.data);
  const absent = `000${randomUUID().replace(/\D/g, "").slice(0, 8)}`;
  await page.locator("#any").fill(absent);
  const none = await resellers(staff, `any=${encodeURIComponent(absent)}`);
  expect(none.pagination.total).toBe(0);
  await expectResellerRows(page, none.data);
});

// ইউজারনেম দিয়ে সঠিক ফল আসে এবং অজানা ইউজারনেমে তালিকা খালি থাকে কি না দেখি।
test("RS-L02 Search resellers by username: show matches and no results for an unknown username", async ({ page, staff }) => {
  const listed = await resellers(staff);
  let username = "";
  let resellerId = "";
  for (const row of listed.data) {
    const detail = await resellerDetail(staff, row.id);
    const value = (detail.username ?? row.user?.username ?? "").trim();
    if (value.length < 3) continue;
    username = value;
    resellerId = row.id;
    break;
  }
  if (!username) throw new Error("Username filter needs a reseller username of at least 3 characters.");
  const expected = await resellers(staff, `any=${encodeURIComponent(username)}`);
  expect(expected.data.some((row) => row.id === resellerId)).toBe(true);
  await expectAnyPage(staff, expected.data, username);
  await page.goto("/resellers");
  await searchResellers(page, username);
  await expectResellerRows(page, expected.data);
  const absent = `nouser${randomUUID().replace(/-/g, "").slice(0, 10)}`;
  await page.locator("#any").fill(absent);
  const none = await resellers(staff, `any=${encodeURIComponent(absent)}`);
  expect(none.pagination.total).toBe(0);
  await expectResellerRows(page, none.data);
});

// স্ট্যাটাসে সঠিক রিসেলার আসে এবং রিলোডে ফিল্টার সরে যায় কি না দেখি।
test("RS-L02 Reseller status filter: show matching accounts and clear the filter on reload", async ({ page, staff }) => {
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

// জোন বেছে সেই জোনের রিসেলার দেখা যায় কি না API-এর সঙ্গে মিলিয়ে দেখি।
test("RS-L02 Reseller zone filter: show the selected zone's resellers", async ({ page, staff }) => {
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

// নেটওয়ার্ক বেছে সেই নেটওয়ার্কের রিসেলার দেখা যায় কি না যাচাই করি।
test("RS-L02 Reseller network filter: show the selected network's resellers", async ({ page, staff }) => {
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

// রিসেলারের নাম ও স্ট্যাটাস একসঙ্গে মেলা অ্যাকাউন্টই আসে কি না দেখি।
test("RS-L02 Combined reseller filters: show accounts matching both name and status", async ({ page, staff }) => {
  const reseller = await sample(staff);
  const status = Number(reseller.status ?? 0) === 1 ? 1 : 0;
  const expected = await resellers(staff, `any=${encodeURIComponent(reseller.name)}&status=${status}`);
  expect(expected.data.some((row) => row.id === reseller.id)).toBe(true);
  await expectAnyPage(staff, expected.data, reseller.name);
  expect(expected.data.every((row) => Number(row.status ?? 0) === status)).toBe(true);
  await page.goto("/resellers");
  await openFilters(page);
  await page.locator("#any").fill(reseller.name);
  await chooseOption(page, "status", status === 1 ? "Active" : "Inactive", false);
  await expectResellerRows(page, expected.data);
  await page.goto("/resellers");
  await expectResellerRows(page, (await resellers(staff)).data);
});

// রিসেলারের বর্তমান পেজের সীমা অনুযায়ী পেজের বোতাম কাজ করে কি না দেখি।
test("RS-L03 Reseller pagination: enable page navigation only within available pages", async ({ page, staff }) => {
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

// না মেলা নাম খুঁজলে খালি তালিকা আসে এবং মুছলে আগের রিসেলার ফিরে আসে কি না দেখি।
test("RS-L04 Reseller search with no matches: show an empty list and recover when cleared", async ({ page, staff }) => {
  const reseller = await sample(staff);
  await page.goto("/resellers");
  await expect(resellerRow(page, reseller)).toBeVisible();
  await resellerRow(page, reseller).getByRole("button", { name: "Open menu" }).click();
  await expect(page.getByRole("menuitem", { name: "View" })).toBeVisible();
  await page.keyboard.press("Escape");
  await openFilters(page);
  const unmatched = `E2E-NO-RESELLER-${randomUUID()}`;
  await page.locator("#any").fill(unmatched);
  const none = await resellers(staff, `any=${encodeURIComponent(unmatched)}`);
  expect(none.pagination.total).toBe(0);
  await expect(page.getByText("No results", { exact: true })).toBeVisible();
  await expect(page.getByText(reseller.name, { exact: true })).toHaveCount(0);
  await page.locator("#any").fill("");
  await expect(resellerRow(page, reseller)).toBeVisible();
  await expect(page.getByText("No results", { exact: true })).toHaveCount(0);
});
