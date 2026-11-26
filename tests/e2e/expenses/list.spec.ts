import { randomUUID } from "node:crypto";
import {
  choices,
  chooseNamedOption,
  chooseOption,
  expect,
  expenseRow,
  expectExpenseRows,
  expectReportFigures,
  expenses,
  openFilters,
  parseExpenseDate,
  selectExpenseDate,
  test,
  type ExpenseList,
} from "@/tests/e2e/expenses/fixtures";
import type { Session } from "@/tests/e2e/clients/fixtures";

const STATUSES = [
  ["approved", "Approved"],
  ["pending", "Pending"],
  ["declined", "Declined"],
] as const;

function reportsOf(list: ExpenseList) {
  if (!list.reports) throw new Error("Expense list response has no report figures.");
  return list.reports;
}

async function requireExpense(staff: Session) {
  const listed = await expenses(staff);
  if (!listed.pagination.total) throw new Error("Expense checks need at least one expense.");
  return listed;
}

// খরচের পরিচয়, তারিখ, ভাউচার, সম্পর্কিত তথ্য, টাকা ও রিপোর্টের হিসাব API-এর সঙ্গে মিলিয়ে দেখি।
test("EX-L01 Expense list: show saved details, amounts, statuses, and report totals from the API", async ({ page, staff }) => {
  const listed = await expenses(staff);
  await page.goto("/expenses");
  const title = listed.pagination.total ? `Expenses (${listed.pagination.total})` : "Expenses";
  await expect(page.getByText(title, { exact: true })).toBeVisible();
  await expectExpenseRows(page, listed.data);
  await expectReportFigures(page, reportsOf(listed));
  await page.reload();
  const reloaded = await expenses(staff);
  expect(reloaded.pagination.total).toBe(listed.pagination.total);
  expect(reloaded.data.map((row) => row.id)).toEqual(listed.data.map((row) => row.id));
  await expectExpenseRows(page, reloaded.data);
  await expectReportFigures(page, reportsOf(reloaded));
});

// খরচের আইডি দিয়ে সঠিক খরচ আসে এবং সার্চ মুছলে আগের তালিকা ফেরে কি না দেখি।
test("EX-L02 Search expenses by ID: show the matching expense and restore the list when cleared", async ({ page, staff }) => {
  const listed = await requireExpense(staff);
  const expense = listed.data.find((row) => (row.expense_id ?? "").trim().length >= 3);
  if (!expense?.expense_id) throw new Error("Expense ID search needs a display ID of at least 3 characters.");
  const expected = await expenses(staff, `any=${encodeURIComponent(expense.expense_id)}`);
  expect(expected.data.some((row) => row.id === expense.id)).toBe(true);
  await page.goto("/expenses");
  await openFilters(page);
  await page.locator("#any").fill(expense.expense_id);
  await expectExpenseRows(page, expected.data);
  await page.locator("#any").fill("");
  await expectExpenseRows(page, (await expenses(staff)).data);
});

// ভাউচার দিয়ে সঠিক ফল এবং অজানা ভাউচারে খালি ফল আসে কি না যাচাই করি।
test("EX-L02 Search expenses by voucher: show matching expenses and no results for an unknown voucher", async ({ page, staff }) => {
  const listed = await requireExpense(staff);
  const expense = listed.data.find((row) => (row.voucher ?? "").trim().length >= 3);
  if (!expense?.voucher) throw new Error("Voucher search needs a voucher of at least 3 characters.");
  const expected = await expenses(staff, `any=${encodeURIComponent(expense.voucher)}`);
  expect(expected.data.some((row) => row.id === expense.id)).toBe(true);
  await page.goto("/expenses");
  await openFilters(page);
  await page.locator("#any").fill(expense.voucher);
  await expectExpenseRows(page, expected.data);
  const absent = `E2E-NO-VOUCHER-${randomUUID()}`;
  await page.locator("#any").fill(absent);
  const none = await expenses(staff, `any=${encodeURIComponent(absent)}`);
  expect(none.pagination.total).toBe(0);
  await expectExpenseRows(page, none.data);
});

