import { randomBytes, randomUUID } from "node:crypto";
import { z } from "zod";
import type { APIRequestContext, Locator, Page } from "@playwright/test";
import {
  authenticate,
  expect,
  requirePermissions,
  test,
  type Session,
} from "@/tests/e2e/clients/fixtures";
import { backendURL } from "@/tests/e2e/clients/environment";

const RoleSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
}).passthrough();

const ZoneSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
}).passthrough();

const SalaryItemSchema = z.object({
  items_label: z.string(),
  items_value: z.coerce.number(),
}).passthrough();

const SalaryDeductionSchema = z.object({
  deductions_label: z.string(),
  deductions_value: z.coerce.number(),
}).passthrough();

export const StaffSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  designation: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  join_date: z.string().nullable().optional(),
  gender: z.string().nullable().optional(),
  roles: z.array(RoleSchema).nullable().optional(),
  zones: z.array(ZoneSchema).nullable().optional(),
  user: z.object({
    uuid: z.string().optional(),
    username: z.string().optional(),
  }).passthrough().nullable().optional(),
  salary_items: z.array(SalaryItemSchema).nullable().optional(),
  salary_deductions: z.array(SalaryDeductionSchema).nullable().optional(),
}).passthrough();

const ListSchema = z.object({
  data: z.array(StaffSchema),
  pagination: z.object({
    total: z.coerce.number(),
    current_page: z.coerce.number(),
    total_pages: z.coerce.number(),
    per_page: z.coerce.number().optional(),
  }).passthrough(),
});

const ChoiceSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
  guard_name: z.string().optional(),
}).passthrough();

export type Staff = z.infer<typeof StaffSchema>;
export type StaffList = z.infer<typeof ListSchema>;
export type Choice = z.infer<typeof ChoiceSchema>;

export const LOCKED_MESSAGE = "Your account is locked. Please contact your administrator.";
export const PLAN_DENIAL = "This feature is not included in your subscription plan.";

export type OwnedStaff = {
  record: Staff;
  username: string;
  password: string;
  role: Choice;
  zone: Choice | null;
  salaryItem: { items_label: string; items_value: number };
  deduction: { deductions_label: string; deductions_value: number };
};

export async function staffList(session: Session, query = ""): Promise<StaffList> {
  requirePermissions(session, "staffs.access");
  return ListSchema.parse(await session.get(`staffs${query ? `?${query}` : ""}`));
}

export async function staffDetail(session: Session, id: string): Promise<Staff> {
  requirePermissions(session, "staffs.show");
  return StaffSchema.parse(await session.get(`staffs/${id}`));
}

export function choices(data: unknown): Choice[] {
  const wrapped = z.object({ data: z.array(ChoiceSchema) }).safeParse(data);
  if (wrapped.success) return wrapped.data.data;
  return z.array(ChoiceSchema).parse(data);
}

export function listTitle(total: number): string {
  return total ? `Staffs (${total})` : "Staffs";
}

export function statusLabel(status: string | null | undefined): string {
  if (status === "inactive") return "Inactive";
  return "Active";
}

export function roleText(staff: Staff): string {
  return (staff.roles ?? []).map((role) => role.name).filter(Boolean).join(", ");
}

export function zoneText(staff: Staff): string {
  return (staff.zones ?? []).map((zone) => zone.name).filter(Boolean).join(", ");
}

export function staffSnapshot(staff: Staff) {
  return {
    id: staff.id,
    name: staff.name,
    designation: staff.designation ?? null,
    phone: staff.phone ?? null,
    email: staff.email ?? null,
    status: staff.status ?? null,
    gender: staff.gender ?? null,
    zones: (staff.zones ?? []).map((zone) => zone.id).sort(),
    roles: (staff.roles ?? []).map((role) => role.id).sort(),
    salary_items: (staff.salary_items ?? []).map((item) => ({
      items_label: item.items_label,
      items_value: item.items_value,
    })),
    salary_deductions: (staff.salary_deductions ?? []).map((item) => ({
      deductions_label: item.deductions_label,
      deductions_value: item.deductions_value,
    })),
  };
}

export function staffRow(page: Page, staff: Staff): Locator {
  return page.getByRole("row").filter({
    has: page.locator(`a[href="/staffs/edit/${staff.id}"]`),
  });
}

export async function openStaffPage(page: Page, path = "/staffs") {
  try {
    await page.goto(path, { timeout: 30_000 });
  } catch {
    await page.goto(path, { timeout: 30_000 });
  }
  const broken = page.getByRole("heading", { name: /502 Bad Gateway|This page couldn.t load/ });
  if (await broken.isVisible().catch(() => false)) await page.reload({ timeout: 30_000 });
  const overlay = page.getByRole("dialog", { name: "Console Error" });
  if (await overlay.isVisible().catch(() => false)) await page.keyboard.press("Escape");
}

