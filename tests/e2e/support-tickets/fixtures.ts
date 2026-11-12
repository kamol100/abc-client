import { test as base, expect, type Browser, type Page } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { backendURL, tenantCredentials, type TenantName } from "@/tests/e2e/clients/environment";

const NamedSchema = z.object({ id: z.coerce.number().int().positive(), name: z.string() }).passthrough();
const TicketSchema = z.object({
  id: z.string().uuid(),
  ticket_code: z.string().min(1),
  message: z.string(),
  priority: z.enum(["low", "medium", "high"]),
  status: z.enum(["open", "in_progress", "resolved", "closed"]),
  client: NamedSchema.extend({
    phone: z.string().nullable().optional(),
  }).nullable().optional(),
  subject: NamedSchema.nullable().optional(),
  staff: NamedSchema.nullable().optional(),
  messages_count: z.coerce.number().optional(),
}).passthrough();
const MessageSchema = z.object({
  id: z.coerce.number(),
  message: z.string(),
  staff: NamedSchema.nullable().optional(),
  client: NamedSchema.nullable().optional(),
  created_at: z.string().nullable().optional(),
}).passthrough();
const ProfileSchema = z.object({
  profile: z.object({
    username: z.string(),
    name: z.string().optional(),
    company: z.object({ domain: z.string() }),
  }),
  permissions: z.array(z.string()),
});
const ListSchema = z.object({
  data: z.array(TicketSchema),
  pagination: z.object({
    total: z.coerce.number(),
    total_pages: z.coerce.number(),
    current_page: z.coerce.number(),
  }).passthrough(),
});

export type Ticket = z.infer<typeof TicketSchema>;
export type NamedChoice = z.infer<typeof NamedSchema>;
export type Session = Awaited<ReturnType<typeof authenticate>>;

const STATUS_LABEL: Record<Ticket["status"], string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

export function namedList(data: unknown): NamedChoice[] {
  const wrapped = z.object({ data: z.array(NamedSchema) }).safeParse(data);
  if (wrapped.success) return wrapped.data.data;
  return z.array(NamedSchema).parse(data);
}

export function uniqueNamed(rows: NamedChoice[], kind: string): NamedChoice {
  const counts = new Map<string, number>();
  for (const row of rows) counts.set(row.name, (counts.get(row.name) ?? 0) + 1);
  const choice = rows.find((row) => row.name.trim().length > 0 && counts.get(row.name) === 1);
  if (!choice) throw new Error(`No uniquely named ${kind} is available for a ticket fixture.`);
  return choice;
}

export async function authenticate(browser: Browser, tenant: TenantName) {
  const credentials = tenantCredentials(tenant);
  const context = await browser.newContext({
    baseURL: credentials.baseURL,
    locale: "en-US",
    timezoneId: "Asia/Dhaka",
    serviceWorkers: "block",
  });
  try {
    const page = await context.newPage();
    await page.goto("/admin");
    await page.locator("#username").fill(credentials.username);
    await page.locator("#password").fill(credentials.password);
    await page.getByRole("button", { name: /^login$/i }).click();
    await expect(page).toHaveURL(`${credentials.baseURL}/dashboard`, { timeout: 30_000 });
    await expect(page.getByRole("button", { name: /user menu/i })).toBeVisible();
    const login = await context.request.post(`${backendURL()}auth/login`, {
      data: {
        username: credentials.username,
        password: credentials.password,
        host: new URL(credentials.baseURL).hostname,
      },
    });
    if (!login.ok()) throw new Error(`Backend ${tenant} authentication failed (${login.status()}).`);
    const result: unknown = await login.json();
    const { token } = z.object({ success: z.literal(true), token: z.string().min(1) }).parse(result);
    const headers = { Authorization: `Bearer ${token}`, Accept: "application/json" };
    const call = async (path: string, method = "GET", data?: unknown) => {
      const response = await context.request.fetch(`${backendURL()}${path.replace(/^\//, "")}`, {
        method,
        headers,
        data,
      });
      const body: unknown = await response.json().catch(() => null);
      return { status: response.status(), body };
    };
    const get = async (path: string) => {
      const response = await call(path);
      if (response.status !== 200) throw new Error(`Backend read ${path.split("?")[0]} failed (${response.status}).`);
      return z.object({ success: z.literal(true), data: z.unknown() }).parse(response.body).data;
    };
    const profile = ProfileSchema.parse(await get("user-settings"));
    expect(profile.profile.username).toBe(credentials.username);
    expect(profile.profile.company.domain).toBe(new URL(credentials.baseURL).hostname);
    const state = await context.storageState();
    await page.close();
    return {
      tenant,
      baseURL: credentials.baseURL,
      state,
      profile,
      get,
      call,
      tickets: async (params = "") => ListSchema.parse(await get(`tickets${params ? `?${params}` : ""}`)),
      ticket: async (id: string) => TicketSchema.parse(await get(`tickets/${id}`)),
      messages: async (id: string) => {
        const data = await get(`tickets/${id}/messages`);
        const wrapped = z.object({ data: z.array(MessageSchema) }).safeParse(data);
        return wrapped.success ? wrapped.data.data : z.array(MessageSchema).parse(data);
      },
      dispose: async () => {
        try {
          await context.request.post(`${backendURL()}logout`, { headers });
        } finally {
          await context.close();
        }
      },
    };
  } catch (error) {
    await context.close();
    throw error;
  }
}

