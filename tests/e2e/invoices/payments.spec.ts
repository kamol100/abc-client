import { z } from "zod";
import { test, expect, sample, detail, row, requirePermissions } from "@/tests/e2e/invoices/fixtures";

const DueSchema = z.object({ invoiceDue: z.array(z.object({
  uuid: z.string().uuid(), trackID: z.string(),
  after_discount_amount: z.coerce.number(), amount_paid: z.coerce.number(),
})) });
async function openPayment(page: Parameters<typeof row>[0], staff: Parameters<typeof sample>[0]) {
  requirePermissions(staff, "invoices.pay");
  const item = await sample(staff, "due");
  const due = DueSchema.parse(await staff.get(`invoice-due/${item.id}`));
  expect(due.invoiceDue.some(i => i.uuid === item.id)).toBe(true);
  const before = await Promise.all(due.invoiceDue.map(i => detail(staff, i.uuid)));
  expect(before.every(i => i.client.uuid === item.client.uuid)).toBe(true);
  await page.goto("/invoices");
  await row(page, item).getByRole("button", { name: "Pay", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Pay Invoices", exact: true });
  await expect(dialog).toBeVisible();
  return { due, before, dialog };
}

// পেমেন্ট ডায়ালগে নির্বাচিত ক্লায়েন্টের বকেয়া ইনভয়েসই দেখা যায় কি না যাচাই করি।
test("IV-P01 Invoice payment dialog: list only the selected client's outstanding invoices", async ({ page, staff }) => {
  const { due, dialog, before } = await openPayment(page, staff);
  for (const item of due.invoiceDue) await expect(dialog.getByRole("button", { name: new RegExp(`^${item.trackID.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} -`) })).toBeVisible();
  await expect(dialog.getByRole("checkbox")).toHaveCount(due.invoiceDue.length + 1);
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  for (const saved of before) expect(await detail(staff, saved.id)).toEqual(saved);
});

// সব ইনভয়েসের নির্বাচন তুলে দিলে হিসাব শূন্য হয় এবং বাতিলে আগের টাকার তথ্য থাকে কি না দেখি।
test("IV-P02 Cancel invoice payment: clear totals when all invoices are deselected and keep saved amounts", async ({ page, staff }) => {
  const { dialog, before } = await openPayment(page, staff);
  // The checkbox and text are direct siblings; identify by the stable label text,
  // not an arbitrary checkbox index (invoice checkboxes currently lack labels).
  const checkbox = dialog.getByText("Select All", { exact: true }).locator("..").getByRole("checkbox");
  await expect(checkbox).toBeChecked();
  await checkbox.uncheck();
  await expect(dialog.getByRole("checkbox").filter({ visible: true }).and(dialog.locator('[data-state="checked"]'))).toHaveCount(0);
  const totalDue = dialog.getByText("Total Due", { exact: true }).locator("..");
  await expect(totalDue).toContainText("৳0");
  await checkbox.check();
  await expect(dialog.getByRole("checkbox").filter({ visible: true })).toHaveCount(before.length + 1);
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  for (const saved of before) expect(await detail(staff, saved.id)).toEqual(saved);
});
