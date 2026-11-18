import { randomUUID } from "node:crypto";
import type { Page } from "@playwright/test";
import {
  canChooseFund,
  choices,
  chooseNamedOption,
  chooseOption,
  editButton,
  expect,
  expenseDetail,
  expenseRow,
  expenseSnapshot,
  expenses,
  parseExpenseDate,
  requirePermissions,
  statusLabel,
  test,
  type Expense,
} from "@/tests/e2e/expenses/fixtures";

async function openCreate(page: Page) {
  await page.goto("/expenses");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Add Expense" });
  await expect(dialog.locator("#amount")).toBeVisible();
  return dialog;
}

function todayLabel(): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Dhaka",
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  }).format(new Date());
}

test("EX-F02 missing amount staff and type and an amount below 1 stay on the form", async ({ page, staff }) => {
  requirePermissions(staff, "expenses.access");
  const before = await expenses(staff);
  const dialog = await openCreate(page);
  await dialog.getByRole("button", { name: "Save", exact: true }).click();
  await expect(dialog.getByText("Staff is required", { exact: true })).toBeVisible();
  await expect(dialog.getByText("Expense type is required", { exact: true })).toBeVisible();
  await expect(dialog.getByText(/Amount is required|Amount must be at least 1/)).toBeVisible();

  await dialog.locator("#amount").fill("0");
  await dialog.getByRole("button", { name: "Save", exact: true }).click();
  await expect(dialog.getByText("Amount must be at least 1", { exact: true })).toBeVisible();
  await dialog.locator("#amount").fill("-1");
  await dialog.getByRole("button", { name: "Save", exact: true }).click();
  await expect(dialog.getByText("Amount must be at least 1", { exact: true })).toBeVisible();
  await expect(dialog).toBeVisible();
  expect((await expenses(staff)).pagination.total).toBe(before.pagination.total);
});

test("EX-F03 create starts on today's date and cancel stores nothing", async ({ page, staff }) => {
  requirePermissions(staff, "expenses.access");
  const before = await expenses(staff);
  const voucher = `E2E-CANCEL-${randomUUID()}`;
  const dialog = await openCreate(page);
  await expect(dialog.getByRole("button", { name: todayLabel() })).toBeVisible();
  await dialog.locator("#amount").fill("25");
  await dialog.locator("#voucher").fill(voucher);
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(dialog).toBeHidden();
  expect((await expenses(staff, `any=${encodeURIComponent(voucher)}`)).pagination.total).toBe(0);
  expect((await expenses(staff)).pagination.total).toBe(before.pagination.total);
});

async function openEdit(page: Page, expense: Expense) {
  await page.goto("/expenses");
  await editButton(expenseRow(page, expense)).click();
  const dialog = page.getByRole("dialog", { name: "Edit Expense" });
  await expect(dialog.locator("#amount")).toBeVisible();
  await expect.poll(async () => Number(await dialog.locator("#amount").inputValue())).toBe(expense.amount);
  return dialog;
}

