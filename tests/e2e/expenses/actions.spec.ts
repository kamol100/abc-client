import { z } from "zod";
import {
  deleteButton,
  expect,
  expenseDetail,
  expenseRow,
  expenseSnapshot,
  expenses,
  requirePermissions,
  test,
  type Expense,
} from "@/tests/e2e/expenses/fixtures";
import type { Session } from "@/tests/e2e/clients/fixtures";

const FundPageSchema = z.object({
  data: z.array(z.object({
    name: z.string(),
    balance: z.coerce.number(),
  }).passthrough()),
  pagination: z.object({
    total_pages: z.coerce.number(),
  }).passthrough(),
});

const TransactionPageSchema = z.object({
  data: z.array(z.object({
    id: z.string(),
    amount: z.coerce.number(),
    transaction_type: z.string().nullable().optional(),
  }).passthrough()),
  pagination: z.object({
    total: z.coerce.number(),
    total_pages: z.coerce.number(),
  }).passthrough(),
});

async function fundBalance(staff: Session, name: string): Promise<number> {
  const matches: number[] = [];
  let page = 1;
  let pages = 1;
  do {
    const list = FundPageSchema.parse(await staff.get(`funds?page=${page}`));
    pages = list.pagination.total_pages;
    for (const fund of list.data) {
      if (fund.name.toLowerCase() === name.toLowerCase()) matches.push(fund.balance);
    }
    page += 1;
  } while (page <= pages && page <= 10);
  if (pages > 10) throw new Error("Fund balance lookup stopped after 10 pages.");
  if (matches.length !== 1) {
    throw new Error(`Fund balance lookup needs one fund named ${name}. Found ${matches.length}.`);
  }
  return matches[0] ?? 0;
}

async function transactions(staff: Session, fundId: number) {
  const rows: { id: string; amount: number; type: string | null }[] = [];
  let page = 1;
  let pages = 1;
  let total = 0;
  do {
    const list = TransactionPageSchema.parse(await staff.get(`fund-transactions?fund_id=${fundId}&page=${page}`));
    pages = list.pagination.total_pages;
    total = list.pagination.total;
    rows.push(...list.data.map((row) => ({
      id: row.id,
      amount: row.amount,
      type: row.transaction_type ?? null,
    })));
    page += 1;
  } while (page <= pages && page <= 5);
  return { total, rows, complete: pages <= 5 };
}

test("EX-D01 cancel delete keeps the expense, its fund balance, and fund transactions", async ({ page, staff }) => {
  requirePermissions(staff, "expenses.show", "expenses.access");
  const listed = await expenses(staff);
  const expense = listed.data.find((row) => row.fund && row.expense_id) ?? listed.data.find((row) => row.expense_id);
  if (!expense) throw new Error("Cancel delete needs an expense with a display ID.");
  const before = await expenseDetail(staff, expense.id);
  const ledger = await ledgerSnapshot(staff, before);
  await page.goto("/expenses");
  await deleteButton(expenseRow(page, before)).click();
  const dialog = page.getByRole("dialog", { name: "Confirm Delete" });
  await expect(dialog.getByText("Are you sure you want to delete this expense?", { exact: true })).toBeVisible();
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(dialog).toBeHidden();
  await deleteButton(expenseRow(page, before)).click();
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(dialog).toBeHidden();
  expect(expenseSnapshot(await expenseDetail(staff, before.id))).toEqual(expenseSnapshot(before));
  expect(await ledgerSnapshot(staff, before)).toEqual(ledger);
  await page.reload();
  await expect(expenseRow(page, before)).toBeVisible();
});

async function ledgerSnapshot(staff: Session, expense: Expense) {
  if (!expense.fund) return { balance: null, transactions: null };
  requirePermissions(staff, "funds.access", "fund-transactions.access");
  return {
    balance: await fundBalance(staff, expense.fund.name),
    transactions: await transactions(staff, expense.fund.id),
  };
}
