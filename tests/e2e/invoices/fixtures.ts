import { z } from "zod";
import type { Page } from "@playwright/test";
import { test, expect, requirePermissions, type Session } from "@/tests/e2e/clients/fixtures";

// Independent Laravel resource contract. UUID is returned as id, despite the
// production InvoiceRowSchema's numeric id declaration. Do not coerce identity.
const Money = z.coerce.number().finite();
const InvoiceSchema = z.object({
  id: z.string().uuid(), trackID: z.string().min(1), status: z.enum(["due", "paid", "partial", "partial_paid"]),
  create_date: z.string(), due_date: z.string(), total_amount: Money,
  after_discount_amount: Money, amount_paid: Money, discount: Money, line_total_discount: Money,
  note: z.string().nullable().optional(), amount_due: Money.optional(),
  client: z.object({ id: z.number(), uuid: z.string().uuid(), name: z.string() }),
  invoice_type: z.object({ id: z.number(), name: z.string() }),
  zone: z.object({ id: z.number(), name: z.string() }).nullable().optional(),
  create_by: z.object({ id: z.number(), name: z.string() }).nullable().optional(),
  lines: z.array(z.object({ description: z.string(), amount: Money, quantity: Money, discount: Money, total_amount: Money }).passthrough()).optional(),
}).passthrough();
const ListSchema = z.object({ data: z.array(InvoiceSchema), pagination: z.object({ total: z.number(), current_page: z.number(), total_pages: z.number() }).passthrough() });
export type Invoice = z.infer<typeof InvoiceSchema>;
export async function invoices(staff: Session, query = "") {
  requirePermissions(staff, "invoices.access");
  return ListSchema.parse(await staff.get(`invoices${query ? `?${query}` : ""}`));
}
export async function detail(staff: Session, id: string) {
  requirePermissions(staff, "invoices.show");
  return InvoiceSchema.parse(await staff.get(`invoices/${id}`));
}
export async function sample(staff: Session, status?: Invoice["status"]) {
  const list = await invoices(staff, status ? `status=${status}` : "");
  const candidate = [...list.data].sort((a, b) => a.id.localeCompare(b.id))[0];
  if (!candidate) throw new Error(`Invoice checks require a visible ${status ?? "named"} invoice with client/type relations; provision local fixtures.`);
  return candidate;
}
export function row(page: Page, invoice: Invoice) {
  return page.getByRole("row").filter({ has: page.getByText(invoice.trackID, { exact: true }) });
}
export async function assertRows(page: Page, expected: Invoice[]) {
  if (!expected.length) {
    await expect(page.getByText("No results", { exact: true })).toBeVisible();
    return;
  }
  // Track ID is the mandatory, non-hideable identity column in both tables.
  await expect(page.locator("table tbody tr td:first-child")).toHaveText(expected.map(i => i.trackID));
}
export async function filters(page: Page) {
  const input = page.getByPlaceholder("Invoice ID", { exact: true });
  if (!await input.isVisible()) {
    // Shared desktop filter trigger lacks an accessible name; use rendered icon.
    await page.getByRole("button").filter({ has: page.locator("svg.lucide-funnel") }).click();
  }
  await expect(input).toBeVisible();
  return input;
}
export async function select(page: Page, field: string, label: string) {
  const input = page.locator(`#react-select-${field}-input`);
  if (field === "status") await input.click();
  else await input.fill(label);
  await page.getByRole("option", { name: label, exact: true }).click();
}
export async function createForm(page: Page, staff: Session) {
  requirePermissions(staff, "invoices.create");
  await page.goto("/invoices/create");
  // Bootstrap has async dropdowns/date defaults and no hydration-ready landmark.
  await page.waitForLoadState("networkidle");
  await expect(page.locator('[id="lines.0.description"]')).toBeVisible();
}
export { test, expect, requirePermissions };
