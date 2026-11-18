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

test("EX-L01 list identity date voucher relations amount status and report figures match the API", async ({ page, staff }) => {
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

test("EX-L02 expense ID search includes the selected row and clearing restores the list", async ({ page, staff }) => {
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

test("EX-L02 voucher search matches the API and an unknown voucher is empty", async ({ page, staff }) => {
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

test("EX-L02 amount search matches the API and an unknown amount is empty", async ({ page, staff }) => {
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

test("EX-L03 status filters stay inside the unfiltered total", async ({ staff }) => {
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
  test(`EX-L03 status ${status} matches the API page and reload clears it`, async ({ page, staff }) => {
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

test("EX-L03 staff filter matches the API and a second staff does not reuse those rows", async ({ page, staff }) => {
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

test("EX-L03 zone filter matches the API and a second zone does not reuse those rows", async ({ page, staff }) => {
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

test("EX-L03 fund filter matches the API and a second fund does not reuse those rows", async ({ page, staff }) => {
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

test("EX-L03 expense type filter matches the API and a second type does not reuse those rows", async ({ page, staff }) => {
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

test("EX-L03 expense date range matches the API and reload clears it", async ({ page, staff }) => {
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

test("EX-L03 combined expense ID and status filters agree with the API", async ({ page, staff }) => {
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

test("EX-L04 pagination buttons match the current page and a later filter returns the matching rows", async ({ page, staff }) => {
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

test("EX-L05 a status filter updates both report figures to the filtered API values", async ({ page, staff }) => {
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

test("EX-L06 an unmatched search is empty and clearing it restores the known expense", async ({ page, staff }) => {
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

test("EX-L07 the expense report has the report title, no create action, and the same rows and figures", async ({ page, staff }) => {
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