export async function expectMenuName(page: Page, name: string) {
  const userMenu = page.getByRole("button", { name: "User menu", exact: true });
  const label = page.getByRole("menu").getByText(name, { exact: true });
  await expect(userMenu).toBeVisible();
  await userMenu.click();
  try {
    await expect(label).toBeVisible({ timeout: 3_000 });
  } catch {
    await userMenu.click();
    await expect(label).toBeVisible();
  }
}

export async function expectLoginForm(page: Page) {
  await expect(page).toHaveURL(/\/admin(?:\?|$)/);
  const username = page.locator("#username");
  try {
    await expect(username).toBeVisible({ timeout: 8_000 });
  } catch {
    await page.reload({ timeout: 30_000 });
    await expect(username).toBeVisible();
  }
}

export async function showStaffRow(page: Page, session: Session, staff: Staff) {
  await openStaffPage(page);
  const listed = await staffList(session);
  const title = page.getByText(listTitle(listed.pagination.total), { exact: true });
  try {
    await expect(title).toBeVisible({ timeout: 8_000 });
  } catch {
    await page.reload({ timeout: 30_000 });
    await expect(title).toBeVisible();
  }
  for (let pageNumber = 1; pageNumber <= listed.pagination.total_pages; pageNumber += 1) {
    const current = pageNumber === 1 ? listed : await staffList(session, `page=${pageNumber}`);
    if (current.data.some((row) => row.id === staff.id)) break;
    if (pageNumber === listed.pagination.total_pages) throw new Error("That staff member is not on the list.");
    await page.getByRole("button", { name: "Go to next page" }).click();
  }
  const row = staffRow(page, staff);
  await expect(row).toBeVisible();
  return row;
}

export async function expectStaffRows(page: Page, rows: Staff[]) {
  if (!rows.length) {
    await expect(page.getByText("No results", { exact: true })).toBeVisible();
    return;
  }
  const body = page.locator("table tbody tr");
  await expect(body).toHaveCount(rows.length);
  for (const [index, staff] of rows.entries()) {
    const cells = body.nth(index).locator("td");
    await expect(cells.nth(0)).toHaveText(staff.name);
    await expect(cells.nth(1)).toHaveText(staff.user?.username ?? "");
    await expect(cells.nth(2)).toHaveText(roleText(staff));
    await expect(cells.nth(3)).toHaveText(staff.designation ?? "");
    await expect(cells.nth(4)).toHaveText(staff.phone ?? "");
    await expect(cells.nth(5)).toHaveText(staff.email ?? "");
    await expect(cells.nth(6)).toHaveText(zoneText(staff));
    await expect(cells.nth(7)).toHaveText(staff.join_date ?? "");
    await expect(cells.nth(8)).toHaveText(statusLabel(staff.status));
    await expect(body.nth(index)).not.toContainText("undefined");
  }
}

export async function openStaffList(page: Page, listed: StaffList) {
  await page.goto("/staffs");
  await expect(page.getByText(listTitle(listed.pagination.total), { exact: true })).toBeVisible();
  await expectStaffRows(page, listed.data);
}

export async function actorProfile(session: Session) {
  return z.object({
    profile: z.object({
      username: z.string(),
      name: z.string(),
      staff: z.object({
        id: z.string(),
        name: z.string().optional(),
        item_per_page: z.coerce.number().nullable().optional(),
      }).nullable().optional(),
    }).passthrough(),
  }).passthrough().parse(await session.get("user-settings")).profile;
}

export function tenantHost(session: Session): string {
  return new URL(session.baseURL).hostname;
}

const BLOCKED_STAFF_ROLES = new Set(["Admin", "Super Admin", "Client"]);

export function uniqueChoice(options: Choice[], label: string): Choice {
  const counts = new Map<string, number>();
  for (const option of options) counts.set(option.name, (counts.get(option.name) ?? 0) + 1);
  const unique = options.find((option) => option.name.trim().length > 0 && counts.get(option.name) === 1);
  if (!unique) throw new Error(`${label} needs one choice whose name is unique.`);
  return unique;
}

export function assignableRole(roles: Choice[]): Choice {
  const eligible = roles.filter((role) => role.name.trim().length > 0 && !BLOCKED_STAFF_ROLES.has(role.name));
  if (!eligible.length) throw new Error("Disposable staff need a role other than Admin, Super Admin, or Client.");
  return uniqueChoice(eligible, "Staff role");
}

