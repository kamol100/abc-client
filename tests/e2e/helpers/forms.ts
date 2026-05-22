import { expect, type Locator, type Page } from "@playwright/test";

export async function openCreateForm(page: Page): Promise<Locator> {
  await page.getByRole("button", { name: /^add$/i }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  return dialog;
}

export async function submitFormDialog(dialog: Locator): Promise<void> {
  await dialog.getByRole("button", { name: /^save$/i }).click();
}

export async function selectFirstReactSelectOption(
  page: Page,
  controlIndex = 0
): Promise<void> {
  await page.locator(".select__control").nth(controlIndex).click();
  const firstOption = page.locator(".select__menu .select__option").first();
  await expect(firstOption).toBeVisible({ timeout: 15000 });
  await firstOption.click();
}
