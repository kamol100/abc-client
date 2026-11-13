import { z } from "zod";
import type { Page } from "@playwright/test";
import {
  authenticate,
  expect,
  requirePermissions,
  test,
  type Session,
} from "@/tests/e2e/clients/fixtures";

const RefSchema = z.object({ id: z.coerce.number(), name: z.string() }).passthrough();
const ResellerSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  prefix: z.string().nullable().optional(),
  status: z.coerce.number().optional(),
  company: z.string().nullable().optional(),
  billing_type: z.string().nullable().optional(),
  agent_id: z.coerce.number().nullable().optional(),
  commission: z.coerce.number().nullable().optional(),
  user: z.object({
    uuid: z.string().optional(),
    username: z.string().nullable().optional(),
    name: z.string().nullable().optional(),
  }).passthrough().nullable().optional(),
  wallet: z.object({
    id: z.string().uuid(),
    balance: z.coerce.number(),
  }).passthrough().nullable().optional(),
  zone: RefSchema.nullable().optional(),
  network: RefSchema.nullable().optional(),
  package: z.array(z.object({
    id: z.coerce.number(),
    name: z.string().nullable().optional(),
  }).passthrough()).nullable().optional(),
  active_clients: z.coerce.number().optional(),
  inactive_clients: z.coerce.number().optional(),
}).passthrough();
const ListSchema = z.object({
  data: z.array(ResellerSchema),
  pagination: z.object({
    total: z.coerce.number(),
    current_page: z.coerce.number(),
    total_pages: z.coerce.number(),
  }).passthrough(),
});
const ChoiceSchema = z.object({ id: z.coerce.number(), name: z.string() }).passthrough();

export type Reseller = z.infer<typeof ResellerSchema>;
export type Choice = z.infer<typeof ChoiceSchema>;

export async function resellers(staff: Session, query = "") {
  requirePermissions(staff, "resellers.access");
  return ListSchema.parse(await staff.get(`resellers${query ? `?${query}` : ""}`));
}

export async function resellerDetail(staff: Session, id: string) {
  requirePermissions(staff, "resellers.show");
  return ResellerSchema.parse(await staff.get(`resellers/${id}`));
}

export async function sample(staff: Session): Promise<Reseller> {
  const list = await resellers(staff);
  const reseller = list.data.find((row) => row.name.trim().length >= 3);
  if (!reseller) {
    throw new Error("Reseller checks need a visible reseller whose name is at least 3 characters.");
  }
  return reseller;
}

export function choices(data: unknown): Choice[] {
  const wrapped = z.object({ data: z.array(ChoiceSchema) }).safeParse(data);
  if (wrapped.success) return wrapped.data.data;
  const paged = z.object({ data: z.object({ data: z.array(ChoiceSchema) }) }).safeParse(data);
  if (paged.success) return paged.data.data.data;
  return z.array(ChoiceSchema).parse(data);
}

export function uniqueChoice(rows: Choice[], kind: string): Choice {
  const counts = new Map<string, number>();
  for (const row of rows) counts.set(row.name, (counts.get(row.name) ?? 0) + 1);
  const choice = rows.find((row) => row.name.trim().length > 0 && counts.get(row.name) === 1);
  if (!choice) throw new Error(`No uniquely named ${kind} is available.`);
  return choice;
}

export function resellerRow(page: Page, reseller: Reseller) {
  let row = page.getByRole("row").filter({ has: page.getByText(reseller.name, { exact: true }) });
  const username = reseller.user?.username;
  if (username) row = row.filter({ has: page.getByText(username, { exact: true }) });
  return row;
}

export function bdt(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "BDT" }).format(amount);
}

export async function expectResellerRows(page: Page, rows: Reseller[]) {
  if (!rows.length) {
    await expect(page.getByText("No results", { exact: true })).toBeVisible();
    return;
  }
  await expect(page.locator("table tbody tr td:first-child")).toHaveText(rows.map((row) => row.name));
  for (const reseller of rows) {
    const target = resellerRow(page, reseller);
    const cells = target.locator("td");
    await expect(cells.nth(1)).toHaveText(reseller.user?.username ?? "-");
    await expect(cells.nth(2)).toHaveText(reseller.phone ?? "-");
    await expect(cells.nth(3)).toContainText(`Active ${reseller.active_clients ?? 0}`);
    await expect(cells.nth(3)).toContainText(`Inactive ${reseller.inactive_clients ?? 0}`);
    await expect(target.locator(".sr-only", { hasText: bdt(reseller.wallet?.balance ?? 0) })).toBeVisible();
    await expect(cells.nth(5)).toHaveText(reseller.prefix ?? "-");
    await expect(cells.nth(6)).toContainText(Number(reseller.status ?? 0) === 1 ? "Active" : "Inactive");
  }
}

export async function openFilters(page: Page) {
  const name = page.locator("#name");
  if (!(await name.isVisible())) {
    await page.getByRole("button").filter({ has: page.locator("svg.lucide-funnel") }).click();
  }
  await expect(name).toBeVisible();
}

export async function chooseOption(page: Page, field: string, label: string, searchable = true) {
  const input = page.locator(`#react-select-${field}-input`);
  await input.click();
  if (searchable) await input.fill(label);
  const option = page.getByRole("option", { name: label, exact: true });
  await expect(option).toBeVisible();
  await option.click();
}

export function settingRecord(data: unknown): Record<string, unknown> {
  const settings = z.object({
    settings: z.union([z.record(z.unknown()), z.array(z.unknown())]),
  }).parse(data).settings;
  return Array.isArray(settings) ? {} : settings;
}

export function flag(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "1" || normalized === "true";
  }
  return false;
}

export const TERMINATION_SETTING = "auto_inactive_reseller_client_termination_date";

export async function openRowMenu(page: Page, reseller: Reseller) {
  await resellerRow(page, reseller).getByRole("button", { name: "Open menu" }).click();
}

export { authenticate, expect, requirePermissions, test };
