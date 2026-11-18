import { z } from "zod";
import type { Locator, Page } from "@playwright/test";
import {
  authenticate,
  expect,
  requirePermissions,
  test as clientTest,
  type Session,
} from "@/tests/e2e/clients/fixtures";
import type { TenantName } from "@/tests/e2e/clients/environment";

const RefSchema = z.object({ id: z.coerce.number(), name: z.string() }).passthrough();
const InvoiceDueSchema = z.object({ total_amount: z.coerce.number() }).passthrough();

const SmsClientSchema = z.object({
  cid: z.coerce.number(),
  name: z.string(),
  phone: z.string().nullable().optional(),
  pppoe_username: z.string().nullable().optional(),
  client_id: z.string().nullable().optional(),
  status: z.coerce.number().optional(),
  current_address: z.string().nullable().optional(),
  billing_term: z.string().nullable().optional(),
  payment_deadline: z.union([z.string(), z.number()]).nullable().optional(),
  zone: RefSchema.nullable().optional(),
  network: RefSchema.nullable().optional(),
  package: RefSchema.nullable().optional(),
  invoiceDue: z.array(InvoiceDueSchema).nullable().optional(),
}).passthrough();

const ListSchema = z.object({
  data: z.array(SmsClientSchema),
  pagination: z.object({
    total: z.coerce.number(),
    current_page: z.coerce.number(),
    total_pages: z.coerce.number(),
    per_page: z.coerce.number(),
  }).passthrough(),
});

const TemplateSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
  message: z.string().nullable().optional(),
  template_type: z.string().nullable().optional(),
}).passthrough();

const QuoteSchema = z.object({
  recipients: z.coerce.number(),
  total_units: z.coerce.number(),
  total_cost: z.coerce.number(),
  balance: z.coerce.number().nullable(),
  remaining_balance: z.coerce.number().nullable(),
  sufficient: z.boolean(),
  scheduled_at: z.string().nullable(),
  timezone: z.string(),
});

const ChoiceSchema = z.object({ id: z.coerce.number(), name: z.string() }).passthrough();

export type SmsClient = z.infer<typeof SmsClientSchema>;
export type SmsTemplate = z.infer<typeof TemplateSchema>;
export type SmsQuote = z.infer<typeof QuoteSchema>;
export type SmsList = z.infer<typeof ListSchema>;

export const PREVIEW_PHONE = "01700000999";
export const PREVIEW_BODY = "E2E sms 1";

const LIST_TYPES = ["custom_client", "invoice_due", "invoice_due_reminder"] as const;
const SUPPORTED_TYPES = new Set<string>([...LIST_TYPES, "custom_other"]);
const GSM7 = "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞ ÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜabcdefghijklmnopqrstuvwxyz§äöñüà^{}\\[~]|€";
const GSM7_EXTENSION = "^{}\\[~]|€";

/** GSM-7 uses 160 then 153 septets. Any other character uses 70 then 67. */
export function smsUnits(message: string): number {
  if ([...message].length === 0) return 0;
  let septets = 0;
  for (const char of message) {
    if (!GSM7.includes(char)) {
      const length = [...message].length;
      return length <= 70 ? 1 : Math.ceil(length / 67);
    }
    septets += GSM7_EXTENSION.includes(char) ? 2 : 1;
  }
  return septets <= 160 ? 1 : Math.ceil(septets / 153);
}

export function round4(value: number): number {
  return Math.round(value * 10_000) / 10_000;
}

export function moneyText(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "BDT" }).format(amount);
}

export function countText(amount: number): string {
  return new Intl.NumberFormat("en-US").format(amount);
}

export function expectMoney(actual: number | null, expected: number | null) {
  if (actual === null || expected === null) {
    expect(actual).toBe(expected);
    return;
  }
  expect(Math.abs(actual - expected)).toBeLessThan(0.0001);
}

export function singleSmsPrice(message: string, rate: number, balance: number | null) {
  const totalUnits = smsUnits(message);
  const totalCost = round4(rate * totalUnits);
  return {
    recipients: 1,
    total_units: totalUnits,
    total_cost: totalCost,
    balance,
    remaining_balance: balance === null ? null : round4(balance - totalCost),
    sufficient: balance !== null && balance + 0.0001 >= totalCost,
  };
}

export function dueAmount(client: SmsClient): number {
  return round4((client.invoiceDue ?? []).reduce((sum, invoice) => sum + invoice.total_amount, 0));
}

export function clientIdentity(client: SmsClient): string {
  return client.pppoe_username || client.client_id || "—";
}

