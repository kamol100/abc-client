import { z } from "zod";
import type { Locator, Page } from "@playwright/test";
import {
  authenticate,
  expect,
  requirePermissions,
  test,
  type Session,
} from "@/tests/e2e/clients/fixtures";

const RefSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
}).passthrough();

const ExpenseSchema = z.object({
  id: z.string().uuid(),
  voucher: z.string().nullable().optional(),
  expense_id: z.string().nullable().optional(),
  expense_date: z.string().nullable().optional(),
  amount: z.coerce.number(),
  note: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  staff: RefSchema.nullable().optional(),
  fund: RefSchema.nullable().optional(),
  zone: RefSchema.nullable().optional(),
  expenseType: RefSchema.nullable().optional(),
}).passthrough();

const ListSchema = z.object({
  data: z.array(ExpenseSchema),
  pagination: z.object({
    total: z.coerce.number(),
    current_page: z.coerce.number(),
    total_pages: z.coerce.number(),
  }).passthrough(),
  reports: z.object({
    total_amount: z.coerce.number(),
    pending_amount: z.coerce.number(),
  }).passthrough().optional(),
});

const ChoiceSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
}).passthrough();

const MONTHS: Record<string, number> = {
  Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
  Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
};

export type Expense = z.infer<typeof ExpenseSchema>;
export type ExpenseList = z.infer<typeof ListSchema>;
export type Choice = z.infer<typeof ChoiceSchema>;

export async function expenses(staff: Session, query = ""): Promise<ExpenseList> {
  requirePermissions(staff, "expenses.access");
  return ListSchema.parse(await staff.get(`expenses${query ? `?${query}` : ""}`));
}

export async function expenseDetail(staff: Session, id: string): Promise<Expense> {
  requirePermissions(staff, "expenses.show");
  return ExpenseSchema.parse(await staff.get(`expenses/${id}`));
}

export function choices(data: unknown): Choice[] {
  const wrapped = z.object({ data: z.array(ChoiceSchema) }).safeParse(data);
  if (wrapped.success) return wrapped.data.data;
  const paged = z.object({ data: z.object({ data: z.array(ChoiceSchema) }) }).safeParse(data);
  if (paged.success) return paged.data.data.data;
  return z.array(ChoiceSchema).parse(data);
}

export function money(amount: number): string {
  return `৳${new Intl.NumberFormat("en", { minimumFractionDigits: 0 }).format(amount)}`;
}

export function bdt(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "BDT" }).format(amount);
}

export function statusLabel(status: string | null | undefined): string {
  if (status === "approved") return "Approved";
  if (status === "declined") return "Declined";
  if (status === "pending" || status == null || status === "") return "Pending";
  return status;
}

export function expenseIdentity(expense: Expense): string {
  const identity = expense.expense_id?.trim();
  if (!identity) throw new Error("Expense checks need a display expense ID.");
  return identity;
}

export function expenseRow(page: Page, expense: Expense): Locator {
  return page.getByRole("row").filter({
    has: page.getByText(expenseIdentity(expense), { exact: true }),
  });
}

export async function expectExpenseRows(page: Page, rows: Expense[]) {
  if (!rows.length) {
    await expect(page.getByText("No results", { exact: true })).toBeVisible();
    return;
  }
  await expect(page.locator("table tbody tr td:first-child")).toHaveText(
    rows.map((row) => row.expense_id ?? "—"),
  );
  for (const expense of rows) {
    const cells = expenseRow(page, expense).locator("td");
    await expect(cells.nth(1)).toHaveText(expense.expense_date ?? "—");
    await expect(cells.nth(2)).toHaveText(expense.voucher ?? "—");
    await expect(cells.nth(3)).toHaveText(expense.staff?.name ?? "—");
    await expect(cells.nth(4)).toHaveText(expense.fund?.name ?? "—");
    await expect(cells.nth(5)).toHaveText(expense.zone?.name ?? "—");
    await expect(cells.nth(6)).toHaveText(expense.expenseType?.name ?? "—");
    await expect(cells.nth(7)).toHaveText(money(expense.amount));
    await expect(cells.nth(8)).toContainText(statusLabel(expense.status));
  }
}

