import { test as base, expect, type Browser, type Page } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { z } from "zod";
// Independent transport contract: do not reuse application validators as the test oracle.
const RefSchema = z.object({ id: z.coerce.number(), name: z.string() }).passthrough();
const ClientRowSchema = z.object({
  id: z.string(), uuid: z.string().optional(), name: z.string(),
  pppoe_username: z.string().nullable().optional(), phone: z.string().nullable().optional(),
  ip_address: z.string().nullable().optional(), package: RefSchema.nullable().optional(),
  network: RefSchema.nullable().optional(), billing_term: z.string().nullable().optional(),
  billing_type: z.string().nullable().optional(), payment_deadline: z.union([z.number(), z.string(), z.null()]).optional(),
}).passthrough();
import { backendURL, tenantCredentials, isolatedFixtures, type TenantName } from "@/tests/e2e/clients/environment";

const ProfileSchema = z.object({ profile: z.object({ username: z.string(), company: z.object({ domain: z.string() }) }), permissions: z.array(z.string()), settings: z.record(z.unknown()) });
const ListSchema = z.object({ data: z.array(ClientRowSchema), pagination: z.object({ total: z.coerce.number(), total_pages: z.coerce.number(), current_page: z.coerce.number() }).passthrough() });
export type Client = z.infer<typeof ClientRowSchema>;
export type Session = Awaited<ReturnType<typeof authenticate>>;

export async function authenticate(browser: Browser, tenant: TenantName) {
  const credentials = tenantCredentials(tenant);
  const context = await browser.newContext({ baseURL: credentials.baseURL, locale: "en-US", serviceWorkers: "block" });
  try {
    const page = await context.newPage();
    await page.goto("/admin");
    await page.locator("#username").fill(credentials.username);
    await page.locator("#password").fill(credentials.password);
    await page.getByRole("button", { name: /^login$/i }).click();
    await expect(page).toHaveURL(`${credentials.baseURL}/dashboard`, { timeout: 30_000 });
    await expect(page.getByRole("button", { name: /user menu/i })).toBeVisible();
    // Obtain independent API verification session without exposing bearer tokens to browser JS.
    const login = await context.request.post(`${backendURL()}auth/login`, { data: { username: credentials.username, password: credentials.password, host: new URL(credentials.baseURL).hostname } });
    if (!login.ok()) throw new Error(`Backend ${tenant} authentication failed (${login.status()}).`);
    const result: unknown = await login.json();
    const { token } = z.object({ success: z.literal(true), token: z.string().min(1) }).parse(result);
    const headers = { Authorization: `Bearer ${token}`, Accept: "application/json" };
    const call = async (path: string, method = "GET", data?: unknown) => {
      const response = await context.request.fetch(`${backendURL()}${path.replace(/^\//, "")}`, { method, headers, data });
      const body: unknown = await response.json();
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
      tenant, baseURL: credentials.baseURL, state, profile, get, call,
      list: async (params = "") => ListSchema.parse(await get(`clients${params ? `?${params}` : ""}`)),
      detail: async (id: string) => ClientRowSchema.parse(await get(`clients/${id}`)),
      dispose: async () => {
        // Revoke the separate REST verification token; browser-login token follows app lifecycle.
        try { await context.request.post(`${backendURL()}logout`, { headers }); } finally { await context.close(); }
      },
    };
  } catch (error) { await context.close(); throw error; }
}

export function clientId(client: Client): string {
  const id = client.id ?? client.uuid;
  if (!id) throw new Error("Client fixture has no UUID.");
  return id;
}
export function requirePermissions(session: Session, ...permissions: string[]) {
  for (const permission of permissions) {
    if (!session.profile.permissions.includes(permission)) throw new Error(`Selected ${session.tenant} persona lacks required ${permission}; configure a valid fixture, do not bypass the gate.`);
  }
}
export async function openClientCreate(page: Page) {
  await page.goto("/clients/create");
  // Client create has asynchronous dropdown/default hydration and no ready marker.
  // Wait only at this bootstrap boundary; list/detail pages poll and must not use it.
  await page.waitForLoadState("networkidle");
  await expect(page.locator("#name")).toBeVisible();
}

export async function searchClients(page: Page, value: string) {
  const input = page.getByPlaceholder("Search by name, phone, or PPPoE ID");
  if (!(await input.isVisible())) {
    // Desktop filter trigger currently has no accessible name. Scope by its specific
    // rendered icon until the shared FormFilter supplies an aria-label.
    await page.getByRole("button").filter({ has: page.locator("svg.lucide-funnel") }).click();
  }
  await expect(input).toBeVisible();
  await input.fill(value);
}
export const test = base.extend<{ ownedClient: Client }, { staff: Session }>({
  staff: [async ({ browser }, use) => {
    const tenant = process.env.E2E_TENANT === "mk" ? "mk" : "cp";
    const session = await authenticate(browser, tenant);
    try { await use(session); } finally { await session.dispose(); }
  }, { scope: "worker" }],
  storageState: async ({ staff }, use) => use(staff.state),
  ownedClient: async ({ staff }, use) => {
    const fixture = isolatedFixtures(staff.tenant);
    requirePermissions(staff, "clients.create", "clients.delete", "archived-clients.delete");
    const payload = { ...fixture.clientPayload, name: `E2E Client ${randomUUID()}`, pppoe_username: `e2e-${randomUUID()}`, pppoe_password: randomUUID(), phone: "01700000001", network_id: fixture.network.id, package_id: fixture.package.id, welcome_notification: 0, login_sms_notification: 0, cable_invoice: 0 };
    const response = await staff.call("clients", "POST", payload);
    if (response.status >= 400) throw new Error(`Isolated fixture creation failed (${response.status}); verify fake adapters and payload.`);
    z.object({ success: z.literal(true) }).parse(response.body);
    const matches = (await staff.list(`any=${encodeURIComponent(payload.pppoe_username)}`)).data.filter(row => row.pppoe_username === payload.pppoe_username);
    if (matches.length !== 1) throw new Error("Created fixture could not be uniquely resolved by its test-owned PPPoE identity.");
    const id = clientId(matches[0]);
    try { await use(await staff.detail(id)); }
    finally {
      const deleted = await staff.call(`clients/${id}`, "DELETE");
      if (![200, 404].includes(deleted.status)) throw new Error(`Client cleanup failed (${deleted.status}); preserve fixture ${id} for investigation.`);
      const purged = await staff.call(`archived-clients/${id}`, "DELETE");
      if (![200, 404].includes(purged.status)) throw new Error(`Archived fixture cleanup failed (${purged.status}).`);
    }
  },
});
export { expect };