export async function companyRoles(session: Session): Promise<Choice[]> {
  return choices(await session.get("dropdown-roles")).filter((role) => (
    role.name.trim().length > 0 && role.guard_name !== "client"
  ));
}

export async function companyZones(session: Session): Promise<Choice[]> {
  return choices(await session.get("dropdown-zones")).filter((zone) => zone.name.trim().length > 0);
}

function phoneNumber(): string {
  const digits = Array.from(randomBytes(8), (byte) => String(byte % 10)).join("");
  return `019${digits}`;
}

export function staffPassword(): string {
  return `E2e${randomBytes(12).toString("base64url")}`;
}

export async function createOwnedStaff(session: Session): Promise<OwnedStaff> {
  requirePermissions(session, "staffs.create", "staffs.delete", "staffs.show");
  const role = assignableRole(await companyRoles(session));
  const zones = await companyZones(session);
  const zone = zones.length ? uniqueChoice(zones, "Staff zone") : null;
  const username = `e2e${randomBytes(6).toString("hex")}`;
  const password = staffPassword();
  const salaryItem = { items_label: `Basic ${randomUUID().slice(0, 4)}`, items_value: 1500 };
  const deduction = { deductions_label: `Tax ${randomUUID().slice(0, 4)}`, deductions_value: 100 };
  const payload = {
    name: `E2E Staff ${randomUUID().slice(0, 8)}`,
    username,
    password,
    phone: phoneNumber(),
    designation: "E2E Clerk",
    gender: "male",
    status: "active",
    roles_id: [role.id],
    zone_ids: zone ? [zone.id] : [],
    salary_items: [salaryItem],
    salary_deductions: [deduction],
  };
  const response = await session.call("staffs", "POST", payload);
  if (response.status >= 400 || !response.body || typeof response.body !== "object") {
    throw new Error(`Disposable staff create failed (${response.status}).`);
  }
  const created = StaffSchema.parse(
    z.object({ success: z.literal(true), data: StaffSchema }).parse(response.body).data,
  );
  if (created.user?.username !== username) {
    throw new Error("Disposable staff response did not keep the generated username.");
  }
  return { record: created, username, password, role, zone, salaryItem, deduction };
}

export async function deleteOwnedStaff(session: Session, id: string) {
  const deleted = await session.call(`staffs/${id}`, "DELETE");
  if (![200, 404].includes(deleted.status)) {
    throw new Error(`Disposable staff cleanup failed (${deleted.status}) for ${id}.`);
  }
}

export async function deleteStaffNamed(session: Session, username: string) {
  const listed = await staffList(session);
  const matches = listed.data.filter((row) => row.user?.username === username);
  for (const match of matches) await deleteOwnedStaff(session, match.id);
}

export async function withOwnedStaff(session: Session, run: (owned: OwnedStaff) => Promise<void>) {
  const listed = await staffList(session);
  for (const row of listed.data) {
    if (/^e2e[0-9a-f]{12}$/.test(row.user?.username ?? "")) await deleteOwnedStaff(session, row.id);
  }
  const owned = await createOwnedStaff(session);
  try {
    await run(owned);
  } finally {
    await deleteOwnedStaff(session, owned.record.id);
  }
}

export async function attemptLogin(
  request: APIRequestContext,
  username: string,
  password: string,
  host: string,
) {
  const response = await request.post(`${backendURL()}auth/login`, {
    data: { username, password, host },
    headers: { Accept: "application/json" },
  });
  const body: unknown = await response.json().catch(() => null);
  return { status: response.status(), body };
}

export async function readWithToken(request: APIRequestContext, token: string, path: string) {
  const response = await request.fetch(`${backendURL()}${path.replace(/^\//, "")}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  const body: unknown = await response.json().catch(() => null);
  return { status: response.status(), body };
}

export function loginToken(body: unknown): string {
  return z.object({ success: z.literal(true), token: z.string().min(1) }).parse(body).token;
}

export async function chooseExactOption(page: Page, field: string, label: string) {
  const input = page.locator(`#react-select-${field}-input`);
  await input.click();
  await input.fill(label);
  const option = page.getByRole("option", { name: label, exact: true });
  await expect(option).toBeVisible();
  await option.click();
  await page.keyboard.press("Escape");
}

export async function openCreate(page: Page) {
  await page.goto("/staffs/create");
  await expect(page.getByRole("button", { name: "Basic Information" })).toBeVisible();
  await expect(page.locator("#name")).toBeVisible();
  await expect(page.locator("#username")).toBeVisible();
  await expect(page.locator("#password")).toBeVisible();
}

export { authenticate, expect, requirePermissions, test };
