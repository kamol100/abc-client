import { expect, test, type APIRequestContext, type Browser, type Page } from "@playwright/test";

type Account = { uuid: string; host: string };
type Stock = { uuid: string; id: number; name: string; stock: number };
type Fixture = { unit: number; category: number; staff: number; client: number; otherStaff: number; otherVendor: number; otherClient: number; expense: number; vendor: number; products: Stock[] };
function environment() {
  const { PRD_E2E_ACCOUNTS, PRD_E2E_PASSWORD, PRD_E2E_PORT, PRD_E2E_API, PRD_E2E_FIXTURES } = process.env;
  if (!PRD_E2E_ACCOUNTS || !PRD_E2E_PASSWORD || !PRD_E2E_PORT || !PRD_E2E_API || !PRD_E2E_FIXTURES) {
    throw new Error("Use node scripts/run-products-e2e.mjs to start disposable fixtures.");
  }
  return { accounts: JSON.parse(PRD_E2E_ACCOUNTS) as Record<string, Account>, password: PRD_E2E_PASSWORD,
    port: PRD_E2E_PORT, api: PRD_E2E_API, fixtures: JSON.parse(PRD_E2E_FIXTURES) as Record<string, Fixture> };
}
function origin(account: string) {
  const env = environment();
  const host = env.accounts[account]?.host;
  if (!["cp.isp.test", "mk.isp.test"].includes(host)) throw new Error("Unregistered product host");
  return `http://${host}:${env.port}`;
}
async function login(browser: Browser, account = "prd_cp", target = "/products", waitForProducts = true) {
  const context = await browser.newContext({ baseURL: origin(account), locale: "en-US", timezoneId: "Asia/Dhaka", serviceWorkers: "block" });
  const page = await context.newPage();
  await page.goto(`/admin?callbackUrl=${encodeURIComponent(target)}`);
  await page.getByRole("textbox", { name: "Username" }).fill(account);
  await page.locator("#password").fill(environment().password);
  const csrf = await page.request.get("/api/auth/csrf");
  expect(csrf.status()).toBe(200);
  expect(typeof (await csrf.json()).csrfToken).toBe("string");
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await expect(page).toHaveURL(`${origin(account)}${target}`);
  const session = await (await page.request.get("/api/auth/session")).json();
  expect(session.user.name).toBe(account.replaceAll("_", " "));
  if (target === "/products" && waitForProducts) await expect(row(page, environment().fixtures.prd_cp.products[0].name)).toBeVisible();
  return { page, context };
}
async function auth(request: APIRequestContext, account = "prd_cp") {
  const env = environment();
  const response = await request.post(`${env.api}/api/v1/auth/login`, {
    data: { host: env.accounts[account].host, username: account, password: env.password },
  });
  expect(response.status()).toBe(200);
  return { Accept: "application/json", Authorization: `Bearer ${(await response.json()).token}` };
}
const api = (path: string) => `${environment().api}/api/v1/${path}`;
test.afterEach(async ({ request }) => { await control(request, {}); });

const row = (page: Page, name: string) => page.getByRole("row").filter({ hasText: name });

test("FT051-04-a products route shows tenant-owned stock after reload", async ({ browser, request }, testInfo) => {
  const headers = await auth(request);
  const result = await request.get(api("products"), { headers });
  expect(result.status()).toBe(200);
  const data = await result.json();
  expect(data.data.pagination.total).toBe(14);
  const { page, context } = await login(browser);
  const stock = environment().fixtures.prd_cp.products[0];
  await expect(row(page, stock.name)).toContainText("10");
  await expect(page.getByRole("table")).not.toContainText("prd_mk stock");
  await page.reload();
  await expect(row(page, stock.name)).toContainText("10");
  await page.screenshot({ path: testInfo.outputPath("desktop-products.png"), fullPage: true, animations: "disabled" });
  await context.close();
});

async function createProduct(request: APIRequestContext, headers: Record<string, string>, name: string, serial = 0) {
  const f = environment().fixtures.prd_cp;
  const response = await request.post(api("products"), { headers, data: {
    name, unit_type_id: f.unit, product_category_id: f.category, has_serial: serial, vat: 0, description: "Acceptance product",
  } });
  expect(response.status()).toBe(200);
  return (await response.json()).data as { id: string; product_id: number; name: string };
}
async function stockIn(request: APIRequestContext, headers: Record<string, string>, productId: number, quantity = 10, serial?: string[]) {
  const f = environment().fixtures.prd_cp;
  const result = await request.post(api("products-in"), { headers, data: {
    purchase_by: f.staff, purchase_date: "2026-11-02", voucher: `ACCEPT-${productId}`, note: "Acceptance stock",
    expense: { expense_type_id: f.expense, vendor_id: f.vendor, fund_id: null, amount: quantity * 100, note: "Acceptance expense" },
    product: [{ product_id: productId, quantity, status: "new", brand: "Acceptance", unit_price: 100,
      unit_sell_price: 150, total_price: quantity * 100, ...(serial ? { serial } : {}) }],
  } });
  return result;
}
function outPayload(product: { product_id: number; productin_id: number }, quantity: number) {
  return { received_by: environment().fixtures.prd_cp.staff, out_date: "2026-11-03", create_invoice: 0,
    product: [{ ...product, quantity, unit_price: 150, total_price: quantity * 150 }] };
}
async function lot(request: APIRequestContext, headers: Record<string, string>, uuid: string) {
  const response = await request.get(api(`products-in/${uuid}`), { headers });
  expect(response.status()).toBe(200);
  const rows = (await response.json()).data.data;
  expect(rows).toHaveLength(1);
  const productId = rows[0].product.id as number;
  const dropdown = await request.get(api(`dropdown-product-ins/${productId}`), { headers });
  expect(dropdown.status()).toBe(200);
  const lots = (await dropdown.json()).data;
  expect(lots).toHaveLength(1);
  return { productin_id: lots[0].id as number };
}