export async function expectReportFigures(
  page: Page,
  reports: { total_amount: number; pending_amount: number },
) {
  const total = page.getByText("Total Expense", { exact: true }).locator("..").locator(".sr-only");
  const pending = page.getByText("Total Pending", { exact: true }).locator("..").locator(".sr-only");
  await expect(total).toHaveText(bdt(reports.total_amount));
  await expect(pending).toHaveText(bdt(reports.pending_amount));
}

export async function openFilters(page: Page) {
  const search = page.locator("#any");
  if (!(await search.isVisible())) {
    await page.getByRole("button").filter({ has: page.locator("svg.lucide-funnel") }).click();
  }
  await expect(search).toBeVisible();
}

export async function chooseOption(page: Page, field: string, label: string, searchable = true) {
  const input = page.locator(`#react-select-${field}-input`);
  await input.click();
  if (searchable) await input.fill(label);
  const option = page.getByRole("option", { name: label, exact: true });
  await expect(option).toBeVisible();
  await option.click();
}

export async function chooseNamedOption(page: Page, field: string, options: Choice[]): Promise<Choice> {
  const input = page.locator(`#react-select-${field}-input`).last();
  for (const choice of options) {
    await input.click({ force: true });
    await input.fill(choice.name);
    const exact = page.getByRole("option", { name: choice.name, exact: true });
    const available = page.getByRole("option");
    try {
      await expect(available.first()).toBeVisible({ timeout: 2_000 });
    } catch {
      await page.keyboard.press("Escape");
      continue;
    }
    if (await exact.count()) {
      await exact.click();
      return choice;
    }
    if (await available.count() === 1) {
      await available.click();
      return choice;
    }
    await page.keyboard.press("Escape");
  }
  throw new Error(`No ${field} choice is shown under its own name.`);
}

export function parseExpenseDate(value: string | null | undefined): { iso: string; dataDay: string } | null {
  const match = /^(\d{1,2})-([A-Za-z]{3})-(\d{2})$/.exec(value ?? "");
  if (!match) return null;
  const day = Number(match[1]);
  const month = MONTHS[match[2] ?? ""];
  const year = 2000 + Number(match[3]);
  if (!month || day < 1 || day > 31) return null;
  const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const dataDay = new Date(year, month - 1, day).toLocaleDateString("en-US");
  return { iso, dataDay };
}

export async function selectExpenseDate(page: Page, dataDay: string) {
  await openFilters(page);
  await page.getByRole("button", { name: "Expense Date", exact: true }).click();
  const dayButton = () => page.locator(
    `[data-slot="range-calendar"] td:not([data-outside]) button[data-day="${dataDay}"]`,
  );
  for (let step = 0; step < 36 && (await dayButton().count()) === 0; step += 1) {
    await page.getByRole("button", { name: "Go to the Previous Month" }).click();
  }
  for (let step = 0; step < 72 && (await dayButton().count()) === 0; step += 1) {
    await page.getByRole("button", { name: "Go to the Next Month" }).click();
  }
  await expect(dayButton()).toBeVisible();
  await dayButton().click();
  const apply = page.getByRole("button", { name: "Apply", exact: true });
  await expect(apply).toBeEnabled();
  await apply.click();
}

export function roleNames(settings: Record<string, unknown>): string[] {
  const roles = settings.roles;
  if (!Array.isArray(roles)) return [];
  return roles.flatMap((role) => {
    if (typeof role === "string") return [role];
    if (role && typeof role === "object" && "name" in role && typeof role.name === "string") {
      return [role.name];
    }
    return [];
  });
}

export function canChooseFund(staff: Session): boolean {
  const admin = roleNames(staff.profile.settings).some((role) => role === "Admin" || role === "Super Admin");
  return admin || staff.profile.permissions.includes("expenses.fund.update");
}

export function expenseSnapshot(expense: Expense) {
  return {
    id: expense.id,
    expense_id: expense.expense_id ?? null,
    amount: expense.amount,
    status: expense.status ?? null,
    voucher: expense.voucher ?? null,
    note: expense.note ?? null,
    expense_date: expense.expense_date ?? null,
    staff_id: expense.staff?.id ?? null,
    fund_id: expense.fund?.id ?? null,
    zone_id: expense.zone?.id ?? null,
    expense_type_id: expense.expenseType?.id ?? null,
  };
}

export function editButton(row: Locator): Locator {
  return row.locator("td").last().getByRole("button").first();
}

export function deleteButton(row: Locator): Locator {
  return row.locator("td").last().getByRole("button").last();
}

export { authenticate, expect, requirePermissions, test };