export function clientQuery(template: SmsTemplate, extra = ""): string {
  const parts: string[] = [];
  if (template.template_type === "invoice_due" || template.template_type === "invoice_due_reminder") {
    parts.push("invoice=due");
  }
  if (extra) parts.push(extra);
  return parts.join("&");
}

function unwrapChoices(data: unknown) {
  const wrapped = z.object({ data: z.array(ChoiceSchema) }).safeParse(data);
  if (wrapped.success) return wrapped.data.data;
  const paged = z.object({ data: z.object({ data: z.array(ChoiceSchema) }) }).safeParse(data);
  if (paged.success) return paged.data.data.data;
  return z.array(ChoiceSchema).parse(data);
}

function unwrapTemplates(data: unknown): SmsTemplate[] {
  const rows = z.array(TemplateSchema).safeParse(data);
  if (rows.success) return rows.data;
  return z.object({ data: z.array(TemplateSchema) }).parse(data).data;
}

export function requireSmsSender(staff: Session) {
  if (!staff.profile.permissions.includes("sms-store.store") && !staff.profile.permissions.includes("sms-send.access")) {
    throw new Error(`Selected ${staff.tenant} persona cannot send SMS. Assign sms-store.store or sms-send.access.`);
  }
}

export async function smsClients(staff: Session, query = ""): Promise<SmsList> {
  requireSmsSender(staff);
  return ListSchema.parse(await staff.get(`sms-clients${query ? `?${query}` : ""}`));
}

export async function smsTemplates(staff: Session): Promise<SmsTemplate[]> {
  requireSmsSender(staff);
  return unwrapTemplates(await staff.get("dropdown-sms-templates"));
}

export async function smsTemplateDetail(staff: Session, id: number): Promise<SmsTemplate> {
  return TemplateSchema.parse(await staff.get(`sms-template/${id}`));
}

export async function smsRate(staff: Session): Promise<number> {
  requireSmsSender(staff);
  return z.object({ rate: z.coerce.number() }).parse(await staff.get("sms-rate")).rate;
}

export async function walletAvailable(staff: Session): Promise<number | null> {
  requirePermissions(staff, "wallets.my");
  const wallet = z.object({
    id: z.string().uuid().optional(),
    balance: z.coerce.number().optional(),
    credit_balance: z.coerce.number().optional(),
  }).passthrough().parse(await staff.get("my-wallet"));
  if (!wallet.id) return null;
  return round4((wallet.balance ?? 0) + (wallet.credit_balance ?? 0));
}

export async function dropdownChoices(staff: Session, path: string) {
  requireSmsSender(staff);
  return unwrapChoices(await staff.get(path));
}

export function uniqueTemplate(templates: SmsTemplate[], type: string): SmsTemplate {
  const counts = new Map<string, number>();
  for (const row of templates) counts.set(row.name, (counts.get(row.name) ?? 0) + 1);
  const choice = templates.find((row) => (
    row.template_type === type && row.name.trim().length > 0 && counts.get(row.name) === 1
  ));
  if (!choice) throw new Error(`No uniquely named ${type} SMS template is available.`);
  return choice;
}

export function listTemplate(templates: SmsTemplate[]): SmsTemplate {
  for (const type of LIST_TYPES) {
    const choice = templates.find((row) => row.template_type === type && row.name.trim().length > 0);
    if (!choice) continue;
    const counts = templates.filter((row) => row.name === choice.name).length;
    if (counts === 1) return choice;
  }
  throw new Error("SMS client list needs a uniquely named custom client, invoice due, or invoice due reminder template.");
}

export function unsupportedTemplate(templates: SmsTemplate[]): SmsTemplate | undefined {
  const counts = new Map<string, number>();
  for (const row of templates) counts.set(row.name, (counts.get(row.name) ?? 0) + 1);
  return templates.find((row) => (
    Boolean(row.template_type)
    && !SUPPORTED_TYPES.has(row.template_type ?? "")
    && row.name.trim().length > 0
    && counts.get(row.name) === 1
  ));
}

export function clientRow(page: Page, client: SmsClient) {
  return page.getByRole("row").filter({
    has: page.getByText(clientIdentity(client), { exact: true }),
  }).filter({
    has: page.getByText(client.name, { exact: true }),
  });
}