test("FT051-01-a create serial product through UI and freshly read its attributes", async ({ browser, request }) => {
  const { page, context } = await login(browser);
  await expect(row(page, environment().fixtures.prd_cp.products[0].name)).toBeVisible();
  await page.getByRole("button", { name: "Add Product", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Add Product", exact: true });
  await dialog.getByLabel("Product Name", { exact: false }).fill("Acceptance UI Router");
  await dialog.getByRole("radio", { name: "Yes", exact: true }).click();
  await dialog.locator("#vat").fill("7.5");
  for (const [id, name] of [["unit_type_id", "Product Test Pieces"], ["product_category_id", "product test hardware"]]) {
    await dialog.locator(`[id="${id}"]`).click();
    await page.getByRole("option", { name, exact: true }).click();
  }
  await dialog.getByRole("button", { name: "Save", exact: true }).click();
  await expect(dialog).toBeHidden();
  const headers = await auth(request);
  const result = await request.get(api("products?any=Acceptance%20UI%20Router"), { headers });
  const rows = (await result.json()).data.data;
  expect(rows).toHaveLength(1);
  expect(rows[0]).toMatchObject({ name: "Acceptance UI Router", has_serial: 1, vat: 7.5,
    unitType: { id: environment().fixtures.prd_cp.unit }, category: { id: environment().fixtures.prd_cp.category } });
  await page.reload();
  await page.getByRole("button", { name: "Filter", exact: true }).click();
  await page.getByPlaceholder("Search by product ID, name, or description").fill("Acceptance UI Router");
  await expect(row(page, "Acceptance UI Router")).toContainText("7.5%");
  await context.close();
});

for (const mode of ["in", "out"] as const) {
  test(`FT051-04-${mode} stock ${mode} form and product-specific movement route survive reload`, async ({ browser }) => {
    const stock = environment().fixtures.prd_cp.products[0];
    const { page, context } = await login(browser, "prd_cp", `/products/${mode}?product_id=${stock.id}`);
    await expect(page.getByRole("button", { name: "Save", exact: true })).toBeVisible();
    await expect(page.getByText(stock.name, { exact: false })).toBeVisible();
    await page.goto(`/products/${mode}/${stock.uuid}`);
    await expect(page.getByRole("table")).toBeVisible();
    await page.reload();
    await expect(page.getByRole("table")).toBeVisible();
    if (mode === "in") await expect(page.getByRole("table")).toContainText(stock.name);
    else await expect(page.getByRole("table")).toContainText(stock.name);
    await context.close();
  });
}

test("FT051-03-a backend rejects negative stock input without persisting a movement", async ({ request }) => {
  const headers = await auth(request);
  const product = await createProduct(request, headers, "Negative input sentinel");
  expect((await stockIn(request, headers, product.product_id, -1)).status()).toBe(422);
  const response = await request.get(api(`products-in/${product.id}`), { headers });
  expect((await response.json()).data.data).toEqual([]);
});

test("FT051-03-b rejects duplicate serial numbers atomically", async ({ request }) => {
  const headers = await auth(request);
  const product = await createProduct(request, headers, "Duplicate serial sentinel", 1);
  expect((await stockIn(request, headers, product.product_id, 2, ["SERIAL-DUP", "SERIAL-DUP"])).status()).toBe(422);
  const result = await request.get(api(`products-in/${product.id}`), { headers });
  expect((await result.json()).data.data).toEqual([]);
});

test("FT051-03-c competing stock issues cannot consume more than the remaining quantity", async ({ request }) => {
  const headers = await auth(request);
  const product = await createProduct(request, headers, "Concurrent issue sentinel");
  expect((await stockIn(request, headers, product.product_id)).status()).toBe(200);
  const incoming = await lot(request, headers, product.id);
  const payload = outPayload({ product_id: product.product_id, productin_id: incoming.productin_id }, 7);
  const responses = await Promise.all([request.post(api("products-out"), { headers, data: payload }), request.post(api("products-out"), { headers, data: payload })]);
  expect(responses.map((r) => r.status()).sort()).toEqual([200, 405]);
  const result = await request.get(api(`products-out/${product.id}`), { headers });
  expect((await result.json()).data.reports.quantity).toBe(7);
});

for (const actor of ["prd_reader", "prd_denied"]) {
  test(`FT051-09-${actor} denies product and stock mutations with no new records`, async ({ request }) => {
    const headers = await auth(request, actor);
    for (const path of ["products", "products-in", "products-out"]) {
      expect((await request.post(api(path), { headers, data: {} })).status()).toBe(403);
    }
    const response = await request.get(api("products"), { headers });
    expect(response.status()).toBe(actor === "prd_reader" ? 200 : 403);
  });
}

test("FT051-10-a foreign UUID reads and deletes are denied on both product movement routes", async ({ request }) => {
  const headers = await auth(request);
  const foreign = environment().fixtures.prd_mk.products[0];
  for (const path of [`products/${foreign.uuid}`, `products-in/${foreign.uuid}`, `products-out/${foreign.uuid}`, `get-product/${foreign.id}`]) {
    expect((await request.get(api(path), { headers })).status()).toBe(404);
  }
  expect((await request.delete(api(`products/${foreign.uuid}`), { headers })).status()).toBe(404);
  const ownerHeaders = await auth(request, "prd_mk");
  expect((await request.get(api(`products/${foreign.uuid}`), { headers: ownerHeaders })).status()).toBe(200);
});

test("FT051-10-b foreign category and writable tenant identifiers cannot cross company boundaries", async ({ request }) => {
  const headers = await auth(request);
  const f = environment().fixtures.prd_cp;
  const foreign = environment().fixtures.prd_mk;
  const response = await request.post(api("products"), { headers, data: {
    name: "Forbidden foreign relationship", unit_type_id: f.unit, product_category_id: foreign.category,
    has_serial: 0, company_id: 999999,
  } });
  expect(response.status()).toBe(422);
});

async function control(request: APIRequestContext, data?: Record<string, unknown>) {
  const url = `${environment().api}/__products/control`;
  const options = { headers: { "x-product-fixture": environment().password } };
  const response = data ? await request.post(url, { ...options, data }) : await request.get(url, options);
  expect(response.status()).toBe(200);
  return response.json() as Promise<{ hits: number }>;
}
async function state(request: APIRequestContext) {
  const response = await request.get(`${environment().api}/api/__products/state`, { headers: { "x-product-fixture": environment().password } });
  expect(response.status()).toBe(200);
  return response.json() as Promise<Record<string, Array<Record<string, unknown>>>>;
}
async function choose(page: Page, id: string, name: string | RegExp) {
  await page.locator(`[id="${id}"]`).click();
  await page.getByRole("option", { name, exact: typeof name === "string" }).click();
}
async function pickToday(page: Page, label: RegExp) {
  await page.getByRole("button", { name: label }).click();
  const date = new Date().toLocaleDateString("en-US", { timeZone: "Asia/Dhaka" });
  await page.locator(`button[data-day="${date}"]`).click();
}

test("FT051-02-a stock-in and stock-out UI persist exact quantities and expense with no invoice", async ({ browser, request }) => {
  const headers = await auth(request);
  const product = await createProduct(request, headers, "UI movement reconciliation");
  const { page, context } = await login(browser, "prd_cp", `/products/in?product_id=${product.product_id}`);
  await expect(page.getByText(/UI movement reconciliation-Product Test Pieces/)).toBeVisible();
  await choose(page, "purchase_by", "Product Test Staff");
  await pickToday(page, /^Purchase Date/);
  await page.locator("#voucher").fill("UI-MOVEMENT-3");
  await choose(page, "expense.expense_type_id", "Product Test Purchase");
  await choose(page, "expense.vendor_id", "Product Test Vendor");
  await page.locator('[id="expense.amount"]').fill("300");
  await page.locator('[id="product.0.brand"]').fill("UI stock");
  await page.locator('[id="product.0.quantity"]').fill("3");
  await page.locator('[id="product.0.unit_price"]').fill("100");
  await page.locator('[id="product.0.unit_sell_price"]').fill("150");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page).toHaveURL(`${origin("prd_cp")}/products`);
  const incoming = await lot(request, headers, product.id);
  let snapshot = await state(request);
  expect(snapshot.product_ins.find((r) => r.id === incoming.productin_id)).toMatchObject({ quantity: 3, quantity_remaining: 3, total_price: 30000 });
  expect(snapshot.expenses.filter((r) => r.voucher === "UI-MOVEMENT-3")).toHaveLength(1);
  expect(snapshot.expenses.find((r) => r.voucher === "UI-MOVEMENT-3")).toMatchObject({ amount: 30000, vendor_id: environment().fixtures.prd_cp.vendor });
  await page.goto(`/products/out?product_id=${product.product_id}`);
  await choose(page, "received_by", "Product Test Staff");
  await pickToday(page, /^Out Date/);
  const lots = await (await request.get(api(`dropdown-product-ins/${product.product_id}`), { headers })).json();
  const chosen = lots.data.find((r: { id: number }) => r.id === incoming.productin_id);
  expect(chosen).toBeTruthy();
  await choose(page, "product.0.productin_id", chosen.name);
  await page.locator('[id="product.0.quantity"]').fill("2");
  await page.locator('[id="product.0.unit_price"]').fill("150");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page).toHaveURL(`${origin("prd_cp")}/products`);
  await page.reload();
  await page.getByRole("button", { name: "Filter", exact: true }).click();
  await page.getByPlaceholder("Search by product ID, name, or description").fill(product.name);
  await expect(row(page, product.name)).toContainText("UI movement reconciliation");
  snapshot = await state(request);
  expect(snapshot.product_ins.find((r) => r.id === incoming.productin_id)).toMatchObject({ quantity_remaining: 1 });
  expect(snapshot.product_outs.filter((r) => r.product_id === product.product_id)).toEqual([expect.objectContaining({ quantity: 2, total_price: 30000, received_by: environment().fixtures.prd_cp.staff })]);
  expect(snapshot.queuedInvoices).toEqual([]);
  await context.close();
});

