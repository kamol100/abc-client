import {
  authenticate,
  expect,
  expenseIdentity,
  expenses,
  test,
} from "@/tests/e2e/expenses/fixtures";

for (const path of ["/expenses", "/reports/expenses"]) {
  // লগইন ছাড়া খরচের প্রতিটি পেজ খুললে একই টেন্যান্টের স্টাফ লগইনে পাঠায় কি না দেখি।
  test(`EX-A01 Expense page access - ${path.startsWith('/reports/') ? 'Expense report' : 'Expense list'}: redirect signed-out users to staff login`, async ({ browser, baseURL }) => {
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

// অন্য কোম্পানির খরচ বিস্তারিত পড়া বা সার্চে খুঁজে পাওয়া যায় না কি না যাচাই করি।
test("EX-A03 Expense privacy: prevent another company from reading or searching this company's expense", async ({ browser, page, staff }) => {
  const other = await authenticate(browser, staff.tenant === "cp" ? "mk" : "cp");
  try {
    const ownList = await expenses(staff);
    const foreignList = await expenses(other);
    expect(ownList.data.length + foreignList.data.length).toBeGreaterThan(0);
    for (const [actor, target] of [
      [staff, foreignList.data[0]],
      [other, ownList.data[0]],
    ] as const) {
      if (!target) continue;
      const shown = await actor.call(`expenses/${target.id}`);
      expect([403, 404]).toContain(shown.status);
      expect(JSON.stringify(shown.body ?? {})).not.toContain(target.id);
      if (target.expense_id) {
        const found = await expenses(actor, `any=${encodeURIComponent(target.expense_id)}`);
        expect(found.data.some((row) => row.id === target.id)).toBe(false);
      }
    }
    const foreign = foreignList.data[0];
    if (foreign?.expense_id && !ownList.data.some((row) => row.expense_id === foreign.expense_id)) {
      await page.goto("/expenses");
      await expect(page.getByText(foreign.expense_id, { exact: true })).toHaveCount(0);
    }
    const own = ownList.data[0];
    if (own?.expense_id && !foreignList.data.some((row) => row.expense_id === own.expense_id)) {
      const context = await browser.newContext({
        baseURL: other.baseURL,
        storageState: other.state,
        locale: "en-US",
        serviceWorkers: "block",
      });
      try {
        const foreignPage = await context.newPage();
        await foreignPage.goto("/expenses");
        await expect(foreignPage.getByText(own.expense_id, { exact: true })).toHaveCount(0);
      } finally {
        await context.close();
      }
    }
  } finally {
    await other.dispose();
  }
});

// লগআউটের পর Back ও রিলোড দিয়েও খরচের তালিকা ফিরে আসে না কি না দেখি।
test("EX-A05 Expense list after logout: keep it inaccessible after browser back and reload", async ({ browser, page, staff }) => {
  const listed = await expenses(staff);
  const expense = listed.data.find((row) => row.expense_id);
  if (!expense) throw new Error("Logout isolation needs an expense with a display ID.");
  const identity = expenseIdentity(expense);
  await page.goto("/expenses");
  await expect(page.getByText(identity, { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /user menu/i }).click();
  await page.getByText("Sign out", { exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.locator("#username")).toBeVisible();

  await page.goBack();
  await expect(page.locator("#username")).toBeVisible();
  await expect(page.getByText(identity, { exact: true })).toHaveCount(0);

  await page.reload();
  await expect(page.locator("#username")).toBeVisible();
  await expect(page.getByText(identity, { exact: true })).toHaveCount(0);

  const other = await authenticate(browser, staff.tenant === "cp" ? "mk" : "cp");
  try {
    const foreignList = await expenses(other);
    expect(foreignList.data.some((row) => row.id === expense.id)).toBe(false);
    if (!foreignList.data.some((row) => row.expense_id === identity)) {
      const context = await browser.newContext({
        baseURL: other.baseURL,
        storageState: other.state,
        locale: "en-US",
        serviceWorkers: "block",
      });
      try {
        const foreignPage = await context.newPage();
        await foreignPage.goto("/expenses");
        await expect(foreignPage.getByText(identity, { exact: true })).toHaveCount(0);
      } finally {
        await context.close();
      }
    }
  } finally {
    await other.dispose();
  }
});