export function requirePermissions(session: Session, ...permissions: string[]) {
  for (const permission of permissions) {
    if (!session.profile.permissions.includes(permission)) {
      throw new Error(`Selected ${session.tenant} persona lacks ${permission}.`);
    }
  }
}

export async function chooseDropdown(page: Page, fieldName: string, label: string) {
  const input = page.locator(`#react-select-${fieldName}-input`);
  await input.click();
  await input.fill(label);
  const option = page.getByRole("option", { name: label, exact: true });
  await expect(option).toBeVisible();
  await option.click();
}

export async function openTicketFilters(page: Page) {
  const input = page.locator("#ticket_id");
  if (!(await input.isVisible())) {
    await page.getByRole("button").filter({ has: page.locator("svg.lucide-funnel") }).click();
  }
  await expect(input).toBeVisible();
}

export async function deleteTicket(session: Session, id: string) {
  const deleted = await session.call(`tickets/${id}`, "DELETE");
  if (![200, 404].includes(deleted.status)) {
    throw new Error(`Ticket cleanup failed (${deleted.status}).`);
  }
}

export async function withOwnedTicket(session: Session, run: (ticket: Ticket) => Promise<void>) {
  requirePermissions(session, "tickets.create", "tickets.delete", "tickets.show");
  const client = uniqueNamed(namedList(await session.get("dropdown-clients")), "client");
  const subject = uniqueNamed(namedList(await session.get("dropdown-subjects")), "subject");
  const message = `E2E ticket ${randomUUID()}`;
  const created = await session.call("tickets", "POST", {
    client_id: client.id,
    subject_id: subject.id,
    message,
    priority: "medium",
    status: "open",
  });
  if (created.status !== 200) throw new Error(`Ticket fixture create failed (${created.status}).`);
  let ticket: Ticket | undefined;
  try {
    await expect.poll(async () => {
      const matches = (await session.tickets()).data.filter((row) => row.message === message);
      ticket = matches.length === 1 ? matches[0] : undefined;
      return matches.length;
    }).toBe(1);
    if (!ticket) throw new Error("Owned ticket was not resolved.");
    await run(ticket);
  } finally {
    if (ticket) await deleteTicket(session, ticket.id);
  }
}

export function ticketRow(page: Page, ticketCode: string) {
  return page.getByRole("row").filter({ has: page.getByText(ticketCode, { exact: true }) });
}

export async function expectTicketRow(page: Page, ticket: Ticket) {
  const row = ticketRow(page, ticket.ticket_code);
  await expect(row).toBeVisible();
  await expect(row.getByText(ticket.client?.name ?? "—", { exact: true }).first()).toBeVisible();
  await expect(row.getByText(ticket.subject?.name ?? "—", { exact: true }).first()).toBeVisible();
  await expect(row.getByText(ticket.priority, { exact: true })).toBeVisible();
  await expect(row.getByText(STATUS_LABEL[ticket.status], { exact: true })).toBeVisible();
  await expect(row.getByText(ticket.staff?.name ?? "Not Assigned", { exact: true }).first()).toBeVisible();
  await expect(row.getByText(String(ticket.messages_count ?? 0), { exact: true }).first()).toBeVisible();
}

export const test = base.extend<{}, { staff: Session }>({
  staff: [async ({ browser }, use) => {
    const session = await authenticate(browser, "cp");
    try {
      await use(session);
    } finally {
      await session.dispose();
    }
  }, { scope: "worker" }],
  storageState: async ({ staff }, use) => {
    await use(staff.state);
  },
});

export { expect };
