import { z } from "zod";
import { randomUUID } from "node:crypto";
import { test, expect, invoices, sample, row, assertRows, filters, select } from "@/tests/e2e/invoices/fixtures";

// রিলোডের পর ইনভয়েসের পরিচয়, তারিখ, ক্লায়েন্ট, ধরন ও স্ট্যাটাস API-এর সঙ্গে মেলে কি না দেখি।
test("IV-L01 Invoice list: show saved invoice details and statuses after reload", async ({ page, staff }) => {
  const expected = await invoices(staff);
  expect(expected.data.length, "Seed at least one invoice").toBeGreaterThan(0);
  await page.goto("/invoices");
  await assertRows(page, expected.data);
  await expect(page.getByText(`Invoices (${expected.pagination.total})`, { exact: true })).toBeVisible();
  for (const item of expected.data) {
    const target = row(page, item);
    await expect(target.getByText(item.client.name, { exact: true })).toBeVisible();
    await expect(target.getByText(item.invoice_type.name, { exact: true })).toBeVisible();
    await expect(target).toContainText(item.create_date);
    await expect(target).toContainText(item.due_date);
    const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "BDT" }).format(item.after_discount_amount);
    await expect(target.locator("p.font-semibold .sr-only")).toHaveText(currency);
    await expect(target.getByText(item.status.startsWith("partial") ? "Partial" : item.status === "paid" ? "Paid" : "Due", { exact: true })).toBeVisible();
  }
  await page.reload();
  await assertRows(page, expected.data);
});

// ট্র্যাক আইডির সঠিক ইনভয়েস আসে, অন্যগুলো বাদ যায় এবং সার্চ মুছলে তালিকা ফেরে কি না দেখি।
test("IV-L02 Search invoices by track ID: show the matching invoice and restore the list when cleared", async ({ page, staff }) => {
  const item = await sample(staff);
  const expected = await invoices(staff, `track_id=${encodeURIComponent(item.trackID)}&trackID=${encodeURIComponent(item.trackID)}`);
  expect(expected.data.some(i => i.id === item.id)).toBe(true);
  await page.goto("/invoices");
  const input = await filters(page);
  await input.fill(item.trackID);
  await assertRows(page, expected.data);
  await input.fill("");
  await assertRows(page, (await invoices(staff)).data);
});

for (const [status, label] of [["due", "Due"], ["paid", "Paid"], ["partial", "Partial"]] as const) {
  // প্রতিটি স্ট্যাটাস ফিল্টারে সেই স্ট্যাটাসের ইনভয়েসই আসে কি না যাচাই করি।
  test(`IV-L02 Invoice status filter - ${label}: show matching invoices and hide other statuses`, async ({ page, staff }) => {
    const expected = await invoices(staff, `status=${status}`);
    expect(expected.data.every(i => i.status === status || (status === "partial" && i.status === "partial_paid"))).toBe(true);
    await page.goto("/invoices");
    await filters(page);
    await select(page, "status", label);
    await assertRows(page, expected.data);
    await page.reload();
    await assertRows(page, (await invoices(staff)).data);
  });
}

for (const [field, relation] of [["invoice_type_id", "invoice_type"], ["client_id", "client"], ["zone_id", "zone"]] as const) {
  // ইনভয়েসের ধরন, ক্লায়েন্ট বা জোন ফিল্টারে সঠিক ইনভয়েস আসে এবং অন্যগুলো বাদ যায় কি না দেখি।
  test(`IV-L02 Invoice ${field === 'invoice_type_id' ? 'type' : field === 'zone_id' ? 'zone' : 'client'} filter: show matching invoices and hide nonmatches`, async ({ page, staff }) => {
    const item = await sample(staff);
    const ref = item[relation];
    if (!ref) throw new Error(`Invoice fixture requires ${relation} for this filter check.`);
    const expected = await invoices(staff, `${field}=${ref.id}`);
    expect(expected.data.length).toBeGreaterThan(0);
    expect(expected.data.every(i => i[relation]?.id === ref.id)).toBe(true);
    await page.goto("/invoices");
    await filters(page);
    const endpoint = { invoice_type_id: "dropdown-invoice-types", client_id: "dropdown-clients", zone_id: "dropdown-zones", create_by: "dropdown-staffs" }[field];
    const options = z.array(z.object({ id: z.coerce.number(), name: z.string() })).parse(await staff.get(endpoint));
    const matching = options.filter(option => option.id === ref.id);
    expect(matching).toHaveLength(1);
    await select(page, field, matching[0].name);
    await assertRows(page, expected.data);
  });
}

