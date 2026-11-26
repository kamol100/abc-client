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

// তালিকায় API থেকে পাওয়া ক্লায়েন্ট ও মোট সংখ্যা দেখা যায় এবং রিলোডের পরও ক্লায়েন্টগুলো থাকে কি না যাচাই করি।
test("CL-L01 Client list: show saved clients and total count, and keep clients visible after reload", async ({ page, staff }) => {
  requirePermissions(staff, "clients.access");
  const list = await staff.list();
  await page.goto("/clients");
  for (const client of list.data) await expect(page.getByText(client.name, { exact: true })).toBeVisible();
  if (list.pagination.total) await expect(page.getByText(`Clients (${list.pagination.total})`, { exact: true })).toBeVisible();
  await page.reload();
  for (const client of list.data) await expect(page.getByText(client.name, { exact: true })).toBeVisible();
});

for (const [field, fieldLabel] of [
  ["name", "client name"], ["pppoe_username", "Client ID (PPPoE ID)"], ["phone", "phone number"],
] as const) {
  // নাম, ক্লায়েন্ট আইডি বা ফোন দিয়ে খুঁজে সঠিক ফল আসে, অন্য ফল বাদ যায় এবং সার্চ মুছলে তালিকা ফিরে আসে কি না দেখি।
  test(`CL-L02 Search by ${fieldLabel}: show matching clients, hide nonmatches, and restore the list when cleared`, async ({ page, staff }) => {
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

// এই মাসের ক্লায়েন্টের লিংক খুলে ফিল্টার দেখি; Show all চাপলে URL ও মাসের ফিল্টার সরে যায় কি না যাচাই করি।
test("CL-L05 New clients this month: show filtered clients and remove the month filter with Show all", async ({ page, staff }) => {
  const expected = await staff.list("created_at=this_month");
  await page.goto("/clients?created_at=this_month");
  await expect(page.getByText("New clients this month", { exact: true })).toBeVisible();
  for (const client of expected.data) await expect(page.getByText(client.name, { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Show all clients", exact: true }).click();
  await expect(page).toHaveURL(`${staff.baseURL}/clients`);
  await page.reload();
  await expect(page.getByText("New clients this month", { exact: true })).toHaveCount(0);
});

// কোনো ক্লায়েন্টের সঙ্গে না মেলা সার্চে খালি ফল এবং পরে পরিচিত আইডি খুঁজলে ক্লায়েন্টটি ফিরে আসে কি না দেখি।
test("CL-L06 Search with no matches: show No results, then find an existing client with a new search", async ({ page, staff }) => {
  const client = await visibleClient(staff);
  await page.goto("/clients");
  await searchClients(page, `does-not-exist-${randomUUID()}`);
  await expect(page.getByText("No results", { exact: true })).toBeVisible();
  await expect(page.getByText(client.name, { exact: true })).toHaveCount(0);
  await searchClients(page, client.pppoe_username!);
  await expect(page.getByText(client.name, { exact: true })).toBeVisible();
});

for (const [entry, entryLabel] of [["identity", "Client ID link"], ["view-action", "View action"]] as const) {
  // ক্লায়েন্ট আইডি বা View লিংক চাপলে নির্বাচিত ক্লায়েন্টেরই বিস্তারিত পেজ খোলে কি না যাচাই করি।
  test(`CL-D01 Open client details using the ${entryLabel}: show the selected client`, async ({ page, staff }) => {
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

// বিস্তারিত পেজে সংরক্ষিত নাম ও প্যাকেজ দেখি এবং রিলোডের পরও একই ক্লায়েন্টের নাম থাকে কি না যাচাই করি।
test("CL-D02 Client details: show the saved name and package, and keep the name after reload", async ({ page, staff }) => {
  const client = await visibleClient(staff);
  const saved = await staff.detail(clientId(client));
  await page.goto(`/clients/view/${clientId(client)}`);
  await expect(page.getByText(saved.name, { exact: true }).and(page.locator("span"))).toBeVisible();
  if (saved.package?.name) await expect(page.getByText(saved.package.name, { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText(saved.name, { exact: true }).and(page.locator("span"))).toBeVisible();
});

// তালিকার ফোন ও WhatsApp লিংকে নির্বাচিত ক্লায়েন্টের সঠিক নম্বর ব্যবহার হচ্ছে কি না যাচাই করি; কল বা মেসেজ পাঠাই না।
test("CL-D06 Contact links: use the selected client's phone number for calls and WhatsApp", async ({ page, staff }) => {
  const client = await visibleClient(staff);
  if (!client.phone) throw new Error("Read-only fixture needs a phone number.");
  await page.goto("/clients");
  const row = page.getByRole("row").filter({ has: page.getByRole("link", { name: client.pppoe_username!, exact: true }) });
  await expect(row.locator(`a[href="tel:${client.phone}"]`)).toBeVisible();
  const digits = client.phone.replace(/\D/g, "");
  const international = digits.startsWith("01") ? `88${digits}` : digits;
  await expect(row.locator(`a[href^="https://wa.me/${international}"]`)).toBeVisible();
});

for (const [path, pageLabel] of [
  ["/clients", "client list"],
  ["/clients/create", "create client page"],
  ["/clients/edit/00000000-0000-0000-0000-000000000001", "edit client page"],
  ["/clients/view/00000000-0000-0000-0000-000000000001", "client details page"],
] as const) {
  // লগইন ছাড়া প্রতিটি ক্লায়েন্ট পেজ খুললে একই টেন্যান্টের স্টাফ লগইনে পাঠায় এবং ফেরার ঠিকানা ঠিক থাকে কি না দেখি।
  test(`CL-A01 Login required: opening the ${pageLabel} while signed out redirects to staff login`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, storageState: { cookies: [], origins: [] } });
    try {
      const page = await context.newPage();
      await page.goto(path);
      await expect(page).toHaveURL(url => url.origin === baseURL && url.pathname === "/admin" && url.searchParams.get("callbackUrl") === path);
      await expect(page.locator("#username")).toBeVisible();
    } finally { await context.close(); }
  });
}

// CP ও MK উভয় দিক থেকে অন্য কোম্পানির ক্লায়েন্টের বিস্তারিত পড়া বা সার্চে পাওয়া যায় না—তা যাচাই করি।
test("CL-A04 Company privacy: CP and MK cannot read or search each other's clients", async ({ browser, staff }) => {
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

for (const [field, fieldLabel] of [
  ["name", "client name"], ["pppoe_username", "Client ID (PPPoE ID)"],
  ["pppoe_password", "password"], ["network_id", "network"], ["package_id", "package"],
] as const) {
  // আবশ্যক ঘর ফাঁকা রেখে Save চাপলে সংশ্লিষ্ট ভুল দেখায়, ফর্ম খোলা থাকে এবং নতুন ক্লায়েন্ট তৈরি হয় না কি না দেখি।
  test(`CL-F02 Required ${fieldLabel}: show a validation error and do not create a client when empty`, async ({ page, staff }) => {
    const marker = `E2E invalid ${randomUUID()}`;
    const errors = { name: "Client name is required", pppoe_username: "Client ID is required", pppoe_password: "Password is required", network_id: "Please select a network.", package_id: "Please select a package." };
    await openClientCreate(page);
    if (field === "pppoe_username") {
      await expect(page.locator("#pppoe_username")).toHaveAttribute("placeholder", "Enter client ID (PPPoE ID)");
    }
    if (field !== "name") await page.locator("#name").fill(marker);
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.getByText(errors[field], { exact: true })).toBeVisible();
    await expect(page).toHaveURL(`${staff.baseURL}/clients/create`);
    expect((await staff.list(`any=${encodeURIComponent(marker)}`)).data).toHaveLength(0);
  });
}

 // নতুন ক্লায়েন্টের ফর্মে নাম লিখে Cancel করলে তালিকায় ফিরে আসে এবং ওই নামে কোনো ক্লায়েন্ট তৈরি হয় না কি না দেখি।
 test("CL-F08 Cancel new client: return to the list without saving the entered name", async ({ page, staff }) => {
   requirePermissions(staff, "clients.create");
   const marker = `E2E cancelled ${randomUUID()}`;
   await openClientCreate(page);
   await page.locator("#name").fill(marker);
   await page.getByRole("button", { name: "Cancel", exact: true }).click();
   await expect(page).toHaveURL(`${staff.baseURL}/clients`);
   expect((await staff.list(`any=${encodeURIComponent(marker)}`)).data).toHaveLength(0);
 });

 // নতুন ফর্মে Prepaid, Auto, কোম্পানির পেমেন্ট সময়সীমা ও মাসের প্রথম ইনভয়েস দিন ডিফল্ট থাকে কি না দেখি।
 test("CL-F06 New client defaults: use Prepaid, Auto billing, the company deadline, and invoice day 01", async ({ page, staff }) => {
   requirePermissions(staff, "clients.create");
   await openClientCreate(page);
   await expect(page.getByRole("radio", { name: "Prepaid", exact: true })).toBeChecked();
   await expect(page.getByRole("radio", { name: "Auto", exact: true })).toBeChecked();
   const deadline = Number(staff.profile.settings.payment_deadline ?? 11);
   await expect(page.locator('input[name="payment_deadline"]')).toHaveValue(String(deadline));
   await expect(page.locator('input[name="invoice_day"]')).toHaveValue("01");
 });

 // এক অক্ষরের নাম দিয়ে Save চাপলে ন্যূনতম দুই অক্ষরের বার্তা দেখায় এবং ফর্মেই থাকে কি না যাচাই করি।
 test("CL-F02 Client name too short: show the two-character minimum error and keep the form open", async ({ page, staff }) => {
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
  const filterLabel = field === "status" ? "Status" : "Billing type";
  // Status বা Billing type বেছে API-এর সঙ্গে মিলিয়ে সঠিক ক্লায়েন্ট দেখা যায় এবং অন্য ক্লায়েন্ট বাদ যায় কি না দেখি।
  test(`CL-L03 ${filterLabel} filter - ${label}: open the dropdown and show only matching clients`, async ({ page, staff }) => {
    const expected = await staff.list(`${field}=${value}`);
    const baseline = await staff.list();
    await page.goto("/clients");
    await searchClients(page, "");
    // এই ধাপে টাইমআউট হলে ড্রপডাউন খোলার locator খুঁজে পাওয়া বা ক্লিক করা যাচ্ছে কি না পরীক্ষা করতে হবে।
    await test.step(`Open the ${filterLabel} filter dropdown`, async () => {
      await page.locator(`#react-select-${field}-input`).click();
    });
    await test.step(`Select the ${label} option`, async () => {
      await page.getByRole("option", { name: label, exact: true }).click();
    });
    // FilterDropdownField submits immediately on selection.
    if (!expected.data.length) await expect(page.getByText("No results", { exact: true })).toBeVisible();
    for (const client of expected.data) await expect(page.getByText(client.name, { exact: true })).toBeVisible();
    for (const excluded of baseline.data.filter(c => !expected.data.some(m => clientId(m) === clientId(c)))) {
      await expect(page.locator(`a[href="/clients/view/${clientId(excluded)}"]`)).toHaveCount(0);
    }
  });
}
