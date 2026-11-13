import {
  authenticate,
  expect,
  openRowMenu,
  requirePermissions,
  resellerRow,
  resellers,
  test,
} from "@/tests/e2e/resellers/fixtures";

const UNKNOWN = "00000000-0000-4000-8000-000000000001";

for (const path of ["/resellers", "/resellers/create", `/resellers/edit/${UNKNOWN}`, `/resellers/view/${UNKNOWN}`]) {
  test(`RS-A01 anonymous ${path} redirects to the same-host staff login`, async ({ browser, baseURL }) => {
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

test("RS-A03 another company cannot read or find a known reseller UUID", async ({ browser, page, staff }) => {
  const other = await authenticate(browser, staff.tenant === "cp" ? "mk" : "cp");
  try {
    const ownList = await resellers(staff);
    const foreignList = await resellers(other);
    const pairs = [
      [staff, foreignList.data[0]],
      [other, ownList.data[0]],
    ] as const;
    expect(ownList.data.length + foreignList.data.length).toBeGreaterThan(0);
    for (const [actor, target] of pairs) {
      if (!target) continue;
      const shown = await actor.call(`resellers/${target.id}`);
      expect([403, 404]).toContain(shown.status);
      expect(JSON.stringify(shown.body ?? {})).not.toContain(target.id);
      const found = await resellers(actor, `name=${encodeURIComponent(target.name)}`);
      expect(found.data.some((row) => row.id === target.id)).toBe(false);
    }
    if (foreignList.data[0]) {
      await page.goto(`/resellers/view/${foreignList.data[0].id}`);
      await expect(page.getByRole("heading", { name: "Profile Information" })).toHaveCount(0);
      await expect(page.getByText(foreignList.data[0].name, { exact: true })).toHaveCount(0);
    }
    if (ownList.data[0]) {
      const context = await browser.newContext({
        baseURL: other.baseURL,
        storageState: other.state,
        locale: "en-US",
        serviceWorkers: "block",
      });
      try {
        const foreignPage = await context.newPage();
        await foreignPage.goto(`/resellers/view/${ownList.data[0].id}`);
        await expect(foreignPage.getByRole("heading", { name: "Profile Information" })).toHaveCount(0);
        await expect(foreignPage.getByText(ownList.data[0].name, { exact: true })).toHaveCount(0);
      } finally {
        await context.close();
      }
    }
  } finally {
    await other.dispose();
  }
});

test("RS-A06 switching to an admin-role reseller is denied and the staff list stays in place", async ({ page, staff }) => {
  requirePermissions(staff, "impersonate.start", "resellers.access");
  const reseller = (await resellers(staff)).data.find((row) => row.user?.uuid);
  if (!reseller?.user?.uuid) throw new Error("Switch denial needs a reseller linked to a user.");
  const before = await resellers(staff);
  await page.goto("/resellers");
  await openRowMenu(page, reseller);
  await page.getByRole("menuitem", { name: "Switch to reseller" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Cannot impersonate an Admin or Super Admin." }).first()).toBeVisible();
  await expect(page.getByText("Impersonating", { exact: true })).toHaveCount(0);
  await expect(page).toHaveURL(/\/resellers$/);
  const after = await resellers(staff);
  expect(after.data.map((row) => row.id)).toEqual(before.data.map((row) => row.id));
  await page.evaluate(() => {
    document.querySelectorAll("nextjs-portal").forEach((node) => node.remove());
    const table = document.querySelector("table");
    let node = table?.parentElement ?? null;
    while (node) {
      node.removeAttribute("aria-hidden");
      node.removeAttribute("inert");
      node = node.parentElement;
    }
  });
  await expect(resellerRow(page, reseller)).toBeVisible();
});

test("RS-A06 a reseller without a linked user does not offer scope switching", async ({ page, staff }) => {
  requirePermissions(staff, "resellers.access");
  const listed = await resellers(staff);
  const missingUser = listed.data.find((row) => !row.user?.uuid);
  const linked = listed.data.find((row) => row.user?.uuid);
  await page.goto("/resellers");
  if (missingUser) {
    await openRowMenu(page, missingUser);
    await expect(page.getByRole("menuitem", { name: "Switch to reseller" })).toHaveCount(0);
    await page.keyboard.press("Escape");
  }
  if (!linked) throw new Error("Switch-scope visibility needs one reseller with a linked user on the first page.");
  if (!staff.profile.permissions.includes("impersonate.start")) {
    await openRowMenu(page, linked);
    await expect(page.getByRole("menuitem", { name: "Switch to reseller" })).toHaveCount(0);
    return;
  }
  if (!missingUser) {
    await openRowMenu(page, linked);
    await expect(page.getByRole("menuitem", { name: "Switch to reseller" })).toBeVisible();
  }
});
