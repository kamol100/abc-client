import { expect, type Locator, type Page, test } from "@playwright/test";
import {
  openCreateForm,
  submitFormDialog,
} from "@/tests/e2e/helpers/forms";

const authFile = "playwright/.auth/user.json";

test.use({ storageState: authFile });

function getVendorRow(page: Page, vendorName: string): Locator {
  return page.getByRole("row").filter({ hasText: vendorName });
}

test.describe("vendors", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/vendors");
    await expect(page).toHaveURL(/\/vendors/);
    await expect(page.getByRole("button", { name: /^add$/i })).toBeVisible({
      timeout: 30000,
    });
  });

  test("shows client-side validation before creating a vendor", async ({
    page,
  }) => {
    const dialog = await openCreateForm(page);
    await expect(
      dialog.getByRole("heading", { name: /add vendor/i })
    ).toBeVisible();

    await submitFormDialog(dialog);
    await expect(dialog.getByText("Vendor name is required")).toBeVisible();
    await expect(dialog.getByText("Phone is required")).toBeVisible();

    await dialog.locator("#name").fill("a");
    await dialog.locator("#phone").fill("123");
    await dialog.locator("#email").fill("invalid-email");
    await submitFormDialog(dialog);

    await expect(
      dialog.getByText("Vendor name must be at least 2 characters long")
    ).toBeVisible();
    await expect(dialog.getByText("Phone must be at least 11 digits")).toBeVisible();
    await expect(dialog.getByText("Invalid email address")).toBeVisible();
    await expect(dialog).toBeVisible();
  });

  test("creates, updates, and deletes a vendor via the form", async ({
    page,
  }) => {
    const timestamp = Date.now();
    const vendorName = `E2E Vendor ${timestamp}`;
    const updatedVendorName = `${vendorName} Updated`;
    const vendorPhone = `017${String(timestamp).slice(-8)}`;
    const updatedVendorPhone = `018${String(timestamp).slice(-8)}`;
    const vendorEmail = `e2e.vendor.${timestamp}@example.com`;
    const updatedVendorEmail = `e2e.vendor.updated.${timestamp}@example.com`;

    const createDialog = await openCreateForm(page);
    await createDialog.locator("#name").fill(vendorName);
    await createDialog.locator("#phone").fill(vendorPhone);
    await createDialog.locator("#email").fill(vendorEmail);
    await createDialog.locator("#address").fill("E2E vendor address");
    await submitFormDialog(createDialog);

    await expect(createDialog).toBeHidden({ timeout: 30000 });
    await expect(getVendorRow(page, vendorName)).toBeVisible({
      timeout: 30000,
    });

    const createdVendorRow = getVendorRow(page, vendorName);
    await createdVendorRow.getByRole("button").first().click();

    const editDialog = page.getByRole("dialog");
    await expect(
      editDialog.getByRole("heading", { name: /edit vendor/i })
    ).toBeVisible();
    await expect(editDialog.locator("#name")).toHaveValue(vendorName, {
      timeout: 30000,
    });

    await editDialog.locator("#name").fill(updatedVendorName);
    await editDialog.locator("#phone").fill(updatedVendorPhone);
    await editDialog.locator("#email").fill(updatedVendorEmail);
    await editDialog.locator("#address").fill("Updated E2E vendor address");
    await submitFormDialog(editDialog);

    await expect(editDialog).toBeHidden({ timeout: 30000 });
    await expect(getVendorRow(page, updatedVendorName)).toBeVisible({
      timeout: 30000,
    });

    const updatedVendorRow = getVendorRow(page, updatedVendorName);
    await updatedVendorRow.getByRole("button").nth(1).click();

    const deleteDialog = page.getByRole("dialog");
    await expect(
      deleteDialog.getByRole("heading", { name: /confirm delete/i })
    ).toBeVisible();
    await deleteDialog
      .getByRole("button", { name: /confirm delete/i })
      .click();

    await expect(deleteDialog).toBeHidden({ timeout: 30000 });
    await expect(page.getByText(updatedVendorName, { exact: true })).toBeHidden({
      timeout: 30000,
    });
  });
});
