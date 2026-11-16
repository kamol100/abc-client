import { z } from "zod";
import type { Locator, Page } from "@playwright/test";
import {
  authenticate,
  expect,
  requirePermissions,
  test,
  type Session,
} from "@/tests/e2e/clients/fixtures";

const SIMULATOR_HOSTS = new Set(["127.0.0.1", "localhost", "::1"]);
const SIMULATOR_PORT = 8728;

const NetworkSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  ip_address: z.string().nullable().optional(),
  mikrotik_user: z.string().nullable().optional(),
  mikrotik_password: z.string().nullable().optional(),
  web_port: z.coerce.number().nullable().optional(),
  notes: z.string().nullable().optional(),
  status: z.coerce.number().optional(),
  auto_client_mikrotik_status: z.coerce.number().nullable().optional(),
  auto_sync_status: z.coerce.number().nullable().optional(),
  graph_status: z.coerce.number().nullable().optional(),
}).passthrough();

const ListSchema = z.object({
  data: z.array(NetworkSchema),
  pagination: z.object({
    total: z.coerce.number(),
    current_page: z.coerce.number(),
    total_pages: z.coerce.number(),
  }).passthrough(),
});

const ChoiceSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
}).passthrough();

const ClientPageSchema = z.object({
  pagination: z.object({ total: z.coerce.number() }).passthrough(),
}).passthrough();

const ProbeSchema = z.object({ message: z.string() }).passthrough();

export type Network = z.infer<typeof NetworkSchema>;
export type Choice = z.infer<typeof ChoiceSchema>;

export function choices(data: unknown): Choice[] {
  const rows = z.array(ChoiceSchema).safeParse(data);
  if (rows.success) return rows.data;
  return z.object({ data: z.array(ChoiceSchema) }).parse(data).data;
}

export function responseContains(body: unknown, secret: string | null | undefined): boolean {
  if (!secret) return false;
  return JSON.stringify(body ?? null).includes(secret);
}

export function isSimulatorNetwork(network: Network): boolean {
  const host = (network.ip_address ?? "").trim().toLowerCase();
  return SIMULATOR_HOSTS.has(host) && Number(network.web_port) === SIMULATOR_PORT;
}

/** The networks page probes every visible row. Active non-simulator addresses are refused. */
export function assertProbeSafe(rows: Network[]) {
  const unsafe = rows.filter((row) => Number(row.status ?? 0) === 1 && !isSimulatorNetwork(row));
  if (unsafe.length > 0) {
    throw new Error(
      `Refusing to open networks or probe status: ${unsafe.length} active network(s) are outside the local MikroTik simulator at 127.0.0.1:8728.`,
    );
  }
}

export async function networks(staff: Session, query = "") {
  requirePermissions(staff, "networks.access");
  return ListSchema.parse(await staff.get(`networks${query ? `?${query}` : ""}`));
}

export async function networkDetail(staff: Session, id: string) {
  requirePermissions(staff, "networks.show");
  return NetworkSchema.parse(await staff.get(`networks/${id}`));
}

export async function connection(staff: Session, network: Network) {
  assertProbeSafe([network]);
  return ProbeSchema.parse(await staff.get(`network-status/${network.id}`));
}

export async function clientTotal(staff: Session, networkId: number) {
  requirePermissions(staff, "clients.access");
  return ClientPageSchema.parse(await staff.get(`clients?network_id=${networkId}`)).pagination.total;
}

export async function networkRelations(staff: Session) {
  const listed = await networks(staff);
  const options = choices(await staff.get("dropdown-networks"));
  const rows = [];
  for (const network of listed.data) {
    const matches = options.filter((option) => option.name === network.name);
    if (matches.length !== 1) {
      throw new Error(`Network dropdown needs exactly one option named like ${network.name}.`);
    }
    const option = matches[0];
    rows.push({
      network,
      option,
      clients: await clientTotal(staff, option.id),
      packages: choices(await staff.get(`dropdown-network-packages/${option.id}`)),
    });
  }
  return { listed, options, rows };
}

export function networkRow(page: Page, network: Network) {
  return page.getByRole("row").filter({
    has: page.getByRole("cell", { name: network.name, exact: true }),
  });
}

export function listTitle(total: number) {
  return total ? `Networks (${total})` : "Networks";
}

export async function openNetworks(page: Page, staff: Session) {
  const listed = await networks(staff);
  assertProbeSafe(listed.data);
  await page.goto("/networks");
  await expect(page.getByText(listTitle(listed.pagination.total), { exact: true })).toBeVisible();
  return listed;
}

export async function expectNetworkRows(page: Page, rows: Network[]) {
  if (!rows.length) {
    await expect(page.getByText("No results", { exact: true })).toBeVisible();
    return;
  }
  await expect(page.locator("table tbody tr td:first-child")).toHaveText(rows.map((row) => row.name));
  for (const network of rows) {
    const cells = networkRow(page, network).locator("td");
    await expect(cells.nth(1)).toHaveText(network.ip_address || "—");
    await expect(cells.nth(3)).toContainText(Number(network.status ?? 0) === 1 ? "Active" : "Inactive");
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

function rowIconButton(row: Locator, icon: string) {
  return row.getByRole("button").filter({ has: row.page().locator(icon) });
}

export function editButton(row: Locator) {
  return rowIconButton(row, "svg.lucide-square-pen");
}

export function deleteButton(row: Locator) {
  return rowIconButton(row, "svg.lucide-trash-2");
}

export async function expectControlValue(control: Locator, expected: string) {
  await expect.poll(async () => control.evaluate((element, value) => {
    if (!(element instanceof HTMLInputElement) && !(element instanceof HTMLTextAreaElement)) return false;
    return element.value === value;
  }, expected)).toBe(true);
}

export function sameConfig(left: Network, right: Network) {
  return left.id === right.id
    && left.name === right.name
    && (left.ip_address ?? null) === (right.ip_address ?? null)
    && (left.mikrotik_user ?? null) === (right.mikrotik_user ?? null)
    && (left.mikrotik_password ?? null) === (right.mikrotik_password ?? null)
    && (left.web_port ?? null) === (right.web_port ?? null)
    && (left.notes ?? null) === (right.notes ?? null)
    && Number(left.status ?? 0) === Number(right.status ?? 0)
    && Number(left.auto_client_mikrotik_status ?? 0) === Number(right.auto_client_mikrotik_status ?? 0)
    && Number(left.auto_sync_status ?? 0) === Number(right.auto_sync_status ?? 0)
    && Number(left.graph_status ?? 0) === Number(right.graph_status ?? 0);
}

export { authenticate, expect, requirePermissions, test };
