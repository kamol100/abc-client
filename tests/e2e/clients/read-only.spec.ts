import { randomUUID } from "node:crypto";
import { test, expect, openClientCreate, clientId, requirePermissions, searchClients, authenticate, type Client } from "@/tests/e2e/clients/fixtures";

async function visibleClient(staff: Parameters<typeof requirePermissions>[0]): Promise<Client> {
  requirePermissions(staff, "clients.access", "clients.show");
  const list = await staff.list();
  // Select an explicit API identity, never a positional browser row/action.
  const candidates = list.data.filter(c => c.pppoe_username && c.name);
  if (!candidates.length) throw new Error("Read-only tests require at least one visible named client with PPPoE ID.");
  return [...candidates].sort((a, b) => clientId(a).localeCompare(clientId(b)))[0];
}

test("CL-L01 client list reflects backend identities and pagination total after reload", async ({ page, staff }) => {
  requirePermissions(staff, "clients.access");
  const list = await staff.list();
  await page.goto("/clients");
  for (const client of list.data) await expect(page.getByText(client.name, { exact: true })).toBeVisible();
  if (list.pagination.total) await expect(page.getByText(`Clients (${list.pagination.total})`, { exact: true })).toBeVisible();
  await page.reload();
  for (const client of list.data) await expect(page.getByText(client.name, { exact: true })).toBeVisible();
});

for (const field of ["name", "pppoe_username", "phone"] as const) {
  test(`CL-L02 search by ${field} matches independent API result and reset`, async ({ page, staff }) => {
    const client = await visibleClient(staff);
    const value = client[field];
    if (!value) throw new Error(`Read-only fixture needs ${field}; provide a suitable client.`);
    const expected = await staff.list(`any=${encodeURIComponent(value)}`);
    expect(expected.data.some(c => clientId(c) === clientId(client))).toBe(true);
    await page.goto("/clients");
    await searchClients(page, value);
    for (const match of expected.data) await expect(page.getByText(match.name, { exact: true })).toBeVisible();
    const excluded = (await staff.list()).data.filter(c => !expected.data.some(m => clientId(m) === clientId(c)));
    for (const other of excluded) await expect(page.getByRole("link", { name: other.pppoe_username ?? "", exact: true })).toHaveCount(0);
    await searchClients(page, "");
    await expect(page.getByText(client.name, { exact: true })).toBeVisible();
  });
}

