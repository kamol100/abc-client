import { z } from "zod";
import { backendURL } from "@/tests/e2e/clients/environment";
import {
  authenticate,
  clientIdentity,
  clientQuery,
  expect,
  expectMoney,
  listTemplate,
  openClientList,
  selectTemplate,
  smsClients,
  smsTemplates,
  test,
  walletAvailable,
} from "@/tests/e2e/sms-send/fixtures";

const ROUTES = ["/sms-send", "/sms-send?phone=01700000999"];

for (const path of ROUTES) {
  // ফোন আগে দেওয়া থাকুক বা না থাকুক, লগইন ছাড়া SMS পেজ স্টাফ লগইনে পাঠায় কি না দেখি।
  test(`FT087-09 SMS page ${path.includes('?') ? 'with a prefilled phone' : 'without a prefilled phone'} while signed out: redirect to staff login`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({
      baseURL,
      locale: "en-US",
      serviceWorkers: "block",
      storageState: { cookies: [], origins: [] },
    });
    try {
      const page = await context.newPage();
      await page.goto(path);
      await expect(page).toHaveURL((url) => (
        url.origin === baseURL
        && url.pathname === "/admin"
        && url.searchParams.get("callbackUrl") === path
      ));
      await expect(page.locator("#username")).toBeVisible();
    } finally {
      await context.close();
    }
  });
}

// লগইন ছাড়া SMS-এর সরাসরি API অনুরোধ গ্রহণ করে না কি না যাচাই করি।
test("FT087-09 SMS APIs while signed out: reject requests without authentication", async ({ browser }) => {
  const context = await browser.newContext({ locale: "en-US", serviceWorkers: "block" });
  try {
    const paths = ["sms-clients", "sms-rate", "sms-store/preview", "sms-store"];
    for (const path of paths) {
      const method = path.startsWith("sms-store") ? "POST" : "GET";
      const response = await context.request.fetch(`${backendURL()}${path}`, {
        method,
        data: method === "POST" ? { message: "E2E anonymous", mode: "live" } : undefined,
        headers: { Accept: "application/json" },
      });
      expect(response.status()).toBe(401);
    }
  } finally {
    await context.close();
  }
});

// অন্য কোম্পানির ক্লায়েন্টকে SMS প্রাপক হিসেবে দেখা বা তার কোট নেওয়া যায় না কি না দেখি।
test("FT087-10 SMS recipient privacy: prevent another company from viewing or pricing the client", async ({ browser, page, staff }) => {
  const other = await authenticate(browser, staff.tenant === "mk" ? "vp" : "mk");
  try {
    const ownTemplate = listTemplate(await smsTemplates(staff));
    const foreignTemplate = listTemplate(await smsTemplates(other));
    const ownList = await smsClients(staff, clientQuery(ownTemplate));
    const foreignList = await smsClients(other, clientQuery(foreignTemplate));
    const own = ownList.data.find((row) => (row.pppoe_username ?? "").trim().length >= 3);
    const foreign = foreignList.data.find((row) => (row.pppoe_username ?? "").trim().length >= 3);
    if (!own?.pppoe_username || !foreign?.pppoe_username) {
      throw new Error("Tenant isolation needs a username on the first SMS page of both companies.");
    }
    expect(own.cid).not.toBe(foreign.cid);
    const ownSearch = await smsClients(staff, clientQuery(ownTemplate, `any=${encodeURIComponent(foreign.pppoe_username)}`));
    const foreignSearch = await smsClients(other, clientQuery(foreignTemplate, `any=${encodeURIComponent(own.pppoe_username)}`));
    expect(ownSearch.data.some((row) => row.cid === foreign.cid)).toBe(false);
    expect(foreignSearch.data.some((row) => row.cid === own.cid)).toBe(false);
    const before = await walletAvailable(staff);
    const quoted = await staff.call("sms-store/preview", "POST", {
      sms_template_id: ownTemplate.id,
      message: "E2E foreign",
      custom_message: "E2E foreign",
      sms_body: "E2E foreign",
      clientIds: [foreign.cid],
      all_client: 0,
      mode: "live",
    });
    expect(quoted.status).toBe(200);
    const recipients = z.object({
      data: z.object({ recipients: z.coerce.number() }).passthrough(),
    }).parse(quoted.body).data.recipients;
    expect(recipients).toBe(0);
    expectMoney(await walletAvailable(staff), before);
    await openClientList(page, staff, ownTemplate);
    await page.locator("#any").fill(foreign.pppoe_username);
    await page.locator("form").filter({ has: page.locator("#any") }).locator("button[type=submit]").click();
    await expect(page.getByText(clientIdentity(foreign), { exact: true })).toHaveCount(0);
    await page.reload();
    await selectTemplate(page, ownTemplate);
    await expect(page.getByRole("heading", { name: "Client List", exact: true })).toBeVisible();
    await page.locator("#any").fill(foreign.pppoe_username);
    await page.locator("form").filter({ has: page.locator("#any") }).locator("button[type=submit]").click();
    await expect(page.getByText(clientIdentity(foreign), { exact: true })).toHaveCount(0);
  } finally {
    await other.dispose();
  }
});
