import { randomUUID } from "node:crypto";
import { test as guest, expect } from "@playwright/test";
import { requirePermissions, test } from "@/tests/e2e/platform-support/fixtures";

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

guest("PS-E02 anonymous help and support routes require staff login", async ({ browser, baseURL }) => {
  const context = await browser.newContext({
    baseURL,
    locale: "en-US",
    serviceWorkers: "block",
    storageState: { cookies: [], origins: [] },
  });
  try {
    const page = await context.newPage();
    for (const path of ["/help", "/platform-support", "/platform-support-admin"]) {
      await page.goto(path);
      await expect(page).toHaveURL((url) => (
        url.origin === baseURL
        && url.pathname === "/admin"
        && url.searchParams.get("callbackUrl") === path
      ));
      await expect(page.locator("#username")).toBeVisible();
    }
  } finally {
    await context.close();
  }
});

test("PS-E01 launcher opens requester routes and keeps customer tickets separate", async ({ page, staff }) => {
  requirePermissions(staff, "platform-support.access", "tickets.access");
  await page.goto("/dashboard");
  await expect(page.getByTestId("platform-support-launcher")).toBeVisible();
  await page.getByTestId("platform-support-launcher").click();
  await expect(page.getByTestId("help-launcher-panel")).toBeVisible();
  await expect(page.getByTestId("platform-support-report")).toBeVisible();
  await expect(page.getByTestId("platform-support-chat")).toBeVisible();
  await expect(page.getByTestId("platform-support-requests")).toBeVisible();
  await page.getByTestId("platform-support-requests").click();
  await expect(page).toHaveURL(/\/platform-support$/);
  await page.goto("/tickets");
  await expect(page).toHaveURL(/\/tickets$/);
  const tickets = await staff.call("tickets");
  expect(tickets.status).toBe(200);
});

test("PS-E06 an anonymous upload is rejected before a support row exists", async ({ browser, baseURL }) => {
  const context = await browser.newContext({
    baseURL,
    storageState: { cookies: [], origins: [] },
    serviceWorkers: "block",
  });
  try {
    const request = context.request;
    const denied = await request.post(`${baseURL}/api/platform-support/uploads`, {
      multipart: {
        draft_id: randomUUID(),
        file: { name: "dot.png", mimeType: "image/png", buffer: PNG },
      },
    });
    expect(denied.status()).toBe(403);
    expect(denied.headers()["cache-control"] ?? "").toContain("private");
    expect(denied.headers()["cache-control"] ?? "").not.toContain("public");
    const body = await denied.text();
    expect(body).not.toContain("Bearer");
    expect(body).not.toContain("upload_token");

    const attachment = await request.get(`${baseURL}/api/platform-support/attachments/${randomUUID()}`);
    expect(attachment.status()).toBe(401);
    expect(attachment.headers()["cache-control"] ?? "").toContain("no-store");
    expect(await attachment.text()).not.toContain("Bearer");
  } finally {
    await context.close();
  }
});

test("PS-E16 logout and mobile help do not keep the staff page", async ({ browser, staff, baseURL }) => {
  requirePermissions(staff, "platform-support.access");
  const mobile = await browser.newContext({
    baseURL,
    storageState: staff.state,
    viewport: { width: 390, height: 800 },
    locale: "en-US",
    serviceWorkers: "block",
  });
  try {
    const small = await mobile.newPage();
    await small.goto("/dashboard", { waitUntil: "domcontentloaded" });
    const launcher = small.getByTestId("platform-support-launcher");
    await expect(launcher).toBeVisible();
    await launcher.evaluate((node) => {
      if (node instanceof HTMLButtonElement) node.click();
    });
    await expect(small.getByTestId("help-launcher-panel")).toBeVisible();
  } finally {
    await mobile.close();
  }

  const pageContext = await browser.newContext({
    baseURL,
    storageState: staff.state,
    locale: "en-US",
    serviceWorkers: "block",
  });
  try {
    const page = await pageContext.newPage();
    await page.goto("/help", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Help", exact: true })).toBeVisible();
    await page.getByRole("button", { name: /user menu/i }).click();
    await page.getByText("Sign out", { exact: true }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await page.goto("/help", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#username")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Help", exact: true })).toHaveCount(0);
  } finally {
    await pageContext.close();
  }
});