test("FT051-05-a product filters combine and clearing restores the known baseline", async ({ browser }) => {
  const { page, context } = await login(browser);
  const f = environment().fixtures.prd_cp;
  await expect(row(page, f.products[0].name)).toBeVisible();
  await page.getByRole("button", { name: "Filter", exact: true }).click();
  const search = page.getByPlaceholder("Search by product ID, name, or description");
  await search.fill("prd_cp stock");
  await choose(page, "has_serial", "Yes");
  await choose(page, "product_category_id", "product test hardware");
  await choose(page, "unit_type_id", "Product Test Pieces");
  await expect(row(page, f.products[0].name)).toBeVisible();
  await expect(row(page, f.products[1].name)).toHaveCount(0);
  await expect(page.getByRole("row")).toHaveCount(2);
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(row(page, f.products[1].name)).toBeVisible();
  await search.fill("no-such-product-acceptance");
  await expect(page.getByRole("table")).toContainText("No results");
  await context.close();
});

for (const filter of ["product_category_id", "unit_type_id", "has_serial"] as const) {
  test(`FT051-05-${filter} independently excludes the other fixture`, async ({ browser }) => {
    const { page, context } = await login(browser);
    const f = environment().fixtures.prd_cp;
    await expect(row(page, f.products[0].name)).toBeVisible();
    await page.getByRole("button", { name: "Filter", exact: true }).click();
    const value = filter === "product_category_id" ? "product test cable" : filter === "unit_type_id" ? "Product Test Meters" : "Yes";
    await choose(page, filter, value);
    const included = filter === "has_serial" ? f.products[0] : f.products[1];
    const excluded = filter === "has_serial" ? f.products[1] : f.products[0];
    await expect(row(page, included.name)).toBeVisible();
    await expect(row(page, excluded.name)).toHaveCount(0);
    await context.close();
  });
}