// টাকার পরিমাণ দিয়ে সঠিক খরচ আসে এবং না মেলা পরিমাণে ফল খালি থাকে কি না দেখি।
test("EX-L02 Search expenses by amount: show matching expenses and no results for an unknown amount", async ({ page, staff }) => {
  const listed = await requireExpense(staff);
  const expense = listed.data.find((row) => String(Math.trunc(Math.abs(row.amount))).length >= 3);
  if (!expense) throw new Error("Amount search needs an amount of at least 3 digits.");
  const term = String(expense.amount);
  const expected = await expenses(staff, `any=${encodeURIComponent(term)}`);
  expect(expected.data.some((row) => row.id === expense.id)).toBe(true);
  await page.goto("/expenses");
  await openFilters(page);
  await page.locator("#any").fill(term);
  await expectExpenseRows(page, expected.data);
  const absent = `9${randomUUID().replace(/\D/g, "").slice(0, 8)}`;
  await page.locator("#any").fill(absent);
  const none = await expenses(staff, `any=${encodeURIComponent(absent)}`);
  expect(none.pagination.total).toBe(0);
  await expectExpenseRows(page, none.data);
});

// প্রতিটি স্ট্যাটাসের API ফল ও মোট সংখ্যা একই শর্ত মেনে চলে কি না যাচাই করি।
test("EX-L03 Expense status counts: return only the requested status and consistent API totals", async ({ staff }) => {
  const listed = await requireExpense(staff);
  const counts = await Promise.all(STATUSES.map(async ([status]) => (
    await expenses(staff, `status=${status}`)
  ).pagination.total));
  const sum = counts.reduce((total, count) => total + count, 0);
  expect(sum).toBeGreaterThan(0);
  expect(sum).toBeLessThan(listed.pagination.total * STATUSES.length);
  for (const [status, count] of STATUSES.map((item, index) => [item[0], counts[index]] as const)) {
    const pageRows = await expenses(staff, `status=${status}`);
    expect(pageRows.data.every((row) => row.status === status)).toBe(true);
    expect(pageRows.pagination.total).toBe(count);
  }
});

for (const [status, label] of STATUSES) {
  // প্রতিটি স্ট্যাটাস বেছে সঠিক খরচ আসে এবং পেজ আবার খুললে ফিল্টার সরে যায় কি না দেখি।
  test(`EX-L03 Expense status filter - ${label}: show matching expenses and clear the filter on reload`, async ({ page, staff }) => {
    await requireExpense(staff);
    const expected = await expenses(staff, `status=${status}`);
    expect(expected.data.every((row) => row.status === status)).toBe(true);
    await page.goto("/expenses");
    await openFilters(page);
    await chooseOption(page, "status", label, false);
    await expectExpenseRows(page, expected.data);
    await expectReportFigures(page, reportsOf(expected));
    await page.goto("/expenses");
    await expectExpenseRows(page, (await expenses(staff)).data);
  });
}

// স্টাফ ফিল্টার বদলালে নতুন স্টাফের খরচই আসে এবং আগের স্টাফের ফল থেকে যায় না কি না দেখি।
test("EX-L03 Expense staff filter: show only the selected staff's expenses when switching staff", async ({ page, staff }) => {
  test.fail(true, "The expense screen sends staff_id. ExpenseBy reads expense_by, so another staff is not isolated.");
  await requireExpense(staff);
  const options = choices(await staff.get("dropdown-staffs")).filter((option, index, all) => (
    all.findIndex((item) => item.id === option.id) === index && option.name.trim().length > 0
  ));
  const [first, second] = options;
  if (!first || !second) throw new Error("Staff filter needs two staff dropdown choices.");
  const expected = await expenses(staff, `staff_id=${first.id}`);
  const other = await expenses(staff, `staff_id=${second.id}`);
  const foreign = other.data.filter((row) => row.staff?.id !== second.id).map((row) => row.expense_id ?? row.id);
  expect(expected.data.every((row) => row.staff?.id === first.id)).toBe(true);
  expect(foreign).toEqual([]);
  const firstIds = new Set(expected.data.map((row) => row.id));
  expect(other.data.some((row) => firstIds.has(row.id))).toBe(false);
  await page.goto("/expenses");
  await openFilters(page);
  await chooseOption(page, "staff_id", second.name);
  await expectExpenseRows(page, other.data);
});