// ট্র্যাক আইডি ও স্ট্যাটাস একসঙ্গে কাজ করে এবং রিসেট করলে আগের তালিকা ফেরে কি না দেখি।
test("IV-L02 Combined invoice filters: match both track ID and status, then reset to the full list", async ({ page, staff }) => {
  const item = await sample(staff);
  const status = item.status.startsWith("partial") ? "partial" : item.status;
  const expected = await invoices(staff, `track_id=${encodeURIComponent(item.trackID)}&status=${status}`);
  expect(expected.data.some(i => i.id === item.id)).toBe(true);
  await page.goto("/invoices");
  const input = await filters(page);
  await input.fill(item.trackID);
  await select(page, "status", status === "due" ? "Due" : status === "paid" ? "Paid" : "Partial");
  await assertRows(page, expected.data);
  await page.goto("/invoices");
  await assertRows(page, (await invoices(staff)).data);
});

// তৈরিকারী স্টাফ অনুযায়ী ইনভয়েস আসে এবং ফিল্টার মুছলে তালিকা ফিরে আসে কি না দেখি।
test("IV-L02 Invoice creator filter: show the selected staff's invoices and restore the list when cleared", async ({ page, staff }) => {
  const options = z.array(z.object({ id: z.coerce.number(), name: z.string() })).parse(await staff.get("dropdown-staffs"));
  const creator = [...options].sort((a, b) => a.id - b.id)[0];
  if (!creator) throw new Error("Creator filter needs a tenant-owned staff dropdown fixture.");
  const expected = await invoices(staff, `create_by=${creator.id}`);
  await page.goto("/invoices");
  await filters(page);
  await select(page, "create_by", creator.name);
  await assertRows(page, expected.data);
  await page.goto("/invoices");
  await assertRows(page, (await invoices(staff)).data);
  // Resource omits create_by; this checks UI/API agreement, not creator ownership.
});

// বর্তমান পেজ অনুযায়ী বোতামের অবস্থা ও ইনভয়েসের সারিগুলো সঠিক থাকে কি না দেখি।
test("IV-L03 Invoice pagination: show the correct page controls and invoice rows", async ({ page, staff }) => {
  const first = await invoices(staff);
  await page.goto("/invoices");
  await assertRows(page, first.data);
  await expect(page.getByRole("button", { name: "Go to previous page", exact: true })).toBeDisabled();
  if (first.pagination.total_pages < 2) {
    // Single-page fixture exercises its actual boundary. Multi-page coverage is
    // still pending when this branch runs; it is not credited from this result.
    await expect(page.getByRole("button", { name: "Go to next page", exact: true })).toBeDisabled();
    return;
  }
  const second = await invoices(staff, "page=2");
  expect(second.data.some(i => first.data.some(j => j.id === i.id))).toBe(false);
  await page.getByRole("button", { name: "Go to next page", exact: true }).click();
  await assertRows(page, second.data);
  await page.getByRole("button", { name: "Go to previous page", exact: true }).click();
  await assertRows(page, first.data);
});

// নির্দিষ্ট ক্লায়েন্টের ইতিহাসে শুধু তার ইনভয়েস থাকে এবং রিলোডেও সীমা ঠিক থাকে কি না দেখি।
test("IV-L05 Client invoice history: show only that client's invoices and retain the scope after reload", async ({ page, staff }) => {
  const item = await sample(staff);
  const expected = await invoices(staff, `client_uuid=${item.client.uuid}`);
  expect(expected.data.length).toBeGreaterThan(0);
  expect(expected.data.every(i => i.client.uuid === item.client.uuid)).toBe(true);
  await page.goto(`/invoices/client/${item.client.uuid}`);
  await assertRows(page, expected.data);
  await page.reload();
  await assertRows(page, expected.data);
});

// না মেলা ট্র্যাক আইডিতে খালি ফল আসে এবং সার্চ মুছলে তালিকা ফিরে আসে কি না দেখি।
test("IV-L06 Invoice search with no matches: show an empty list and recover when cleared", async ({ page, staff }) => {
  const baseline = await invoices(staff);
  const marker = `E2E-no-invoice-${randomUUID()}`;
  expect((await invoices(staff, `track_id=${marker}`)).data).toHaveLength(0);
  await page.goto("/invoices");
  const input = await filters(page);
  await input.fill(marker);
  await assertRows(page, []);
  await input.fill("");
  await assertRows(page, baseline.data);
});