test("CL-L05 current-month deep link and show-all preserve URL and data scope", async ({ page, staff }) => {
  const expected = await staff.list("created_at=this_month");
  await page.goto("/clients?created_at=this_month");
  await expect(page.getByText("New clients this month", { exact: true })).toBeVisible();
  for (const client of expected.data) await expect(page.getByText(client.name, { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Show all clients", exact: true }).click();
  await expect(page).toHaveURL(`${staff.baseURL}/clients`);
  await page.reload();
  await expect(page.getByText("New clients this month", { exact: true })).toHaveCount(0);
});

test("CL-L06 unmatched search renders empty results and can be cleared", async ({ page, staff }) => {
  const client = await visibleClient(staff);
  await page.goto("/clients");
  await searchClients(page, `does-not-exist-${randomUUID()}`);
  await expect(page.getByText("No results", { exact: true })).toBeVisible();
  await expect(page.getByText(client.name, { exact: true })).toHaveCount(0);
  await searchClients(page, client.pppoe_username!);
  await expect(page.getByText(client.name, { exact: true })).toBeVisible();
});

for (const entry of ["identity", "view-action"] as const) {
  test(`CL-D01 ${entry} opens selected UUID detail`, async ({ page, staff }) => {
    const client = await visibleClient(staff);
    await page.goto("/clients");
    const link = entry === "identity"
      ? page.getByRole("link", { name: client.pppoe_username!, exact: true })
      : page.getByRole("row").filter({ has: page.getByRole("link", { name: client.pppoe_username!, exact: true }) }).getByRole("link", { name: "View", exact: true });
    await expect(link).toHaveAttribute("href", `/clients/view/${clientId(client)}`);
    const destination = await link.getAttribute("target");
    if (destination === "_blank") {
      const popup = page.waitForEvent("popup");
      await link.click();
      const detail = await popup;
      await expect(detail).toHaveURL(`${staff.baseURL}/clients/view/${clientId(client)}`);
      await expect(detail.getByText(client.name, { exact: true })).toBeVisible();
      await detail.close();
    } else {
      await link.click();
      await expect(page).toHaveURL(`${staff.baseURL}/clients/view/${clientId(client)}`);
      await expect(page.getByText(client.name, { exact: true })).toBeVisible();
    }
  });
}

test("CL-D02 selected client detail retains identity and package after reload", async ({ page, staff }) => {
  const client = await visibleClient(staff);
  const saved = await staff.detail(clientId(client));
  await page.goto(`/clients/view/${clientId(client)}`);
  await expect(page.getByText(saved.name, { exact: true }).and(page.locator("span"))).toBeVisible();
  if (saved.package?.name) await expect(page.getByText(saved.package.name, { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText(saved.name, { exact: true }).and(page.locator("span"))).toBeVisible();
});

test("CL-D06 phone and WhatsApp links target the selected client", async ({ page, staff }) => {
  const client = await visibleClient(staff);
  if (!client.phone) throw new Error("Read-only fixture needs a phone number.");
  await page.goto("/clients");
  const row = page.getByRole("row").filter({ has: page.getByRole("link", { name: client.pppoe_username!, exact: true }) });
  await expect(row.locator(`a[href="tel:${client.phone}"]`)).toBeVisible();
  const digits = client.phone.replace(/\D/g, "");
  const international = digits.startsWith("01") ? `88${digits}` : digits;
  await expect(row.locator(`a[href^="https://wa.me/${international}"]`)).toBeVisible();
});

for (const path of ["/clients", "/clients/create", "/clients/edit/00000000-0000-0000-0000-000000000001", "/clients/view/00000000-0000-0000-0000-000000000001"]) {
  test(`CL-A01 anonymous ${path} requires staff login`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, storageState: { cookies: [], origins: [] } });
    try {
      const page = await context.newPage();
      await page.goto(path);
      await expect(page).toHaveURL(url => url.origin === baseURL && url.pathname === "/admin" && url.searchParams.get("callbackUrl") === path);
      await expect(page.locator("#username")).toBeVisible();
    } finally { await context.close(); }
  });
}

test("CL-A04 CP and MK cannot retrieve the other's visible client UUID", async ({ browser, staff }) => {
  const other = await authenticate(browser, staff.tenant === "cp" ? "mk" : "cp");
  try {
    const ownClient = await visibleClient(staff);
    const foreignClient = await visibleClient(other);
    expect(clientId(ownClient)).not.toBe(clientId(foreignClient));
    for (const [actor, target] of [[staff, foreignClient], [other, ownClient]] as const) {
      const response = await actor.call(`clients/${clientId(target)}`);
      expect([403, 404], "Foreign UUID must not be readable").toContain(response.status);
      const found = await actor.list(`any=${encodeURIComponent(target.pppoe_username!)}`);
      expect(found.data.some(c => clientId(c) === clientId(target))).toBe(false);
    }
  } finally { await other.dispose(); }
});

for (const field of ["name", "pppoe_username", "pppoe_password", "network_id", "package_id"] as const) {
  test(`CL-F02 missing ${field} rejects create without persistence`, async ({ page, staff }) => {
    const marker = `E2E invalid ${randomUUID()}`;
    const errors = { name: "Client name is required", pppoe_username: "PPPoE ID is required", pppoe_password: "Password is required", network_id: "Please select a network.", package_id: "Please select a package." };
    await openClientCreate(page);
    if (field !== "name") await page.locator("#name").fill(marker);
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.getByText(errors[field], { exact: true })).toBeVisible();
    await expect(page).toHaveURL(`${staff.baseURL}/clients/create`);
    expect((await staff.list(`any=${encodeURIComponent(marker)}`)).data).toHaveLength(0);
  });
}

 test("CL-F08 cancel create leaves no saved test identity", async ({ page, staff }) => {
   requirePermissions(staff, "clients.create");
   const marker = `E2E cancelled ${randomUUID()}`;
   await openClientCreate(page);
   await page.locator("#name").fill(marker);
   await page.getByRole("button", { name: "Cancel", exact: true }).click();
   await expect(page).toHaveURL(`${staff.baseURL}/clients`);
   expect((await staff.list(`any=${encodeURIComponent(marker)}`)).data).toHaveLength(0);
 });

 test("CL-F06 create billing defaults match company settings", async ({ page, staff }) => {
   requirePermissions(staff, "clients.create");
   await openClientCreate(page);
   await expect(page.getByRole("radio", { name: "Prepaid", exact: true })).toBeChecked();
   await expect(page.getByRole("radio", { name: "Auto", exact: true })).toBeChecked();
   const deadline = Number(staff.profile.settings.payment_deadline ?? 11);
   await expect(page.locator('input[name="payment_deadline"]')).toHaveValue(String(deadline));
   await expect(page.locator('input[name="invoice_day"]')).toHaveValue("01");
 });

 test("CL-F02 one-character name is rejected before create", async ({ page, staff }) => {
   requirePermissions(staff, "clients.create");
   await openClientCreate(page);
   await page.locator("#name").fill("x");
   await page.getByRole("button", { name: "Save", exact: true }).click();
   await expect(page.getByText("Name must be at least 2 characters long", { exact: true })).toBeVisible();
   await expect(page).toHaveURL(`${staff.baseURL}/clients/create`);
 });

for (const [field, value, label] of [
  ["status", "1", "Active"], ["status", "0", "Inactive"],
  ["billing_type", "auto", "Auto"], ["billing_type", "manual", "Manual"],
  ["billing_type", "no_invoice_this_month", "No invoice this month"],
] as const) {
  test(`CL-L03 ${field}=${value} matches backend inclusion and exclusion`, async ({ page, staff }) => {
    const expected = await staff.list(`${field}=${value}`);
    const baseline = await staff.list();
    await page.goto("/clients");
    await searchClients(page, "");
    await page.locator(`#react-select-${field}-input`).click();
    await page.getByRole("option", { name: label, exact: true }).click();
    // FilterDropdownField submits immediately on selection.
    if (!expected.data.length) await expect(page.getByText("No results", { exact: true })).toBeVisible();
    for (const client of expected.data) await expect(page.getByText(client.name, { exact: true })).toBeVisible();
    for (const excluded of baseline.data.filter(c => !expected.data.some(m => clientId(m) === clientId(c)))) {
      await expect(page.locator(`a[href="/clients/view/${clientId(excluded)}"]`)).toHaveCount(0);
    }
  });
}
