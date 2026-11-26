import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

type Account = { uuid: string; host: string };
type Client = {
  id: number;
  company_id: number;
  name: string;
  pppoe_username: string;
  network_id: number;
  package_id: number;
  network_name: string;
  package_name: string;
  package_network_id: number;
};
type State = {
  clients: Client[];
  bulkRequests: { all_import: boolean; import_id: string[]; queuedUuids: string[] }[];
  expectedPackageId: number;
  profileClientId: number;
  companyIds: { cp: number; mk: number };
};

function environment() {
  const { MKS_E2E_ACCOUNTS, MKS_E2E_PASSWORD, MKS_E2E_PORT, MKS_E2E_API } = process.env;
  if (!MKS_E2E_ACCOUNTS || !MKS_E2E_PASSWORD || !MKS_E2E_PORT || !MKS_E2E_API) {
    throw new Error("Start the disposable fixture with npm run test:e2e:mikrotik-sync.");
  }
  return { accounts: JSON.parse(MKS_E2E_ACCOUNTS) as Record<string, Account>, password: MKS_E2E_PASSWORD,
    port: MKS_E2E_PORT, api: MKS_E2E_API };
}

function origin(account: string) {
  const env = environment();
  const host = env.accounts[account]?.host;
  if (!["cp.isp.test", "mk.isp.test"].includes(host)) throw new Error("Unregistered MikroTik test host.");
  return `http://${host}:${env.port}`;
}

async function login(page: Page, account: string) {
  await page.goto(`${origin(account)}/admin?callbackUrl=${encodeURIComponent("/mikrotik-sync")}`);
  await page.getByRole("textbox", { name: "Username" }).fill(account);
  await page.locator("#password").fill(environment().password);
  const csrfResponse = await page.request.get(`${origin(account)}/api/auth/csrf`);
  expect(csrfResponse.status()).toBe(200);
  expect(typeof (await csrfResponse.json()).csrfToken).toBe("string");
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await expect(page).toHaveURL(`${origin(account)}/mikrotik-sync`);
  const sessionResponse = await page.request.get(`${origin(account)}/api/auth/session`);
  expect(sessionResponse.status()).toBe(200);
  const session = await sessionResponse.json();
  expect(session.user.name).toBe(account.replaceAll("_", " "));
  await expect(page.getByText(/^Total Mikrotik - /)).toBeVisible();
}

async function state(request: APIRequestContext): Promise<State> {
  const env = environment();
  const response = await request.get(`${env.api}/api/__mikrotik-sync/state`, {
    headers: { "x-mikrotik-fixture": env.password },
  });
  expect(response.status()).toBe(200);
  return await response.json() as State;
}

const row = (page: Page, name: string) => page.getByRole("row").filter({ hasText: name });

// ফিল্টার করা তালিকা থেকে বাছা ক্লায়েন্টটিই ইমপোর্ট হয় এবং লুকানো ক্লায়েন্ট বাদ থাকে কি না দেখি।
test("FT033-13 Import selected MikroTik clients: import only the selected visible client after filtering", async ({ page, request }, testInfo) => {
  const baseline = await state(request);
  const otherCompany = baseline.clients.filter((client) => client.company_id === baseline.companyIds.mk);

  await test.step("Show two router clients, then filter out the hidden sentinel", async () => {
    await login(page, "mks_cp");
    await expect(row(page, "visible-only-client")).toBeVisible();
    await expect(row(page, "hidden-do-not-import")).toBeVisible();
    await page.getByRole("button", { name: "Filter", exact: true }).click();
    await page.getByPlaceholder("Search by name, client, or profile").fill("visible-only-client");
    await expect(row(page, "visible-only-client")).toBeVisible();
    await expect(row(page, "hidden-do-not-import")).toHaveCount(0);
    await page.screenshot({ path: testInfo.outputPath("01-one-filtered-client.png"), animations: "disabled" });
  });

  await test.step("Select the one visible row and import it through the real form", async () => {
    await expect(page.getByPlaceholder("Search by name, client, or profile")).toHaveValue("visible-only-client");
    await expect(row(page, "hidden-do-not-import")).toHaveCount(0);
    await row(page, "visible-only-client").getByRole("checkbox", { name: "Select row", exact: true }).check();
    await page.getByRole("button", { name: "Client Import (1)", exact: true }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toContainText("Import as Own Client");
    await expect(dialog.getByRole("radio", { name: "Selected clients only (1)", exact: true })).toBeChecked();
    await expect(dialog.getByRole("radio", { name: "All unimported clients in this company (2)", exact: true })).toBeVisible();
    await dialog.getByRole("button", { name: "Import", exact: true }).click();
    await expect(dialog).not.toBeVisible({ timeout: 35_000 });
  });

  await test.step("Read persisted clients and show the result in the client table", async () => {
    const actual = await state(request);
    const imported = actual.clients.filter((client) => client.company_id === actual.companyIds.cp);
    expect(actual.clients.filter((client) => client.company_id === actual.companyIds.mk)).toEqual(otherCompany);
    expect(actual.bulkRequests).toHaveLength(1);
    expect(actual.bulkRequests[0].all_import).toBe(false);
    expect(actual.bulkRequests[0].import_id).toHaveLength(1);
    expect(actual.bulkRequests[0].queuedUuids).toEqual(actual.bulkRequests[0].import_id);
    await page.goto(`${origin("mks_cp")}/clients`);
    await expect(row(page, "visible-only-client")).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("02-actual-imported-clients.png"), animations: "disabled", fullPage: true });
    await testInfo.attach("bulk-selection-evidence", { contentType: "application/json", body: JSON.stringify({
      expectedNames: ["visible-only-client"], actualNames: imported.map((client) => client.name).sort(),
      submitted: actual.bulkRequests,
    }, null, 2) });
    expect(imported.map((client) => client.name).sort(), "A hidden, unselected client must not be imported").toEqual(["visible-only-client"]);
  });
});

