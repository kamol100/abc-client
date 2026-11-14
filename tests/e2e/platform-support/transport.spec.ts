import { randomUUID } from "node:crypto";
import { test, expect } from "@playwright/test";
import { loadDisposableSupportFixture } from "@/tests/e2e/platform-support/fixtures";
import { authenticate, chooseDropdown, requirePermissions } from "@/tests/e2e/support-tickets/fixtures";

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

test("PS-E06 a disposable browser send stores one synthetic image through the app proxy", async ({ browser }) => {
  const fixture = loadDisposableSupportFixture();
  const tenant = process.env.E2E_TENANT === "mk" ? "mk" : "cp";
  const session = await authenticate(browser, tenant);
  try {
    requirePermissions(session, "platform-support.access", "platform-support.create", "platform-support.upload");
    const context = await browser.newContext({
      baseURL: session.baseURL,
      storageState: session.state,
      locale: "en-US",
      timezoneId: "Asia/Dhaka",
      serviceWorkers: "block",
    });
    try {
      const page = await context.newPage();
      await page.goto("/platform-support?kind=issue&compose=issue");
      const dialog = page.getByRole("dialog", { name: "Report an issue" });
      await expect(dialog).toBeVisible();
      await expect(dialog.locator("[name=subject]")).toHaveCount(0);
      await chooseDropdown(page, "category", "Mobile app issue");
      await chooseDropdown(page, "priority", "Normal");
      await page.getByPlaceholder("Write a message").fill(
        `Disposable ${fixture.disposableDatabase} ${randomUUID().slice(0, 8)}`,
      );
      const uploaded = page.waitForResponse((response) => (
        response.url().includes("/api/platform-support/uploads") && response.request().method() === "POST"
      ));
      await page.getByTestId("support-image-input").setInputFiles({
        name: "dot.png",
        mimeType: "image/png",
        buffer: PNG,
      });
      const upload = await uploaded;
      expect(upload.ok()).toBe(true);
      await expect(page.getByTestId("support-image-ready")).toBeVisible();
      await dialog.getByRole("button", { name: /^report an issue$/i }).click();
      await expect(page).toHaveURL(/\/platform-support\/issues\/[0-9a-f-]{36}$/i);
      const image = page.locator("img[src*='/api/platform-support/attachments/']");
      await expect(image).toBeVisible();
      const src = await image.getAttribute("src");
      if (!src) throw new Error("Sent image has no app attachment URL.");
      const delivered = await page.request.get(src);
      expect(delivered.status()).toBe(200);
      expect(delivered.headers()["content-type"] ?? "").toContain("image/");
      expect(delivered.headers()["cache-control"] ?? "").toContain("private");
      expect(delivered.headers()["cache-control"] ?? "").not.toContain("public");

      const anonymous = await browser.newContext({ storageState: { cookies: [], origins: [] } });
      try {
        const copied = await anonymous.request.get(new URL(src, page.url()).toString());
        expect(copied.status()).toBe(401);
        expect(await copied.text()).not.toContain("Bearer");
      } finally {
        await anonymous.close();
      }
    } finally {
      await context.close();
    }
  } finally {
    await session.dispose();
  }
});