// জোন বদলালে নির্বাচিত জোনের খরচ আসে এবং আগের জোনের ফল দেখায় না কি না দেখি।
test("EX-L03 Expense zone filter: show the selected zone's expenses when switching zones", async ({ page, staff }) => {
  await requireExpense(staff);
  const options = choices(await staff.get("dropdown-zones"));
  const unique = options.filter((option, index, all) => (
    all.findIndex((item) => item.id === option.id) === index && option.name.trim().length > 0
  ));
  const first = unique[0];
  const second = unique[1];
  if (!first) throw new Error("Zone filter needs a zone dropdown choice.");
  const expected = await expenses(staff, `zone_id=${first.id}`);
  expect(expected.data.every((row) => row.zone?.id === first.id)).toBe(true);
  if (second) {
    const other = await expenses(staff, `zone_id=${second.id}`);
    expect(other.data.every((row) => row.zone?.id === second.id)).toBe(true);
    const firstIds = new Set(expected.data.map((row) => row.id));
    expect(other.data.some((row) => firstIds.has(row.id))).toBe(false);
  }
  await page.goto("/expenses");
  await openFilters(page);
  await chooseOption(page, "zone_id", first.name);
  await expectExpenseRows(page, expected.data);
});

// ফান্ড বদলালে সেই ফান্ডের খরচ আসে এবং আগের ফান্ডের ফল থেকে যায় না কি না দেখি।
test("EX-L03 Expense fund filter: show the selected fund's expenses when switching funds", async ({ page, staff }) => {
  await requireExpense(staff);
  const options = choices(await staff.get("dropdown-funds"));
  const unique = options.filter((option, index, all) => (
    all.findIndex((item) => item.id === option.id) === index && option.name.trim().length > 0
  ));
  const first = unique[0];
  const second = unique[1];
  if (!first) throw new Error("Fund filter needs a fund dropdown choice.");
  const expected = await expenses(staff, `fund_id=${first.id}`);
  expect(expected.data.every((row) => row.fund?.id === first.id)).toBe(true);
  if (second) {
    const other = await expenses(staff, `fund_id=${second.id}`);
    expect(other.data.every((row) => row.fund?.id === second.id)).toBe(true);
    const firstIds = new Set(expected.data.map((row) => row.id));
    expect(other.data.some((row) => firstIds.has(row.id))).toBe(false);
  }
  await page.goto("/expenses");
  await openFilters(page);
  await chooseOption(page, "fund_id", first.name);
  await expectExpenseRows(page, expected.data);
});

// খরচের ধরন বদলালে নতুন ধরনের সঠিক খরচ দেখায় কি না API-এর সঙ্গে মিলিয়ে দেখি।
test("EX-L03 Expense type filter: show the selected type's expenses when switching types", async ({ page, staff }) => {
  await requireExpense(staff);
  const options = choices(await staff.get("dropdown-expense-types")).filter((option, index, all) => (
    all.findIndex((item) => item.id === option.id) === index && option.name.trim().length > 0
  ));
  if (!options.length) throw new Error("Expense type filter needs an expense type dropdown choice.");
  await page.goto("/expenses");
  await openFilters(page);
  const first = await chooseNamedOption(page, "expense_type_id", options);
  const expected = await expenses(staff, `expense_type_id=${first.id}`);
  expect(expected.data.every((row) => row.expenseType?.id === first.id)).toBe(true);
  const second = options.find((option) => option.id !== first.id);
  if (second) {
    const other = await expenses(staff, `expense_type_id=${second.id}`);
    expect(other.data.every((row) => row.expenseType?.id === second.id)).toBe(true);
    const firstIds = new Set(expected.data.map((row) => row.id));
    expect(other.data.some((row) => firstIds.has(row.id))).toBe(false);
  }
  await expectExpenseRows(page, expected.data);
});

