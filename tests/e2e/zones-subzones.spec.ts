import { expect, test } from "@playwright/test";
import {
  openCreateForm,
  selectFirstReactSelectOption,
  submitFormDialog,
} from "@/tests/e2e/helpers/forms";

const authFile = "playwright/.auth/user.json";

test.use({ storageState: authFile });

test.describe("zones", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/zones");
    await expect(page).toHaveURL(/\/zones/);
    await expect(page.getByRole("button", { name: /^add$/i })).toBeVisible({
      timeout: 30000,
    });
  });

  // জোন তৈরির আগে আবশ্যক ইনপুটের ত্রুটি দেখায় কি না যাচাই করি।
  test("New zone validation: show required-field errors before creating a zone", async ({ page }) => {
    const dialog = await openCreateForm(page);
    await expect(
      dialog.getByRole("heading", { name: /add zone/i })
    ).toBeVisible();

    await submitFormDialog(dialog);
    await expect(dialog.getByText("Zone name is required")).toBeVisible();

    await dialog.locator("#name").fill("a");
    await submitFormDialog(dialog);
    await expect(
      dialog.getByText("Zone name must be at least 2 characters long")
    ).toBeVisible();
    await expect(dialog).toBeVisible();
  });

  // ফর্ম দিয়ে নতুন জোন তৈরি ও সংরক্ষণ হয় কি না যাচাই করি।
  test("Create zone: save a new zone through the form", async ({ page }) => {
    const zoneName = `E2E Zone ${Date.now()}`;
    const dialog = await openCreateForm(page);

    await dialog.locator("#name").fill(zoneName);
    await submitFormDialog(dialog);

    await expect(dialog).toBeHidden({ timeout: 30000 });
    await expect(page.getByText(zoneName, { exact: true })).toBeVisible({
      timeout: 30000,
    });
  });
});

test.describe("sub-zones", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/sub-zones");
    await expect(page).toHaveURL(/\/sub-zones/);
    await expect(page.getByRole("button", { name: /^add$/i })).toBeVisible({
      timeout: 30000,
    });
  });

  // সাব-জোন তৈরির আগে আবশ্যক ইনপুটের ত্রুটি দেখায় কি না দেখি।
  test("New sub-zone validation: show required-field errors before creating a sub-zone", async ({
    page,
  }) => {
    const dialog = await openCreateForm(page);
    await expect(
      dialog.getByRole("heading", { name: /add sub zone/i })
    ).toBeVisible();

    await submitFormDialog(dialog);
    await expect(dialog.getByText("Sub zone name is required")).toBeVisible();
    await expect(dialog.getByText("Zone is required")).toBeVisible();

    await dialog.locator("#name").fill("a");
    await submitFormDialog(dialog);
    await expect(
      dialog.getByText("Sub zone name must be at least 2 characters long")
    ).toBeVisible();
    await expect(dialog).toBeVisible();
  });

  // ফর্ম দিয়ে নতুন সাব-জোন তৈরি ও সংরক্ষণ হয় কি না যাচাই করি।
  test("Create sub-zone: save a new sub-zone through the form", async ({ page }) => {
    const subZoneName = `E2E Sub Zone ${Date.now()}`;
    const dialog = await openCreateForm(page);

    await selectFirstReactSelectOption(page, 0);
    await dialog.locator("#name").fill(subZoneName);
    await submitFormDialog(dialog);

    await expect(dialog).toBeHidden({ timeout: 30000 });
    await expect(page.getByText(subZoneName, { exact: true })).toBeVisible({
      timeout: 30000,
    });
  });
});
