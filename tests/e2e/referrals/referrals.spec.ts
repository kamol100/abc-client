import { expect, test, type APIRequestContext, type Browser, type BrowserContext, type Locator, type Page } from "@playwright/test";

type Persona = { uuid: string; host: string };
type LedgerRow = { uuid: string; prospect_name: string; status: string; commission_amount_minor: number | null; demo_request_id?: number };

function environment() {
  const { RF_E2E_ACCOUNTS, RF_E2E_PASSWORD, RF_E2E_PORT, RF_E2E_API } = process.env;
  if (!RF_E2E_ACCOUNTS || !RF_E2E_PASSWORD || !RF_E2E_PORT || !RF_E2E_API) {
    throw new Error("Start the disposable fixture with npm run test:e2e:referrals.");
  }
  return {
    accounts: JSON.parse(RF_E2E_ACCOUNTS) as Record<string, Persona>,
    password: RF_E2E_PASSWORD,
    port: RF_E2E_PORT,
    api: RF_E2E_API,
  };
}

function origin(account: string) {
  const { accounts, port } = environment();
  const host = accounts[account]?.host;
  if (!["app.isp.test", "cp.isp.test", "mk.isp.test"].includes(host)) throw new Error("Unregistered referral fixture host.");
  return `http://${host}:${port}`;
}

const browserSettings = { locale: "en-US", timezoneId: "Asia/Dhaka", serviceWorkers: "block" as const };

const referralRow = (page: Page, name: string) => page.getByRole("row").filter({ hasText: name });
const field = (scope: Locator, id: string) => scope.locator(`[id="${id}"]`);
const save = (dialog: Locator) => dialog.getByRole("button", { name: "Save", exact: true });

async function choose(page: Page, control: Locator, label: string) {
  await control.click();
  await page.getByRole("option", { name: label, exact: true, includeHidden: true }).click();
}

async function login(browser: Browser, account: string, target: string) {
  const context = await browser.newContext({ ...browserSettings, baseURL: origin(account) });
  const page = await context.newPage();
  await loginOnPage(page, account, target);
  return { context, page };
}

async function loginOnPage(page: Page, account: string, target: string) {
  await page.goto(`/admin?callbackUrl=${encodeURIComponent(target)}`);
  await page.getByRole("textbox", { name: "Username" }).fill(account);
  await page.locator("#password").fill(environment().password);
  // Give Auth.js a CSRF cookie on this exact origin before the first cold-start form callback.
  const csrf = await page.request.get("/api/auth/csrf");
  expect(csrf.status()).toBe(200);
  expect(typeof (await csrf.json()).csrfToken).toBe("string");
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await expect(page).toHaveURL(`${origin(account)}${target}`);
  const session = await (await page.request.get("/api/auth/session")).json();
  expect(session.user.name).toBe(account.replace("_", " "));
}

async function auth(request: APIRequestContext, account: string) {
  const { api, accounts, password } = environment();
  const response = await request.post(`${api}/api/v1/auth/login`, {
    data: { host: accounts[account].host, username: account, password },
  });
  expect(response.status()).toBe(200);
  const headers = { Accept: "application/json", Authorization: `Bearer ${(await response.json()).token}` };
  const settings = await request.get(`${api}/api/v1/user-settings`, { headers });
  expect(settings.status()).toBe(200);
  return headers;
}

async function ledger(request: APIRequestContext, headers: Record<string, string>, name: string): Promise<LedgerRow> {
  const response = await request.get(`${environment().api}/api/v1/platform-referrals`, { headers });
  expect(response.status()).toBe(200);
  const rows = (await response.json()).data.data as LedgerRow[];
  const row = rows.find((entry) => entry.prospect_name === name);
  if (!row) throw new Error(`Referral is missing from the platform ledger: ${name}`);
  return row;
}