export async function expectClientRows(page: Page, rows: SmsClient[]) {
  if (!rows.length) {
    await expect(page.getByText("No results", { exact: true })).toBeVisible();
    return;
  }
  await expect(page.getByText("No results", { exact: true })).toHaveCount(0);
  for (const client of rows) {
    const row = clientRow(page, client);
    await expect(row).toBeVisible();
    await expect(row).toContainText(client.phone || "—");
    await expect(row).toContainText(client.zone?.name || "—");
    await expect(row).toContainText(client.network?.name || "—");
    await expect(row).toContainText(client.package?.name || "—");
    await expect(row).toContainText(client.status === 1 ? "Active" : "Inactive");
    await expect(row.locator(".sr-only", { hasText: moneyText(dueAmount(client)) })).toBeVisible();
  }
}

export function filterForm(page: Page) {
  return page.locator("form").filter({ has: page.locator("#any") });
}

export async function chooseOption(page: Page, field: string, label: string, searchable = true) {
  const input = page.locator(`#react-select-${field}-input`);
  await input.click();
  if (searchable) await input.fill(label);
  const option = page.getByRole("option", { name: label, exact: true });
  await expect(option).toBeVisible();
  await option.click();
  await expect(page.locator(".select__menu-portal")).toHaveCount(0);
}

export async function openSmsPage(page: Page) {
  await page.goto("/sms-send");
  await expect(page.getByRole("heading", { name: "Send SMS", exact: true })).toBeVisible();
  await expect(page.getByText("Send single and bulk SMS.", { exact: true })).toBeVisible();
  await expect(page.getByRole("radio", { name: "Live Mode", exact: true })).toBeChecked();
}

export async function selectTemplate(page: Page, template: SmsTemplate) {
  await chooseOption(page, "sms_template_id", template.name);
}

export async function openClientList(page: Page, staff: Session, template: SmsTemplate) {
  await openSmsPage(page);
  await selectTemplate(page, template);
  const detail = await smsTemplateDetail(staff, template.id);
  await expect(page.getByRole("heading", { name: "Client List", exact: true })).toBeVisible();
  const description = template.template_type === "invoice_due" || template.template_type === "invoice_due_reminder"
    ? "Only clients with an invoice due are listed for this template."
    : "SMS will be sent to all clients that match the current filters.";
  await expect(page.getByText(description, { exact: true })).toBeVisible();
  await expect(page.locator("#sms_body")).toHaveValue(detail.message ?? "");
  return detail;
}

export function sendButton(page: Page, mode: "live" | "test" = "live") {
  const name = mode === "test" ? "Simulate send" : "Send SMS";
  return page.getByRole("button", { name, exact: true });
}

export function confirmDialog(page: Page, mode: "live" | "test" = "live") {
  const name = mode === "test" ? "Confirm test send" : "Confirm SMS sending";
  return page.getByRole("dialog", { name });
}

export function dialogMetric(dialog: Locator, label: string) {
  return dialog.locator("dt").filter({ hasText: new RegExp(`^${label}$`) }).locator("xpath=..").locator(".sr-only");
}

export function formMetric(page: Page, label: string) {
  return page.getByText(label, { exact: true }).locator("xpath=..").locator(".sr-only");
}

export async function expectDialogQuote(dialog: Locator, quote: {
  recipients: number;
  total_units: number;
  total_cost: number;
  balance: number | null;
}) {
  await expect(dialogMetric(dialog, "Recipients")).toHaveText(countText(quote.recipients));
  await expect(dialogMetric(dialog, "Total SMS")).toHaveText(countText(quote.total_units));
  await expect(dialogMetric(dialog, "Total cost")).toHaveText(moneyText(quote.total_cost));
  if (quote.balance === null) {
    await expect(dialog.locator("dt").filter({ hasText: /^Wallet balance$/ }).locator("xpath=..")).toContainText("—");
  } else {
    await expect(dialogMetric(dialog, "Wallet balance")).toHaveText(moneyText(quote.balance));
  }
}

export async function cancelDialog(page: Page, mode: "live" | "test" = "live") {
  const dialog = confirmDialog(page, mode);
  await dialog.getByRole("button", { name: /^cancel$/i }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByText("SMS queued successfully", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Test completed. No SMS was sent and no charge was applied.", { exact: true })).toHaveCount(0);
}

export function smsTenant(): Extract<TenantName, "vp" | "mk"> {
  const selected = process.env.E2E_TENANT ?? "vp";
  if (selected !== "vp" && selected !== "mk") {
    throw new Error("SMS send company tests require E2E_TENANT=vp or mk.");
  }
  return selected;
}

export const test = clientTest.extend<object, { staff: Session }>({
  staff: [async ({ browser }, use) => {
    const session = await authenticate(browser, smsTenant());
    try {
      await use(session);
    } finally {
      await session.dispose();
    }
  }, { scope: "worker" }],
});

export { authenticate, expect, requirePermissions };
