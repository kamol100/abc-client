import { test, expect, invoices, sample } from "@/tests/e2e/invoices/fixtures";
import { authenticate } from "@/tests/e2e/clients/fixtures";

for (const path of ["/invoices", "/invoices/create", "/invoices/edit/00000000-0000-0000-0000-000000000001", "/invoices/client/00000000-0000-0000-0000-000000000001"]) {
  // লগইন ছাড়া ইনভয়েস পেজ খুললে একই টেন্যান্টের স্টাফ লগইনে পাঠায় কি না যাচাই করি।
  test(`IV-A01 Invoice page access - ${path.includes('/edit/') ? 'Edit invoice' : path.endsWith('/create') ? 'Create invoice' : path.includes('/client/') ? 'Client invoice history' : 'Invoice list'}: redirect signed-out users to staff login`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, storageState: { cookies: [], origins: [] } });
    try {
      const page = await context.newPage();
      await page.goto(path);
      await expect(page).toHaveURL(url => url.origin === baseURL && url.pathname === "/admin" && url.searchParams.get("callbackUrl") === path);
      await expect(page.locator("#username")).toBeVisible();
    } finally { await context.close(); }
  });
}

// CP ও MK অন্য কোম্পানির ইনভয়েস বিস্তারিত বা ট্র্যাক আইডি দিয়ে খুঁজে পায় না কি না দেখি।
test("IV-A03 Invoice privacy: prevent CP and MK from reading or searching each other's invoices", async ({ browser, staff }) => {
  const other = await authenticate(browser, staff.tenant === "cp" ? "mk" : "cp");
  try {
    const own = await sample(staff);
    const foreign = await sample(other);
    expect(own.id).not.toBe(foreign.id);
    for (const [actor, target] of [[staff, foreign], [other, own]] as const) {
      const response = await actor.call(`invoices/${target.id}`);
      expect([403, 404]).toContain(response.status);
      const found = await invoices(actor, `track_id=${encodeURIComponent(target.trackID)}`);
      expect(found.data.some(i => i.id === target.id)).toBe(false);
    }
  } finally { await other.dispose(); }
});