test("FT051-06-a product pagination and column visibility preserve the selected identities", async ({ browser }) => {
  const { page, context } = await login(browser);
  await expect(row(page, environment().fixtures.prd_cp.products[0].name)).toBeVisible();
  await expect(page.getByRole("row")).toHaveCount(11);
  await page.getByRole("button", { name: "Go to next page", exact: true }).click();
  await expect(row(page, environment().fixtures.prd_cp.products[0].name)).toHaveCount(0);
  await page.getByRole("button", { name: "Go to first page", exact: true }).click();
  await expect(row(page, environment().fixtures.prd_cp.products[0].name)).toBeVisible();
  await page.getByRole("button", { name: "View", exact: true }).click();
  await page.getByRole("menuitemcheckbox", { name: /vat/i }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("columnheader", { name: "VAT (%)", exact: true })).toHaveCount(0);
  await context.close();
});

test("FT051-07-a edit hydrates relations, cancel preserves data, and saved changes survive reload", async ({ browser, request }) => {
  const headers = await auth(request);
  const product = await createProduct(request, headers, "Hydration sentinel");
  const { page, context } = await login(browser);
  await page.getByRole("button", { name: "Filter", exact: true }).click();
  await page.getByPlaceholder("Search by product ID, name, or description").fill(product.name);
  const target = row(page, product.name);
  await expect(target).toBeVisible();
  // Close filter mode to expose row actions without discarding the selected record.
  await target.getByRole("button", { name: "Edit Product", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Edit Product", exact: true });
  await expect(dialog.locator("#name")).toHaveValue(product.name);
  await expect(dialog.getByText("Product Test Pieces", { exact: true })).toBeVisible();
  await dialog.locator("#name").fill("Cancelled name");
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  let fresh = await request.get(api(`products/${product.id}`), { headers });
  expect((await fresh.json()).data.name).toBe(product.name);
  await target.getByRole("button", { name: "Edit Product", exact: true }).click();
  await expect(dialog.locator("#name")).toHaveValue(product.name);
  await dialog.locator("#description").fill("Freshly saved description");
  await dialog.getByRole("button", { name: "Save", exact: true }).click();
  await expect(dialog).toBeHidden();
  await page.reload();
  fresh = await request.get(api(`products/${product.id}`), { headers });
  expect((await fresh.json()).data.description).toBe("Freshly saved description");
  await context.close();
});

test("FT051-09-ui restricted users see no write controls, including direct stock URLs", async ({ browser }) => {
  const { page, context } = await login(browser, "prd_reader");
  await expect(row(page, environment().fixtures.prd_cp.products[0].name)).toBeVisible();
  await expect(page.getByRole("button", { name: "Add Product", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Edit Product", exact: true })).toHaveCount(0);
  for (const path of ["/products/in", "/products/out", "/products/reports"]) {
    await page.goto(path);
    await expect(page.getByRole("alert").filter({ hasText: "You do not have permission" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Save", exact: true })).toHaveCount(0);
  }
  await context.close();
});

test("FT051-11-a failed list is not empty state and retry restores exact records", async ({ browser, request }) => {
  await control(request, { path: "/api/v1/products?", failures: 3 });
  const { page, context } = await login(browser, "prd_cp", "/products", false);
  await expect(page.getByRole("alert").filter({ hasText: "Products could not be loaded" })).toBeVisible();
  await expect(page.getByText("No results", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(row(page, environment().fixtures.prd_cp.products[0].name)).toBeVisible();
  await control(request, {});
  await context.close();
});

test("FT051-11-b delayed filter refresh keeps rows and scroll stable then shows latest filter", async ({ browser, request }) => {
  const { page, context } = await login(browser);
  const f = environment().fixtures.prd_cp;
  await expect(row(page, f.products[0].name)).toBeVisible();
  await page.getByRole("button", { name: "Filter", exact: true }).click();
  await control(request, { path: "/api/v1/products?", hold: true });
  const before = await page.getByRole("table").boundingBox();
  const scroll = await page.evaluate(() => window.scrollY);
  await page.getByPlaceholder("Search by product ID, name, or description").fill(f.products[0].name);
  await expect.poll(async () => (await control(request)).hits).toBeGreaterThan(0);
  await expect(row(page, f.products[1].name)).toBeVisible();
  expect((await page.getByRole("table").boundingBox())?.y).toBe(before?.y);
  expect(await page.evaluate(() => window.scrollY)).toBe(scroll);
  await page.getByPlaceholder("Search by product ID, name, or description").fill(f.products[1].name);
  await control(request, { release: true });
  await expect(row(page, f.products[0].name)).toHaveCount(0);
  await expect(row(page, f.products[1].name)).toBeVisible();
  await control(request, {});
  await context.close();
});

for (const mode of ["in", "out"] as const) {
  test(`FT051-05-${mode}-movement report filters reconcile exact scope beyond one page`, async ({ request, browser }) => {
    const headers = await auth(request);
    const f = environment().fixtures.prd_cp;
    const filters = [
      ["product_id", f.products[0].id], ["vendor_id", f.vendor], ["entry_by", f.staff],
      [mode === "in" ? "purchase_by" : "received_by", f.staff], ["status", "new"],
      ...(mode === "out" ? [["client_id", f.client]] : []),
    ];
    for (const [key, value] of filters) {
      const response = await request.get(api(`products-${mode}/reports?${key}=${value}`), { headers });
      expect(response.status()).toBe(200);
      const data = (await response.json()).data;
      const ids = data.data.map((r: { product: { id: number } }) => r.product.id);
      expect(ids).toContain(f.products[0].id);
      expect(ids).not.toContain(f.products[1].id);
      const snapshot = await state(request);
      const seed = snapshot.product_ins.find((r) => r.product_id === f.products[0].id);
      const column = key === "entry_by" ? "staff_id" : key;
      const expectedValue = mode === "in" && key === "entry_by" ? seed?.staff_id : value;
      const records = snapshot[mode === "in" ? "product_ins" : "product_outs"].filter((r) => r.company_id === seed?.company_id && String(r[String(column)]) === String(expectedValue));
      expect(data.pagination.total).toBe(records.length);
      expect(data.reports).toEqual({ quantity: records.reduce((sum, r) => sum + Number(r.quantity), 0), total_price: records.reduce((sum, r) => sum + Number(r.total_price), 0) / 100 });
    }
    const { page, context } = await login(browser, "prd_cp", "/products/reports");
    await expect(page.getByRole("table")).toContainText(f.products[0].name);
    await page.getByRole("button", { name: "Filter", exact: true }).click();
    await choose(page, "product_id", new RegExp(f.products[0].name));
    await expect(page.getByRole("table")).not.toContainText(f.products[1].name);
    await expect(page.getByRole("table")).toContainText(f.products[0].name);
    if (mode === "out") {
      await page.getByRole("button", { name: "Filter", exact: true }).click();
      await page.getByRole("button", { name: "Product Out", exact: true }).click();
      await expect(page.getByRole("table")).toContainText(f.products[1].name);
    }
    await page.reload();
    await expect(page.getByRole("table")).toContainText(f.products[0].name);
    await context.close();
  });
}

test("FT051-03-d issued serials cannot be issued twice and mismatched lots leave stock unchanged", async ({ request }) => {
  const headers = await auth(request);
  const product = await createProduct(request, headers, "Serial availability sentinel", 1);
  expect((await stockIn(request, headers, product.product_id, 2, ["ISSUE-A", "ISSUE-B"])).status()).toBe(200);
  const incoming = await lot(request, headers, product.id);
  let snapshot = await state(request);
  const serial = snapshot.product_serials.find((r) => r.serial_number === "ISSUE-A");
  expect(serial).toBeTruthy();
  const payload = outPayload({ product_id: product.product_id, productin_id: incoming.productin_id }, 1);
  const data = { ...payload, product: [{ ...payload.product[0], serial: [serial?.id] }] };
  expect((await request.post(api("products-out"), { headers, data })).status()).toBe(200);
  expect((await request.post(api("products-out"), { headers, data })).status()).toBe(422);
  const other = await createProduct(request, headers, "Mismatched product sentinel");
  expect((await request.post(api("products-out"), { headers, data: outPayload({ product_id: other.product_id, productin_id: incoming.productin_id }, 1) })).status()).toBe(422);
  snapshot = await state(request);
  expect(snapshot.product_ins.find((r) => r.id === incoming.productin_id)).toMatchObject({ quantity_remaining: 1 });
  expect(snapshot.product_outs.filter((r) => r.product_id === product.product_id)).toHaveLength(1);
});

test("FT051-02-b invoice request preserves the approved base-price minus discount calculation", async ({ request }) => {
  const headers = await auth(request);
  const product = await createProduct(request, headers, "Invoice calculation sentinel");
  expect((await stockIn(request, headers, product.product_id, 3)).status()).toBe(200);
  const incoming = await lot(request, headers, product.id);
  const f = environment().fixtures.prd_cp;
  const payload = outPayload({ product_id: product.product_id, productin_id: incoming.productin_id }, 2);
  const data = { ...payload, client_id: f.client, create_invoice: 1,
    product: [{ ...payload.product[0], vat: 10, discount: 20, total_price: 310 }] };
  expect((await request.post(api("products-out"), { headers, data })).status()).toBe(200);
  const snapshot = await state(request);
  const invoices = snapshot.queuedInvoices.filter((r) => r.client_id === f.client && (r.lines as { description: string }[]).some((line) => line.description === product.name));
  expect(invoices).toHaveLength(1);
  expect(invoices[0]).toMatchObject({ total_amount: 300, after_discount_amount: 280, line_total_discount: 20 });
  expect(snapshot.product_ins.find((r) => r.id === incoming.productin_id)).toMatchObject({ quantity_remaining: 1 });
});

test("FT051-03-e failed multi-line stock-out rolls back earlier rows and retains unrelated sentinels", async ({ request }) => {
  const headers = await auth(request);
  const product = await createProduct(request, headers, "Atomic rollback sentinel");
  expect((await stockIn(request, headers, product.product_id, 3)).status()).toBe(200);
  const incoming = await lot(request, headers, product.id);
  const payload = outPayload({ product_id: product.product_id, productin_id: incoming.productin_id }, 2);
  const data = { ...payload, product: [payload.product[0], payload.product[0]] };
  expect((await request.post(api("products-out"), { headers, data })).status()).toBe(405);
  const snapshot = await state(request);
  expect(snapshot.product_outs.filter((r) => r.product_id === product.product_id)).toHaveLength(0);
  expect(snapshot.product_ins.find((r) => r.id === incoming.productin_id)).toMatchObject({ quantity_remaining: 3 });
  expect(snapshot.products.some((r) => r.name === environment().fixtures.prd_mk.products[0].name)).toBe(true);
});

test("FT051-07-delete product deletion permits unused products and preserves products with stock history", async ({ request }) => {
  const headers = await auth(request);
  const unused = await createProduct(request, headers, "Disposable empty product");
  expect((await request.delete(api(`products/${unused.id}`), { headers })).status()).toBe(200);
  expect((await request.get(api(`products/${unused.id}`), { headers })).status()).toBe(404);
  const stock = environment().fixtures.prd_cp.products[0];
  expect((await request.delete(api(`products/${stock.uuid}`), { headers })).status()).toBe(409);
  expect((await request.get(api(`products/${stock.uuid}`), { headers })).status()).toBe(200);
});

test("FT051-08-12 delayed save blocks repeat submission and creates one product", async ({ browser, request }) => {
  const { page, context } = await login(browser);
  await page.getByRole("button", { name: "Add Product", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Add Product", exact: true });
  await dialog.getByRole("button", { name: "Save", exact: true }).click();
  await expect(dialog.getByText("Name is required", { exact: true })).toBeVisible();
  await dialog.locator("#name").fill("Single-submit product");
  await choose(page, "unit_type_id", "Product Test Pieces");
  await choose(page, "product_category_id", "product test hardware");
  await control(request, { path: "/api/v1/products", method: "POST", hold: true });
  await dialog.getByRole("button", { name: "Save", exact: true }).click();
  await expect.poll(async () => (await control(request)).hits).toBe(1);
  await expect(dialog.getByRole("button", { name: "Save", exact: true })).toBeDisabled();
  await dialog.locator("#name").press("Enter");
  expect((await control(request)).hits).toBe(1);
  await control(request, { release: true });
  await expect(dialog).toBeHidden();
  const headers = await auth(request);
  const result = await request.get(api("products?any=Single-submit%20product"), { headers });
  expect((await result.json()).data.data).toHaveLength(1);
  await context.close();
});

test("FT051-10-12 logout and restricted login on the same host cannot restore write controls", async ({ browser }) => {
  const { page, context } = await login(browser);
  await expect(page.getByRole("button", { name: "Add Product", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "User menu", exact: false }).click();
  await page.getByText("Sign out", { exact: true }).click();
  await expect(page).toHaveURL(`${origin("prd_cp")}/admin`);
  await page.getByRole("textbox", { name: "Username" }).fill("prd_reader");
  await page.locator("#password").fill(environment().password);
  await page.request.get("/api/auth/csrf");
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await expect(page).not.toHaveURL(/\/admin/);
  const session = await (await page.request.get("/api/auth/session")).json();
  expect(session.user.name).toBe("prd reader");
  await page.goto("/products");
  await expect(row(page, environment().fixtures.prd_cp.products[0].name)).toBeVisible();
  await expect(page.getByRole("button", { name: "Add Product", exact: true })).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("button", { name: "Add Product", exact: true })).toHaveCount(0);
  await page.goBack();
  await expect(page.getByRole("button", { name: "Add Product", exact: true })).toHaveCount(0);
  await context.close();
});

test("FT051-13 mobile keyboard English Bangla and light dark keep product forms usable", async ({ browser }, testInfo) => {
  const { page, context } = await login(browser);
  await page.setViewportSize({ width: 393, height: 852 });
  const add = page.getByRole("button", { name: "Add Product", exact: true });
  await add.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Add Product", exact: true });
  await expect(dialog.locator("#name")).toBeFocused();
  const bounds = await dialog.boundingBox();
  expect(bounds?.x).toBeGreaterThanOrEqual(0);
  expect((bounds?.x ?? 0) + (bounds?.width ?? 0)).toBeLessThanOrEqual(393);
  await page.screenshot({ path: testInfo.outputPath("mobile-english-light.png"), fullPage: true, animations: "disabled" });
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await context.addCookies([{ name: "themeMode", value: "dark", url: origin("prd_cp") }]);
  await page.reload();
  await page.getByRole("radio", { name: "Bangla", exact: true }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.getByRole("button", { name: "প্রোডাক্ট যোগ করুন", exact: true }).click();
  const bnDialog = page.getByRole("dialog", { name: "প্রোডাক্ট যোগ করুন", exact: true });
  await expect(bnDialog.getByPlaceholder("প্রোডাক্ট নাম", { exact: true })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("mobile-bangla-dark.png"), fullPage: true, animations: "disabled" });
  await context.close();
});

for (const actor of ["prd_reader", "prd_denied"]) {
  for (const operation of ["edit", "delete", "stock-in-read", "stock-out-read", "stock-in-report", "stock-out-report"]) {
    test(`FT051-09-${actor}-${operation} denies the direct API capability`, async ({ request }) => {
      const headers = await auth(request, actor);
      const uuid = environment().fixtures.prd_cp.products[0].uuid;
      const routes: Record<string, string> = { "stock-in-read": `products-in/${uuid}`, "stock-out-read": `products-out/${uuid}`,
        "stock-in-report": "products-in/reports", "stock-out-report": "products-out/reports" };
      const response = operation === "edit" ? await request.put(api(`products/${uuid}`), { headers, data: {} })
        : operation === "delete" ? await request.delete(api(`products/${uuid}`), { headers })
        : await request.get(api(routes[operation]), { headers });
      expect(response.status()).toBe(403);
    });
  }
}

test("FT051-09-anonymous unauthenticated product and movement routes require authentication", async ({ request }) => {
  const uuid = environment().fixtures.prd_cp.products[0].uuid;
  for (const path of ["products", `products/${uuid}`, `products-in/${uuid}`, `products-out/${uuid}`, "products-in/reports", "products-out/reports"]) {
    expect((await request.get(api(path), { headers: { Accept: "application/json" } })).status()).toBe(401);
  }
});

test("FT051-09-out-only report reader opens only the permitted stock-out report", async ({ browser }) => {
  const { page, context } = await login(browser, "prd_out_reader", "/products/reports");
  await expect(page.getByRole("table")).toContainText(environment().fixtures.prd_cp.products[0].name);
  await expect(page.getByRole("button", { name: "Product In", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Product Out", exact: true })).toBeVisible();
  await context.close();
});

test("FT051-08-server failed save preserves the draft and retry creates one record", async ({ browser, request }) => {
  const { page, context } = await login(browser);
  await page.getByRole("button", { name: "Add Product", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Add Product", exact: true });
  await dialog.locator("#name").fill("Recoverable save product");
  await choose(page, "unit_type_id", "Product Test Pieces");
  await choose(page, "product_category_id", "product test hardware");
  await control(request, { path: "/api/v1/products", method: "POST", failures: 1 });
  await dialog.getByRole("button", { name: "Save", exact: true }).click();
  await expect.poll(async () => (await control(request)).hits).toBe(1);
  await expect(dialog.getByRole("button", { name: "Save", exact: true })).toBeEnabled();
  await expect(dialog.locator("#name")).toHaveValue("Recoverable save product");
  const headers = await auth(request);
  let result = await request.get(api("products?any=Recoverable%20save%20product"), { headers });
  expect((await result.json()).data.data).toHaveLength(0);
  await control(request, {});
  await dialog.getByRole("button", { name: "Save", exact: true }).click();
  await expect(dialog).toBeHidden();
  result = await request.get(api("products?any=Recoverable%20save%20product"), { headers });
  expect((await result.json()).data.data).toHaveLength(1);
  await context.close();
});

for (const mode of ["in", "out"]) {
  test(`FT051-05-${mode}-dates inclusive local-date boundaries retain exact fixture totals`, async ({ request }) => {
    const headers = await auth(request);
    const date = mode === "in" ? "2026-11-01" : "2026-11-05";
    const field = mode === "in" ? "purchase_date" : "out_date";
    const result = await request.get(api(`products-${mode}/reports?${field}=${date},${date}`), { headers });
    expect(result.status()).toBe(200);
    const data = (await result.json()).data;
    expect(data.data.map((r: { product: { id: number } }) => r.product.id).sort()).toEqual(environment().fixtures.prd_cp.products.map((r) => r.id).sort());
    expect(data.reports).toEqual({ quantity: mode === "in" ? 20 : 4, total_price: mode === "in" ? 2000 : 600 });
    const empty = await request.get(api(`products-${mode}/reports?${field}=2026-10-01,2026-10-02`), { headers });
    expect((await empty.json()).data.data).toEqual([]);
  });
}

test("FT051-06-size product page size persists and reload returns the exact requested row count", async ({ browser, request }) => {
  const { page, context } = await login(browser);
  await page.locator("#results-per-page").click();
  await page.getByRole("option", { name: "5 / page", exact: true }).click();
  await expect(page.getByRole("row")).toHaveCount(6);
  const headers = await auth(request);
  let result = await request.get(api("products"), { headers });
  expect((await result.json()).data.pagination.per_page).toBe(5);
  await page.reload();
  await expect(page.getByRole("row")).toHaveCount(6);
  await expect(page.locator("#results-per-page")).toContainText("5 / page");
  await page.locator("#results-per-page").click();
  await page.getByRole("option", { name: "10 / page", exact: true }).click();
  await expect(page.getByRole("row")).toHaveCount(11);
  result = await request.get(api("products"), { headers });
  expect((await result.json()).data.pagination.per_page).toBe(10);
  await context.close();
});

test("FT051-06-reports full-filter totals remain exact across report pages", async ({ browser, request }) => {
  const headers = await auth(request);
  const product = await createProduct(request, headers, "Multi-page report product");
  for (let n = 0; n < 12; n++) expect((await stockIn(request, headers, product.product_id, 2)).status()).toBe(200);
  for (const [pageNumber, count] of [[1, 10], [2, 2]]) {
    const response = await request.get(api(`products-in/reports?product_id=${product.product_id}&page=${pageNumber}`), { headers });
    const data = (await response.json()).data;
    expect(data.pagination.total).toBe(12);
    expect(data.data).toHaveLength(count);
    expect(data.reports).toEqual({ quantity: 24, total_price: 2400 });
  }
  const { page, context } = await login(browser, "prd_cp", "/products/reports");
  await expect(page.getByRole("table")).toContainText(product.name);
  await page.getByRole("button", { name: "Filter", exact: true }).click();
  await choose(page, "product_id", new RegExp(product.name));
  await expect(page.getByRole("row")).toHaveCount(11);
  await expect(page.getByText("৳2,400", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Go to next page", exact: true }).click();
  await expect(page.getByRole("row")).toHaveCount(3);
  await expect(page.getByText("৳2,400", { exact: true })).toBeVisible();
  await context.close();
});

test("FT051-11-background failed background refresh preserves loaded rows and retry recovers", async ({ browser, request }) => {
  const headers = await auth(request);
  const product = await createProduct(request, headers, "Background error sentinel");
  const { page, context } = await login(browser);
  await page.getByRole("button", { name: "Filter", exact: true }).click();
  await page.getByPlaceholder("Search by product ID, name, or description").fill(product.name);
  const target = row(page, product.name);
  await expect(target).toBeVisible();
  const before = await page.getByRole("table").boundingBox();
  await target.getByRole("button", { name: "Edit Product", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Edit Product", exact: true });
  await expect(dialog.locator("#name")).toHaveValue(product.name);
  await dialog.locator("#description").fill("Preserve rows on refresh failure");
  await control(request, { path: "/api/v1/products?", failures: 3 });
  await dialog.getByRole("button", { name: "Save", exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByText("Products could not be loaded. Please try again.", { exact: true })).toBeVisible();
  await expect(target).toBeVisible();
  expect((await page.getByRole("table").boundingBox())?.y).toBe(before?.y);
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(page.getByText("Products could not be loaded. Please try again.", { exact: true })).toHaveCount(0);
  await expect(target).toBeVisible();
  await context.close();
});
