import { test, expect, sample, detail, row, assertRows, invoices, requirePermissions } from "@/tests/e2e/invoices/fixtures";

async function openDocument(page: Parameters<typeof row>[0], staff: Parameters<typeof sample>[0]) {
  requirePermissions(staff, "invoices.show");
  const item = await sample(staff);
  const saved = await detail(staff, item.id);
  await page.goto("/invoices");
  await row(page, item).getByRole("button", { name: "View", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "View Invoice", exact: true });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator(".invoice-view-meta")).toContainText(saved.trackID);
  await expect(dialog.locator(".invoice-view-parties")).toContainText(saved.client.name);
  const total = dialog.locator(".invoice-view-totals").getByText("Total", { exact: true }).locator("..");
  await expect(total.getByText(`${new Intl.NumberFormat("en-US").format(saved.after_discount_amount)}৳`, { exact: true })).toBeVisible();
  if (saved.note) await expect(dialog.locator("[data-invoice-note]")).toHaveText(saved.note);
  return { saved, dialog };
}

test("IV-D01 selected invoice document shows API identity and persisted line descriptions", async ({ page, staff }) => {
  const { saved, dialog } = await openDocument(page, staff);
  if (!saved.lines?.length) throw new Error("Document fixture requires persisted invoice lines.");
  for (const line of saved.lines) await expect(dialog.getByRole("cell", { name: line.description, exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await page.reload();
  const reopened = await openDocument(page, staff);
  expect(reopened.saved.id).toBe(saved.id);
  await expect(reopened.dialog.locator(".invoice-view-meta")).toContainText(saved.trackID);
});

test("IV-D04 document print invokes browser print with selected identity and cleans up", async ({ page, staff }) => {
  const { saved, dialog } = await openDocument(page, staff);
  await page.evaluate(() => {
    window.print = () => {
      // Capture only invocation, identity remains in the print DOM for assertions.
      document.documentElement.setAttribute("data-e2e-print-called", "true");
    };
  });
  const originalTitle = await page.title();
  await dialog.getByRole("button", { name: "Print", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-e2e-print-called", "true");
  await expect(page.locator("#invoice-view-print-root .invoice-view-meta")).toContainText(saved.trackID);
  await expect(page.locator("#invoice-view-print-root .invoice-view-parties")).toContainText(saved.client.name);
  await page.evaluate(() => window.dispatchEvent(new Event("afterprint")));
  await expect(page.locator("#invoice-view-print-root")).toHaveCount(0);
  await expect(page).toHaveTitle(originalTitle);
});

test("IV-A05 cancelling deletion preserves the selected due invoice", async ({ page, staff }) => {
  requirePermissions(staff, "invoices.delete");
  const item = await sample(staff, "due");
  const before = await detail(staff, item.id);
  await page.goto("/invoices");
  // DeleteModal trigger has no accessible name; scope its rendered trash icon to the invoice row.
  await row(page, item).getByRole("button").filter({ has: page.locator("svg.lucide-trash-2") }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  expect(await detail(staff, item.id)).toEqual(before);
  await page.reload();
  await assertRows(page, (await invoices(staff)).data);
});