async function enroll(page: Page, account: string, type: string, code: string) {
  await page.getByRole("button", { name: "Enroll seller", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Enroll seller" });
  await field(dialog, "user_uuid").fill(environment().accounts[account].uuid);
  await choose(page, dialog.getByRole("combobox"), type);
  await field(dialog, "code").fill(code);
  await save(dialog).click();
  await expect(dialog).toBeHidden();
  await expect(referralRow(page, code)).toContainText(type);
}

async function contract(page: Page, code: string, terms: "Fixed" | "Percentage", amount: string, dayOffset = 0) {
  await referralRow(page, code).getByRole("button", { name: "Add contract" }).click();
  const dialog = page.getByRole("dialog", { name: "Add contract" });
  await dialog.getByRole("radio", { name: terms, exact: true }).click();
  const amountField = field(dialog, terms === "Fixed" ? "fixed_amount_minor" : "rate_bps");
  await amountField.fill(terms === "Fixed" ? "0" : "101");
  await field(dialog, "effective_at").click();
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  const dateKey = date.toLocaleDateString("en-US", { timeZone: "Asia/Dhaka" });
  const calendarDay = page.locator(`td:not([data-outside]) button[data-day="${dateKey}"]`);
  if (dayOffset < 0 && !(await calendarDay.count())) {
    await page.getByRole("button", { name: /previous month/i }).click();
  }
  await calendarDay.click();
  await save(dialog).click();
  await expect(dialog.getByText(terms === "Fixed" ? /positive BDT amount/ : /up to 100/)).toBeVisible();
  await amountField.fill(amount);
  await save(dialog).click();
  await expect(dialog).toBeHidden();
}

async function fillDemo(page: Page, name: string) {
  await page.getByLabel(/full name/i).fill("Referral Test Contact");
  await page.getByLabel(/ISP name/i).fill(name);
  await page.getByLabel(/^phone/i).fill("01711111111");
  await page.getByLabel(/^whatsapp/i).fill("01811111111");
  await page.getByRole("checkbox").check();
}

async function approve(page: Page, name: string, expected: string) {
  await referralRow(page, name).getByRole("button", { name: "Approve sale" }).click();
  const dialog = page.getByRole("dialog", { name: "Approve sale" });
  await field(dialog, "approved_sale_minor").fill("20000");
  await expect(dialog.getByText(/Commission to release/)).toContainText(expected);
  await save(dialog).click();
  await expect(dialog).toBeHidden();
  await expect(referralRow(page, name)).toContainText("Payable");
}

async function createCompany(page: Page, prospect: string, suffix: string) {
  await referralRow(page, prospect).getByRole("button", { name: "Create company" }).click();
  const dialog = page.getByRole("dialog");
  await field(dialog, "phone").fill("01711111111");
  await field(dialog, "domain").fill(`${suffix}.referral.example.test`);
  await choose(page, field(dialog, "subscription_plan_id"), "Referral acceptance plan");
  await field(dialog, "username").fill(`rf_buyer_${suffix}`);
  await field(dialog, "password").fill(environment().password);
  await field(dialog, "confirm").fill(environment().password);
  await save(dialog).click();
  await expect(dialog).toBeHidden();
}

test.describe.serial("disposable ISP referral acceptance", () => {
  let admin: Page;
  let seller: Page;
  let approver: Page;
  let finance: Page;
  let reseller: Page;
  const contexts: BrowserContext[] = [];
  const publicSale = "RF RiverNet Broadband";
  const directSale = "RF Fixed Link";
  const transfer = "RF-PAYOUT-2626";
  let payoutDate: string;

  test.afterAll(async () => {
    await Promise.all(contexts.map((context) => context.close()));
  });

  // তিন ধরনের সেলার এনরোল করে প্রত্যেকের আলাদা লগইন ও পরিচয় যাচাই করি।
  test("RF-008-E01 Seller enrollment: register tenant, reseller, and independent sellers with separate logins", async ({ browser }) => {
    const adminSession = await login(browser, "rf_admin", "/platform-referral-sellers");
    contexts.push(adminSession.context);
    admin = adminSession.page;
    await expect(admin.getByRole("heading", { name: "Referral sellers" })).toBeVisible();
    await expect(admin.getByRole("cell", { name: "No results" })).toBeVisible();

    await enroll(admin, "rf_manager", "Tenant manager", "RF-MANAGER");
    await enroll(admin, "rf_reseller", "Reseller representative", "RF-RESELLER");
    await enroll(admin, "rf_independent", "Independent seller", "RF-INDEPENDENT");
    await enroll(admin, "rf_peer", "Reseller representative", "RF-PEER");
    await admin.getByRole("button", { name: "Enroll seller", exact: true }).click();
    const duplicate = admin.getByRole("dialog", { name: "Enroll seller" });
    await field(duplicate, "user_uuid").fill(environment().accounts.rf_foreign.uuid);
    await choose(admin, duplicate.getByRole("combobox"), "Tenant manager");
    await field(duplicate, "code").fill("RF-MANAGER");
    await save(duplicate).click();
    await expect(duplicate.getByText(/code has already been taken/i)).toBeVisible();
    await duplicate.getByRole("button", { name: "Cancel" }).click();

    await contract(admin, "RF-MANAGER", "Percentage", "10");
    await contract(admin, "RF-RESELLER", "Fixed", "1500", -1);
    await contract(admin, "RF-INDEPENDENT", "Fixed", "1000");
    await contract(admin, "RF-PEER", "Fixed", "900");

    for (const [account, code] of [["rf_manager", "RF-MANAGER"], ["rf_reseller", "RF-RESELLER"], ["rf_independent", "RF-INDEPENDENT"]]) {
      const session = await login(browser, account, "/referrals");
      contexts.push(session.context);
      await expect(session.page.getByRole("heading", { name: "My referrals" })).toBeVisible();
      await expect(session.page.getByRole("link", { name: `/demo-request?ref=${code}`, exact: true })).toBeVisible();
      if (account === "rf_manager") seller = session.page;
      if (account === "rf_reseller") reseller = session.page;
    }
  });

  // ডেমো রেফারেল থেকে কমিশন অপেক্ষমাণ, পাওনাযোগ্য ও পরিশোধিত হওয়ার পুরো ধাপ যাচাই করি।
  test("RF-008-E02 Referral commission: move a demo sale from Pending to Payable to Paid", async ({ browser, request }, testInfo) => {
    const publicContext = await browser.newContext({ ...browserSettings, baseURL: origin("rf_manager") });
    contexts.push(publicContext);
    await publicContext.addCookies([{ name: "lang", value: "en", url: origin("rf_manager") }]);
    const visitor = await publicContext.newPage();
    const href = await seller.getByRole("link", { name: "/demo-request?ref=RF-MANAGER", exact: true }).getAttribute("href");
    if (!href) throw new Error("Missing seller referral URL.");
    await visitor.goto(href);
    await expect(visitor.getByLabel(/referral code/i)).toHaveValue("RF-MANAGER");
    await fillDemo(visitor, publicSale);
    const postedDemo = visitor.waitForRequest((entry) => entry.method() === "POST" && entry.url().endsWith("/api/v1/demo-request"));
    await visitor.getByRole("button", { name: "Submit your request" }).click();
    expect((await postedDemo).postDataJSON()).toMatchObject({ isp_name: publicSale, referral_code: "RF-MANAGER" });
    await expect(visitor.getByRole("heading", { name: "You are all set" })).toBeVisible();

    await seller.reload();
    await expect(referralRow(seller, publicSale)).toContainText("Pending");
    await expect(referralRow(seller, publicSale)).toContainText("TBD");

    await admin.goto("/demo-requests");
    await referralRow(admin, publicSale).getByRole("button", { name: "Edit demo request" }).click();
    const demo = admin.getByRole("dialog", { name: "Edit demo request" });
    await choose(admin, demo.getByRole("combobox"), "Approved");
    await field(demo, "website").fill("river.referral.example.test");
    await field(demo, "username").fill("rf_river_buyer");
    await field(demo, "password").fill(environment().password);
    await save(demo).click();
    await expect(demo).toBeHidden();

    await seller.reload();
    await expect(referralRow(seller, publicSale)).toContainText("Pending");

    const approverSession = await login(browser, "rf_approver", "/platform-referrals");
    contexts.push(approverSession.context);
    approver = approverSession.page;
    await approve(approver, publicSale, "2,000");
    await seller.reload();
    await expect(referralRow(seller, publicSale)).toContainText("Payable");
    await expect(seller.locator('[data-referral-total="payable"]')).toContainText("2,000");

    const financeSession = await login(browser, "rf_finance", "/platform-referrals");
    contexts.push(financeSession.context);
    finance = financeSession.page;
    await expect(referralRow(finance, publicSale).getByRole("button", { name: "Reject referral" })).toHaveCount(0);
    await referralRow(finance, publicSale).getByRole("button", { name: "Record payout" }).click();
    const payout = finance.getByRole("dialog", { name: "Record payout" });
    await choose(finance, payout.getByRole("combobox"), "Bank transfer");
    await field(payout, "transfer_reference").fill(transfer);
    const payload = finance.waitForRequest((entry) => entry.method() === "POST" && entry.postData()?.includes(transfer) === true);
    await save(payout).click();
    payoutDate = (await payload).postData()?.match(/\d{4}-\d{2}-\d{2}T[\d:.]+Z/)?.[0] ?? "";
    await expect(payout).toBeHidden();
    await expect(referralRow(finance, publicSale)).toContainText("Paid");

    await seller.reload();
    await expect(referralRow(seller, publicSale)).toContainText("Paid");
    await expect(seller.locator('[data-referral-total="paid"]')).toContainText("2,000");
    await expect(seller.locator('[data-referral-total="payable"]')).toContainText("0");
    await referralRow(seller, publicSale).getByRole("button", { name: "Referral details" }).click();
    const details = seller.getByRole("dialog", { name: "Referral details" });
    await expect(details).toContainText(transfer);
    await seller.keyboard.press("Escape");
    await expect(details).toBeHidden();
    await seller.screenshot({ path: testInfo.outputPath("seller-paid-desktop.png") });

    const headers = await auth(request, "rf_admin");
    const current = await ledger(request, headers, publicSale);
    expect(current).toMatchObject({ status: "paid", commission_amount_minor: 200000 });
  });

  // নির্ধারিত কমিশনের শর্ত থাকে এবং বাতিল রেফারেল আয়ের হিসাবে আসে না কি না দেখি।
  test("RF-008-E03 Referral contract: retain fixed commission terms and exclude rejected referrals from earnings", async ({ request }) => {
    await reseller.getByRole("button", { name: "Add referral" }).click();
    const add = reseller.getByRole("dialog", { name: "Add referral" });
    await field(add, "prospect_name").fill(directSale);
    const requestPromise = reseller.waitForRequest((entry) => entry.method() === "POST" && entry.postData()?.includes(directSale) === true);
    await save(add).click();
    const submission = (await requestPromise).postDataJSON() as unknown[];
    expect(submission[0]).toEqual({ url: "/referrals", method: "POST", data: { prospect_name: directSale } });
    await expect(add).toBeHidden();
    await expect(referralRow(reseller, directSale)).toContainText("1,500");

    await admin.goto("/platform-referral-sellers");
    await contract(admin, "RF-RESELLER", "Fixed", "2500");
    await referralRow(admin, "RF-RESELLER").getByRole("button", { name: "Contract history" }).click();
    const history = admin.getByRole("dialog", { name: "Contract history" });
    await expect(history).toContainText("2,500");
    await expect(history).toContainText("1,500");
    await admin.keyboard.press("Escape");

    await admin.goto("/platform-referrals");
    await createCompany(admin, directSale, "fixed");
    await approve(admin, directSale, "1,500");

    const rejected = "RF Rejected Lead";
    await admin.getByRole("button", { name: "Attribute referral" }).click();
    const attribute = admin.getByRole("dialog", { name: "Attribute referral" });
    await field(attribute, "referral_code").fill("RF-RESELLER");
    await field(attribute, "prospect_name").fill(rejected);
    await save(attribute).click();
    await expect(attribute).toBeHidden();
    await referralRow(admin, rejected).getByRole("button", { name: "Reject referral" }).click();
    const reject = admin.getByRole("dialog", { name: "Reject referral" });
    await field(reject, "decision_note").fill("Prospect withdrew");
    await save(reject).click();
    await expect(reject).toBeHidden();
    await expect(referralRow(admin, rejected)).toContainText("Rejected");
    const headers = await auth(request, "rf_admin");
    expect(await ledger(request, headers, directSale)).toMatchObject({ status: "payable", commission_amount_minor: 150000 });
    expect(await ledger(request, headers, rejected)).toMatchObject({ status: "rejected", commission_amount_minor: null });
  });

  // একই কাজ পুনরায় বা বিরোধপূর্ণভাবে করলেও কমিশন ও ট্রান্সফার একবারই হয় কি না দেখি।
  test("RF-008-E04 Repeated referral actions: create only one earning and transfer despite retries or conflicts", async ({ request }) => {
    const headers = await auth(request, "rf_admin");
    const { api } = environment();
    const row = await ledger(request, headers, publicSale);
    const base = `${api}/api/v1/platform-referrals/${row.uuid}`;
    expect(payoutDate).not.toBe("");
    expect((await request.post(`${base}/approve`, { headers, data: { approved_sale_minor: 2000000 } })).status()).toBe(200);
    expect((await request.post(`${base}/approve`, { headers, data: { approved_sale_minor: 10000 } })).status()).toBe(422);
    const data = { method: "bank", transfer_reference: transfer, paid_at: payoutDate };
    expect((await request.post(`${base}/payout`, { headers, data })).status()).toBe(200);
    expect((await request.post(`${base}/payout`, { headers, data: { ...data, transfer_reference: "RF-CONFLICT" } })).status()).toBe(422);
    expect((await request.post(`${api}/api/v1/platform-referrals`, {
      headers, data: { demo_request_id: row.demo_request_id, referral_code: "RF-OTHER" },
    })).status()).toBe(422);
    await seller.reload();
    await expect(seller.locator('[data-referral-total="paid"]')).toContainText("2,000");
    await expect(referralRow(seller, publicSale)).toHaveCount(1);
  });

  // অনুমতি ছাড়া রেফারেল পেজ, তথ্য ও কমিশনের কাজ ব্যবহার করা যায় না কি না দেখি।
  test("RF-008-E05 Referral permissions: block unauthorized pages, data, and commission actions", async ({ browser, request }) => {
    const adminHeaders = await auth(request, "rf_admin");
    const current = await ledger(request, adminHeaders, publicSale);
    const { api } = environment();
    const anonymous = await browser.newContext({ ...browserSettings, baseURL: origin("rf_admin") });
    contexts.push(anonymous);
    const visitor = await anonymous.newPage();
    await visitor.goto("/platform-referrals");
    await expect(visitor).toHaveURL(/\/admin\?/);
    expect((await request.get(`${api}/api/v1/referrals/${current.uuid}`, { headers: { Accept: "application/json" } })).status()).toBe(401);

    for (const account of ["rf_peer", "rf_independent"]) {
      const session = await login(browser, account, "/referrals");
      contexts.push(session.context);
      const headers = await auth(request, account);
      const detail = await request.get(`${api}/api/v1/referrals/${current.uuid}`, { headers });
      expect(detail.status()).toBe(404);
      expect(await detail.text()).not.toContain(transfer);
      await expect(session.page.locator('[data-referral-total="paid"]')).toContainText("0");
      await expect(referralRow(session.page, publicSale)).toHaveCount(0);
      await session.page.goto("/platform-referrals");
      await expect(session.page.getByText("You do not have access to this referral page.")).toBeVisible();
    }

    for (const account of ["rf_restricted", "rf_foreign"]) {
      const session = await login(browser, account, "/platform-referrals");
      contexts.push(session.context);
      await expect(session.page.getByText("You do not have access to this referral page.")).toBeVisible();
      expect((await request.get(`${api}/api/v1/platform-referrals/${current.uuid}`, { headers: await auth(request, account) })).status()).toBe(403);
    }

    await approver.reload();
    await expect(referralRow(approver, directSale)).toBeVisible();
    await expect(referralRow(approver, directSale).getByRole("button", { name: "Record payout" })).toHaveCount(0);

    await seller.getByRole("button", { name: "User menu" }).click();
    await seller.getByText(/sign out/i).click();
    await expect(seller).toHaveURL(`${origin("rf_manager")}/admin`);
    await loginOnPage(seller, "rf_peer", "/referrals");
    await expect(seller.getByRole("link", { name: "/demo-request?ref=RF-PEER" })).toBeVisible();
    await expect(referralRow(seller, publicSale)).toHaveCount(0);
    await expect(seller.locator('[data-referral-total="paid"]')).toHaveText("৳0");
  });

  // ছোট পর্দা, কিবোর্ড ও বাংলা ডার্ক থিমে ফর্ম চলে এবং সাধারণ ডেমোর ত্রুটি কাটিয়ে ওঠে কি না দেখি।
  test("RF-008-E06 Referral forms: support mobile, keyboard, Bangla dark mode, and demo recovery", async ({ browser }, testInfo) => {
    await reseller.setViewportSize({ width: 390, height: 844 });
    await expect(reseller.getByRole("heading", { name: "My referrals" })).toBeVisible();
    await expect.poll(() => reseller.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    await reseller.reload();
    await expect(referralRow(reseller, directSale)).toBeVisible();
    let heldRequest = false;
    let failFilteredRequest = true;
    let releaseRequest = () => {};
    const paused = new Promise<void>((resolve) => { releaseRequest = resolve; });
    await reseller.route("**/referrals", async (route) => {
      const request = route.request();
      if (!failFilteredRequest || request.method() !== "POST" || !request.postData()?.includes("status=rejected")) {
        await route.continue();
        return;
      }
      heldRequest = true;
      await paused;
      await route.abort("failed");
    });
    const header = reseller.getByRole("heading", { name: "My referrals" });
    const beforeFilter = await header.boundingBox();
    await reseller.getByLabel("Filter by status").selectOption("rejected");
    try {
      await expect.poll(() => heldRequest).toBe(true);
      await expect(referralRow(reseller, directSale)).toBeVisible();
      expect((await header.boundingBox())?.y).toBe(beforeFilter?.y);
    } finally {
      releaseRequest();
    }
    await expect(reseller.getByRole("button", { name: "Retry", exact: true })).toBeVisible();
    failFilteredRequest = false;
    await reseller.getByRole("button", { name: "Retry", exact: true }).click();
    await expect(referralRow(reseller, "RF Rejected Lead")).toBeVisible();
    await expect(referralRow(reseller, directSale)).toHaveCount(0);
    await reseller.unroute("**/referrals");
    const view = referralRow(reseller, "RF Rejected Lead").getByRole("button", { name: "Referral details" });
    const before = await reseller.evaluate(() => window.scrollY);
    await view.focus();
    await reseller.keyboard.press("Enter");
    await expect(reseller.getByRole("dialog")).toBeVisible();
    await reseller.keyboard.press("Escape");
    await expect(view).toBeFocused();
    expect(await reseller.evaluate(() => window.scrollY)).toBe(before);

    await finance.setViewportSize({ width: 390, height: 844 });
    await expect(finance.getByRole("heading", { name: "Referral sales" })).toBeVisible();
    await expect.poll(() => finance.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    await reseller.context().addCookies([
      { name: "lang", value: "bn", url: origin("rf_reseller") },
      { name: "themeMode", value: "dark", url: origin("rf_reseller") },
    ]);
    await reseller.reload();
    await expect(reseller.getByRole("heading", { name: "আমার রেফারেল" })).toBeVisible();
    await expect(reseller.locator("html")).toHaveClass(/dark/);
    await expect(reseller.getByRole("link", { name: "/demo-request?ref=RF-RESELLER" })).toBeVisible();
    await reseller.screenshot({ path: testInfo.outputPath("seller-mobile-bangla-dark.png") });

    const publicContext = await browser.newContext({ ...browserSettings, baseURL: origin("rf_admin") });
    contexts.push(publicContext);
    await publicContext.addCookies([{ name: "lang", value: "en", url: origin("rf_admin") }]);
    const visitor = await publicContext.newPage();
    await visitor.goto("/demo-request?ref=UNKNOWN-RF");
    await fillDemo(visitor, "RF Ordinary Demo");
    await visitor.getByRole("button", { name: "Submit your request" }).click();
    await expect(visitor.getByText(/code is invalid/i)).toBeVisible();
    await visitor.getByLabel(/referral code/i).fill("");
    await visitor.getByRole("button", { name: "Submit your request" }).click();
    await expect(visitor.getByRole("heading", { name: "You are all set" })).toBeVisible();
  });
});
