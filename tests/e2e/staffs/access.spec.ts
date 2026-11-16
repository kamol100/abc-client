import { randomUUID } from "node:crypto";
import { backendURL } from "@/tests/e2e/clients/environment";
import {
  authenticate,
  expect,
  expectLoginForm,
  showStaffRow,
  staffDetail,
  staffList,
  staffSnapshot,
  test,
} from "@/tests/e2e/staffs/fixtures";

const ANONYMOUS_PATHS = [
  "/staffs",
  "/staffs/create",
  "/staffs/edit/00000000-0000-4000-8000-000000000001",
];

for (const path of ANONYMOUS_PATHS) {
  test(`FT090-08 anonymous ${path} redirects to the same-host staff login`, async ({ browser, baseURL }) => {
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
      await expect(page.locator("#password")).toBeVisible();
    } finally {
      await context.close();
    }
  });
}

test("FT090-08 anonymous staff reads and writes return 401", async ({ request }) => {
  const id = randomUUID();
  const calls: Array<[string, string]> = [
    ["GET", "staffs"],
    ["POST", "staffs"],
    ["GET", `staffs/${id}`],
    ["PUT", `staffs/${id}`],
    ["PUT", `staffs/${id}/status`],
    ["PUT", `staffs/${id}/password`],
    ["DELETE", `staffs/${id}`],
    ["POST", `impersonate/staff/${id}`],
  ];
  for (const [method, path] of calls) {
    const response = await request.fetch(`${backendURL()}${path}`, {
      method,
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      data: method === "GET" ? undefined : {},
    });
    expect(response.status(), `${method} ${path}`).toBe(401);
  }
});

test("FT090-09 another company cannot read or change a known staff", async ({ browser, page, staff }) => {
  const otherTenant = staff.tenant === "cp" ? "mk" : "cp";
  const other = await authenticate(browser, otherTenant).catch(() => authenticate(browser, otherTenant));
  try {
    const ownList = await staffList(staff);
    const foreignList = await staffList(other);
    expect(ownList.data.length + foreignList.data.length).toBeGreaterThan(0);
    for (const [actor, owner, target] of [
      [staff, other, foreignList.data[0]],
      [other, staff, ownList.data[0]],
    ] as const) {
      if (!target) continue;
      const before = await staffDetail(owner, target.id);
      const shown = await actor.call(`staffs/${target.id}`);
      expect([403, 404]).toContain(shown.status);
      expect(JSON.stringify(shown.body ?? {})).not.toContain(target.id);
      const status = await actor.call(`staffs/${target.id}/status`, "PUT", { status: before.status ?? "active" });
      expect([403, 404]).toContain(status.status);
      const updated = await actor.call(`staffs/${target.id}`, "PUT", { name: before.name });
      expect([403, 404]).toContain(updated.status);
      expect(staffSnapshot(await staffDetail(owner, target.id))).toEqual(staffSnapshot(before));
    }
    const foreign = foreignList.data.find((row) => row.user?.username);
    if (foreign?.user?.username && !ownList.data.some((row) => row.user?.username === foreign.user?.username)) {
      await page.goto("/staffs");
      await expect(page.getByText(foreign.user.username, { exact: true })).toHaveCount(0);
    }
    const own = ownList.data.find((row) => row.user?.username);
    if (own?.user?.username && !foreignList.data.some((row) => row.user?.username === own.user?.username)) {
      const context = await browser.newContext({
        baseURL: other.baseURL,
        storageState: other.state,
        locale: "en-US",
        serviceWorkers: "block",
      });
      try {
        const foreignPage = await context.newPage();
        await foreignPage.goto("/staffs");
        await expect(foreignPage.getByText(own.user.username, { exact: true })).toHaveCount(0);
      } finally {
        await context.close();
      }
    }
  } finally {
    await other.dispose();
  }
});

test("FT090-09 logout back and reload do not restore the staff list", async ({ browser, page, staff }) => {
  const listed = await staffList(staff);
  const row = listed.data.find((item) => item.user?.username);
  if (!row?.user?.username) throw new Error("Logout isolation needs a staff username.");
  const username = row.user.username;
  await showStaffRow(page, staff, row);
  await page.getByRole("button", { name: /user menu/i }).click();
  await page.getByText("Sign out", { exact: true }).click();
  await expectLoginForm(page);

  await page.goBack();
  await expectLoginForm(page);
  await expect(page.getByText(username, { exact: true })).toHaveCount(0);

  await page.reload();
  await expectLoginForm(page);
  await expect(page.getByText(username, { exact: true })).toHaveCount(0);

  const other = await authenticate(browser, staff.tenant === "cp" ? "mk" : "cp");
  try {
    const foreignList = await staffList(other);
    expect(foreignList.data.some((item) => item.id === row.id)).toBe(false);
  } finally {
    await other.dispose();
  }
});