// মোবাইলে পুরো কোম্পানির ইমপোর্ট স্পষ্টভাবে বেছে নিতে হয় এবং ডায়ালগ পর্দায় ধরে কি না দেখি।
test("FT033-15 Import all company clients: require an explicit scope choice in the mobile dialog", async ({ page, request }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const baseline = await state(request);
  const foreign = baseline.clients.filter((client) => client.company_id === baseline.companyIds.mk);
  const companyUnimportedCount = 2 - baseline.clients.filter((client) => client.company_id === baseline.companyIds.cp).length;
  await login(page, "mks_cp");
  await expect(row(page, "hidden-do-not-import")).toBeVisible();
  await row(page, "hidden-do-not-import").getByRole("checkbox", { name: "Select row", exact: true }).check();
  await page.getByRole("button", { name: /Client Import \(1\)/ }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("radio", { name: "Selected clients only (1)", exact: true })).toBeChecked();
  await dialog.getByRole("radio", { name: `All unimported clients in this company (${companyUnimportedCount})`, exact: true }).check();
  const box = await dialog.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);
  await page.screenshot({ path: testInfo.outputPath("explicit-company-scope-mobile.png"), animations: "disabled" });
  await dialog.getByRole("button", { name: "Import", exact: true }).click();
  await expect(dialog).not.toBeVisible({ timeout: 35_000 });
  const actual = await state(request);
  expect(actual.bulkRequests.at(-1)?.all_import).toBe(true);
  expect(actual.bulkRequests.at(-1)?.import_id).toEqual([]);
  expect(actual.clients.filter((client) => client.company_id === actual.companyIds.cp).map((client) => client.name).sort())
    .toEqual(["hidden-do-not-import", "visible-only-client"]);
  expect(actual.clients.filter((client) => client.company_id === actual.companyIds.mk)).toEqual(foreign);
});

// প্রোফাইল মেলানোর সময় অন্য রাউটারের বদলে ক্লায়েন্টের নিজের রাউটারের প্যাকেজ নেয় কি না দেখি।
test("FT033-14 Resolve MikroTik profile: assign the package from the client's own router", async ({ page, request }, testInfo) => {
  await test.step("Show Router B's mismatch with a profile shared by Router A", async () => {
    await login(page, "mks_mk");
    await page.getByRole("button", { name: "Filter", exact: true }).click();
    await page.locator('[id="syncd_status"]').click();
    await page.getByRole("option", { name: "All", exact: true }).click();
    await expect(row(page, "router-b-client")).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("01-router-b-mismatch.png"), animations: "disabled" });
  });

  await test.step("Resolve in the browser, then independently verify package ownership", async () => {
    await row(page, "router-b-client").getByRole("button", { name: "Individual Sync", exact: true }).click();
    await expect(page.getByText("Client synced successfully", { exact: true })).toBeVisible();
    const actual = await state(request);
    const client = actual.clients.find((item) => item.id === actual.profileClientId);
    expect(client).toBeDefined();
    await page.goto(`${origin("mks_mk")}/clients`);
    await expect(row(page, "Router B subscriber")).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("02-actual-assigned-package.png"), animations: "disabled", fullPage: true });
    await testInfo.attach("package-ownership-evidence", { contentType: "application/json", body: JSON.stringify({
      expectedPackageId: actual.expectedPackageId, expectedPackageName: "Router B Gold - correct",
      actualPackageId: client?.package_id, actualPackageName: client?.package_name,
      clientNetworkId: client?.network_id, packageNetworkId: client?.package_network_id,
    }, null, 2) });
    expect(client?.package_id, "Resolve must use Router B's Gold package, even when Router A has the same profile name").toBe(actual.expectedPackageId);
    expect(client?.package_network_id).toBe(client?.network_id);
  });
});