// নির্বাচিত তারিখের মধ্যে থাকা খরচ আসে এবং পেজ আবার খুললে ফিল্টার সরে যায় কি না দেখি।
test("EX-L03 Expense date filter: show expenses in the selected range and clear it on reload", async ({ page, staff }) => {
  const listed = await requireExpense(staff);
  const expense = listed.data.find((row) => parseExpenseDate(row.expense_date));
  const parsed = parseExpenseDate(expense?.expense_date);
  if (!expense || !parsed) throw new Error("Date filter needs an expense date in d-Mon-yy form.");
  const expected = await expenses(staff, `expense_date=${encodeURIComponent(`${parsed.iso},${parsed.iso}`)}`);
  expect(expected.data.some((row) => row.id === expense.id)).toBe(true);
  expect(expected.data.every((row) => row.expense_date === expense.expense_date)).toBe(true);
  await page.goto("/expenses");
  await selectExpenseDate(page, parsed.dataDay);
  await expectExpenseRows(page, expected.data);
  await expectReportFigures(page, reportsOf(expected));
  await page.goto("/expenses");
  await expectExpenseRows(page, (await expenses(staff)).data);
});

// একসঙ্গে খরচের আইডি ও স্ট্যাটাস দিলে দুটো শর্ত মেলা খরচই আসে কি না দেখি।
test("EX-L03 Combined expense filters: show expenses matching both ID and status", async ({ page, staff }) => {
  const listed = await requireExpense(staff);
  const expense = listed.data.find((row) => (row.expense_id ?? "").trim().length >= 3 && row.status);
  if (!expense?.expense_id || !expense.status) {
    throw new Error("Combined filter needs an expense ID and a status.");
  }
  const label = STATUSES.find(([status]) => status === expense.status)?.[1];
  if (!label) throw new Error(`Combined filter needs a pending, approved, or declined status. Received ${expense.status}.`);
  const expected = await expenses(
    staff,
    `any=${encodeURIComponent(expense.expense_id)}&status=${expense.status}`,
  );
  expect(expected.data.some((row) => row.id === expense.id)).toBe(true);
  expect(expected.data.every((row) => row.status === expense.status)).toBe(true);
  await page.goto("/expenses");
  await openFilters(page);
  await page.locator("#any").fill(expense.expense_id);
  await chooseOption(page, "status", label, false);
  await expectExpenseRows(page, expected.data);
  await page.goto("/expenses");
  await expectExpenseRows(page, (await expenses(staff)).data);
});

// পেজের সীমা ঠিক থাকে এবং পরের পেজ থেকে ফিল্টার দিলেও সঠিক খরচ দেখা যায় কি না দেখি।
test("EX-L04 Expense pagination: respect page limits and show matching expenses after filtering a later page", async ({ page, staff }) => {
  const first = await requireExpense(staff);
  await page.goto("/expenses");
  await expectExpenseRows(page, first.data);
  await expect(page.getByRole("button", { name: "Go to previous page", exact: true })).toBeDisabled();
  if (first.pagination.total_pages < 2) {
    await expect(page.getByRole("button", { name: "Go to next page", exact: true })).toBeDisabled();
    return;
  }
  const second = await expenses(staff, "page=2");
  expect(second.data.some((row) => first.data.some((known) => known.id === row.id))).toBe(false);
  await page.getByRole("button", { name: "Go to next page", exact: true }).click();
  await expectExpenseRows(page, second.data);
  await page.getByRole("button", { name: "Go to previous page", exact: true }).click();
  await expectExpenseRows(page, first.data);

  const target = first.data.find((row) => (row.expense_id ?? "").trim().length >= 3);
  if (!target?.expense_id) throw new Error("Later-page filter needs a first-page expense ID.");
  await page.getByRole("button", { name: "Go to next page", exact: true }).click();
  await expectExpenseRows(page, second.data);
  await openFilters(page);
  await page.locator("#any").fill(target.expense_id);
  const filtered = await expenses(staff, `any=${encodeURIComponent(target.expense_id)}`);
  expect(filtered.data.some((row) => row.id === target.id)).toBe(true);
  await expectExpenseRows(page, filtered.data);
});

