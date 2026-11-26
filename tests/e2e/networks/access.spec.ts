import {
  assertProbeSafe,
  authenticate,
  choices,
  expect,
  networkDetail,
  networkRow,
  networks,
  openNetworks,
  responseContains,
  test,
  type Network,
} from "@/tests/e2e/networks/fixtures";

// লগইন ছাড়া নেটওয়ার্কের তালিকা খুললে একই টেন্যান্টের স্টাফ লগইনে পাঠায় কি না দেখি।
test("NW-A01 Network list while signed out: redirect to staff login on the same tenant", async ({ browser, baseURL }) => {
  const context = await browser.newContext({
    baseURL,
    locale: "en-US",
    serviceWorkers: "block",
    storageState: { cookies: [], origins: [] },
  });
  try {
    const page = await context.newPage();
    await page.goto("/networks");
    await expect(page).toHaveURL((url) => (
      url.origin === baseURL
      && url.pathname === "/admin"
      && url.searchParams.get("callbackUrl") === "/networks"
    ));
    await expect(page.locator("#username")).toBeVisible();
  } finally {
    await context.close();
  }
});

// অন্য কোম্পানির নেটওয়ার্ক পড়া, পরীক্ষা, পরিবর্তন, ডিলিট বা তালিকায় পাওয়া আটকে দেয় কি না দেখি।
test("NW-A04 Network privacy: block another company from reading, probing, changing, or deleting a network", async ({ browser, page, staff }) => {
  const other = await authenticate(browser, staff.tenant === "cp" ? "mk" : "cp");
  try {
    const ownList = await networks(staff);
    const foreignList = await networks(other);
    expect(ownList.data.length).toBeGreaterThan(0);
    expect(foreignList.data.length).toBeGreaterThan(0);
    const foreign = foreignList.data[0];
    const own = ownList.data[0];

    await expectDenied(staff, foreign);
    await expectDenied(other, own);
    expect((await networkDetail(other, foreign.id)).name).toBe(foreign.name);
    expect((await networkDetail(staff, own.id)).name).toBe(own.name);
    assertProbeSafe(foreignList.data);

    const ownOptions = choices(await staff.get("dropdown-networks"));
    const foreignOptions = choices(await other.get("dropdown-networks"));
    const foreignOption = foreignOptions.find((option) => option.name === foreign.name);
    const ownOption = ownOptions.find((option) => option.name === own.name);
    if (!foreignOption || !ownOption) throw new Error("Tenant dropdown check needs a named network option in each company.");
    expect(ownOptions.some((option) => option.id === foreignOption.id)).toBe(false);
    expect(foreignOptions.some((option) => option.id === ownOption.id)).toBe(false);

    await openNetworks(page, staff);
    await expect(networkRow(page, own)).toBeVisible();
    await expect(page.getByText(foreign.name, { exact: true })).toHaveCount(0);
    expect(await page.evaluate((secret) => document.body.innerText.includes(secret), foreign.mikrotik_password ?? "")).toBe(false);

    const context = await browser.newContext({
      baseURL: other.baseURL,
      storageState: other.state,
      locale: "en-US",
      timezoneId: "Asia/Dhaka",
      serviceWorkers: "block",
    });
    try {
      const foreignPage = await context.newPage();
      await foreignPage.goto("/networks");
      await expect(foreignPage.getByText(own.name, { exact: true })).toHaveCount(0);
      await expect(foreignPage.getByText(foreign.name, { exact: true })).toBeVisible();
      expect(await foreignPage.evaluate((secret) => document.body.innerText.includes(secret), own.mikrotik_password ?? "")).toBe(false);
    } finally {
      await context.close();
    }
  } finally {
    await other.dispose();
  }
});

async function expectDenied(actor: Awaited<ReturnType<typeof authenticate>>, network: Network) {
  const shown = await actor.call(`networks/${network.id}`);
  expect([403, 404]).toContain(shown.status);
  expect(responseContains(shown.body, network.mikrotik_password)).toBe(false);

  const listed = await networks(actor, `name=${encodeURIComponent(network.name)}`);
  expect(listed.data.some((row) => row.id === network.id)).toBe(false);

  const probed = await actor.call(`network-status/${network.id}`);
  expect([403, 404]).toContain(probed.status);
  expect(responseContains(probed.body, network.mikrotik_password)).toBe(false);

  const updated = await actor.call(`networks/${network.id}`, "PUT", {});
  expect([403, 404]).toContain(updated.status);
  const removed = await actor.call(`networks/${network.id}`, "DELETE");
  expect([403, 404]).toContain(removed.status);
}

// লগআউটের পর পুরোনো নেটওয়ার্ক তালিকা ফেরে না এবং অন্য কোম্পানির তথ্য আলাদা থাকে কি না দেখি।
test("NW-A07 Network access after logout: block back and reload, and keep the next company separate", async ({ browser, page, staff }) => {
  const listed = await openNetworks(page, staff);
  const own = listed.data[0];
  if (!own) throw new Error("Logout isolation needs a visible network.");
  const other = await authenticate(browser, staff.tenant === "cp" ? "mk" : "cp");
  try {
    const foreignList = await networks(other);
    assertProbeSafe(foreignList.data);
    const foreign = foreignList.data[0];
    if (!foreign) throw new Error("The other company needs a network.");
    expect(foreign.name).not.toBe(own.name);
    await expect(networkRow(page, own)).toBeVisible();
    await page.getByRole("button", { name: /user menu/i }).click();
    await page.getByText("Sign out", { exact: true }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.locator("#username")).toBeVisible();
    await page.goBack();
    await expect(page.locator("#username")).toBeVisible();
    await expect(page.getByText(own.name, { exact: true })).toHaveCount(0);
    await page.reload();
    await expect(page.locator("#username")).toBeVisible();
    await expect(page.getByText(own.name, { exact: true })).toHaveCount(0);

    const context = await browser.newContext({
      baseURL: other.baseURL,
      storageState: other.state,
      locale: "en-US",
      timezoneId: "Asia/Dhaka",
      serviceWorkers: "block",
    });
    try {
      const foreignPage = await context.newPage();
      await foreignPage.goto("/networks");
      await expect(foreignPage.getByText(foreign.name, { exact: true })).toBeVisible();
      await expect(foreignPage.getByText(own.name, { exact: true })).toHaveCount(0);
      await foreignPage.reload();
      await expect(foreignPage.getByText(own.name, { exact: true })).toHaveCount(0);
      const stillThere = await networkDetail(staff, own.id);
      expect(stillThere.name).toBe(own.name);
    } finally {
      await context.close();
    }
  } finally {
    await other.dispose();
  }
});