test("EX-F04 edit hydrates the saved expense and cancel leaves it unchanged", async ({ page, staff }) => {
  requirePermissions(staff, "expenses.edit", "expenses.show");
  const listed = await expenses(staff);
  const expense = listed.data.find((row) => row.expense_id);
  if (!expense) throw new Error("Edit hydration needs an expense with a display ID.");
  const before = await expenseDetail(staff, expense.id);
  const dialog = await openEdit(page, before);
  await expect(dialog.getByText("NaN")).toHaveCount(0);
  await expect(dialog.locator("#voucher")).toHaveValue(before.voucher ?? "");
  await expect(dialog.locator("#note")).toHaveValue(before.note ?? "");
  if (before.staff?.name) await expect(dialog.getByText(before.staff.name, { exact: true }).first()).toBeVisible();
  if (before.fund?.name) await expect(dialog.getByText(before.fund.name, { exact: true }).first()).toBeVisible();
  if (before.zone?.name) await expect(dialog.getByText(before.zone.name, { exact: true }).first()).toBeVisible();
  if (before.expenseType?.name) {
    await expect(dialog.getByText(before.expenseType.name, { exact: true }).first()).toBeVisible();
  }
  const parsed = parseExpenseDate(before.expense_date);
  if (parsed) {
    const shown = new Intl.DateTimeFormat("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    }).format(new Date(`${parsed.iso}T00:00:00`));
    await expect(dialog.getByRole("button", { name: shown })).toBeVisible();
  } else {
    await expect(dialog.getByRole("button", { name: "Select expense date" })).toBeVisible();
  }
  if (staff.profile.permissions.includes("expenses.approval")) {
    await expect(dialog.getByText(statusLabel(before.status), { exact: true }).first()).toBeVisible();
  } else {
    await expect(dialog.locator("#react-select-status-input")).toHaveCount(0);
  }
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(dialog).toBeHidden();
  expect(expenseSnapshot(await expenseDetail(staff, before.id))).toEqual(expenseSnapshot(before));
});

test("EX-F05 list and edit render empty relations without null or undefined markers", async ({ page, staff }) => {
  requirePermissions(staff, "expenses.show", "expenses.edit");
  const listed = await expenses(staff);
  if (!listed.data.length) throw new Error("Relation rendering needs a visible expense.");
  await page.goto("/expenses");
  for (const expense of listed.data) {
    const cells = expenseRow(page, expense).locator("td");
    await expect(cells.nth(3)).toHaveText(expense.staff?.name ?? "—");
    await expect(cells.nth(4)).toHaveText(expense.fund?.name ?? "—");
    await expect(cells.nth(5)).toHaveText(expense.zone?.name ?? "—");
    await expect(cells.nth(6)).toHaveText(expense.expenseType?.name ?? "—");
    await expect(expenseRow(page, expense)).not.toContainText("undefined");
  }
  const expense = listed.data[0];
  if (!expense) throw new Error("Relation rendering needs a visible expense.");
  const detail = await expenseDetail(staff, expense.id);
  const dialog = await openEdit(page, detail);
  await expect(dialog.locator("#amount")).not.toHaveValue(/null|undefined/);
  await expect(dialog.locator("#voucher")).not.toHaveValue(/null|undefined/);
  await expect(dialog.locator("#note")).not.toHaveValue(/null|undefined/);
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
});

test("EX-F06 a voucher over 255 and a note over 1000 are rejected and create nothing", async ({ page, staff }) => {
  requirePermissions(staff, "expenses.access");
  const before = await expenses(staff);
  const staffOptions = choices(await staff.get("dropdown-staffs")).filter((choice) => choice.name.trim().length > 0);
  const typeOptions = choices(await staff.get("dropdown-expense-types")).filter((choice) => choice.name.trim().length > 0);
  if (!staffOptions.length || !typeOptions.length) {
    throw new Error("Length rejection needs a staff choice and an expense type.");
  }
  const voucher = `E2EV${randomUUID().replace(/-/g, "")}`.padEnd(256, "x");
  const dialog = await openCreate(page);
  await dialog.locator("#amount").fill("10");
  await chooseNamedOption(page, "staff_id", staffOptions);
  await chooseNamedOption(page, "expense_type_id", typeOptions);
  await dialog.locator("#voucher").fill(voucher);
  await dialog.locator("#note").fill("ন".repeat(1001));
  await dialog.getByRole("button", { name: "Save", exact: true }).click();
  await expect(dialog).toBeVisible();
  await expect(page.getByText(/255|1000/).first()).toBeVisible();
  await expect(dialog.locator("#voucher")).toHaveValue(voucher);
  expect((await expenses(staff, `any=${encodeURIComponent(voucher.slice(0, 24))}`)).pagination.total).toBe(0);
  expect((await expenses(staff)).pagination.total).toBe(before.pagination.total);
});

test("EX-F07 canceling an edited draft preserves the saved expense", async ({ page, staff }) => {
  requirePermissions(staff, "expenses.edit", "expenses.show");
  const listed = await expenses(staff);
  const expense = listed.data.find((row) => row.expense_id);
  if (!expense) throw new Error("Cancel-edit needs an expense with a display ID.");
  const before = await expenseDetail(staff, expense.id);
  const voucher = `E2E-DRAFT-${randomUUID()}`;
  const dialog = await openEdit(page, before);
  await dialog.locator("#amount").fill("77");
  await dialog.locator("#voucher").fill(voucher);
  await dialog.locator("#note").fill("খসড়া নোট");
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(dialog).toBeHidden();
  expect(expenseSnapshot(await expenseDetail(staff, before.id))).toEqual(expenseSnapshot(before));
  expect((await expenses(staff, `any=${encodeURIComponent(voucher)}`)).pagination.total).toBe(0);
});

test("EX-U03 an admin can open the fund choices and cancel stores nothing", async ({ page, staff }) => {
  requirePermissions(staff, "expenses.access");
  if (!canChooseFund(staff)) {
    throw new Error("Fund choice check needs Admin, Super Admin, or expenses.fund.update.");
  }
  const before = await expenses(staff);
  const funds = choices(await staff.get("dropdown-funds")).filter((choice) => choice.name.trim().length > 0);
  if (!funds.length) throw new Error("Fund choice check needs a tenant fund.");
  const dialog = await openCreate(page);
  const fund = dialog.locator("#react-select-fund_id-input");
  await expect(fund).toBeEnabled();
  await chooseOption(page, "fund_id", funds[0].name);
  await expect(dialog.getByText(funds[0].name, { exact: true }).first()).toBeVisible();
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(dialog).toBeHidden();
  expect((await expenses(staff)).pagination.total).toBe(before.pagination.total);
});