// স্ট্যাটাস ফিল্টার বদলালে রিপোর্টের দুটো হিসাবই ফিল্টার করা API ফল অনুযায়ী বদলায় কি না দেখি।
test("EX-L05 Expense report totals: update both figures when the status filter changes", async ({ page, staff }) => {
  const listed = await requireExpense(staff);
  const expense = listed.data.find((row) => STATUSES.some(([status]) => status === row.status));
  if (!expense?.status) throw new Error("Report figures need a pending, approved, or declined expense.");
  const label = STATUSES.find(([status]) => status === expense.status)?.[1];
  if (!label) throw new Error(`Report figures need a known status. Received ${expense.status}.`);
  const expected = await expenses(staff, `status=${expense.status}`);
  await page.goto("/expenses");
  await openFilters(page);
  await chooseOption(page, "status", label, false);
  await expectExpenseRows(page, expected.data);
  await expectReportFigures(page, reportsOf(expected));
});

// না মেলা সার্চে খালি তালিকা আসে এবং সার্চ মুছলে পরিচিত খরচ ফিরে আসে কি না দেখি।
test("EX-L06 Expense search with no matches: show an empty list and recover when cleared", async ({ page, staff }) => {
  const listed = await requireExpense(staff);
  const expense = listed.data.find((row) => row.expense_id);
  if (!expense) throw new Error("Empty-search recovery needs an expense ID.");
  await page.goto("/expenses");
  await expectExpenseRows(page, listed.data);
  await openFilters(page);
  const unmatched = `E2E-NO-EXPENSE-${randomUUID()}`;
  await page.locator("#any").fill(unmatched);
  const none = await expenses(staff, `any=${encodeURIComponent(unmatched)}`);
  expect(none.pagination.total).toBe(0);
  await expect(page.getByText("No results", { exact: true })).toBeVisible();
  await expect(page.getByText(expense.expense_id ?? "", { exact: true })).toHaveCount(0);
  await page.locator("#any").fill("");
  await expectExpenseRows(page, (await expenses(staff)).data);
  await expect(page.getByText("No results", { exact: true })).toHaveCount(0);
});

// খরচের রিপোর্টে সঠিক শিরোনাম, সারি ও হিসাব থাকে এবং তৈরির অপশন থাকে না কি না দেখি।
test("EX-L07 Expense report page: show matching rows and totals without a create action", async ({ page, staff }) => {
  const listed = await expenses(staff);
  await page.goto("/reports/expenses");
  await expect(page).toHaveURL(/\/reports\/expenses$/);
  const title = listed.pagination.total ? `Expenses (${listed.pagination.total})` : "Expenses";
  await expect(page.getByText(title, { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add", exact: true })).toHaveCount(0);
  await expectExpenseRows(page, listed.data);
  await expectReportFigures(page, reportsOf(listed));
  if (listed.data.length) {
    for (const expense of listed.data) {
      const buttons = expenseRow(page, expense).locator("td").last().getByRole("button");
      await expect(buttons.last()).toBeVisible();
      if (staff.profile.permissions.includes("expenses.edit")) {
        await expect(buttons).toHaveCount(2);
      }
    }
    if (staff.profile.permissions.includes("expenses.approval")) {
      await expect(page.getByRole("button", { name: /Change status/ })).toHaveCount(listed.data.length);
    }
  }
});
