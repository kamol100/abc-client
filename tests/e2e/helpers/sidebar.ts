import { expect, type Page } from "@playwright/test";

function toMenuLabel(path: string): string {
  const label = path.replace(/^\//, "").split("/")[0] ?? "";
  if (!label) return "Dashboard";
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export async function navigateToSidebarSubmenu(
  page: Page,
  path: string,
): Promise<void> {
  await expect(
    page.locator("ul[data-sidebar='menu'] li[data-sidebar='menu-item']").first(),
  ).toBeVisible({ timeout: 30000 });

  const submenuLinkByHref = page.locator(`a[href='${path}']`).first();
  if ((await submenuLinkByHref.count()) > 0) {
    if (!(await submenuLinkByHref.isVisible())) {
      const parentMenuItem = page
        .locator("li[data-sidebar='menu-item']")
        .filter({ has: submenuLinkByHref })
        .first();

      await parentMenuItem
        .locator("button[data-sidebar='menu-button']")
        .first()
        .click();
      await expect(submenuLinkByHref).toBeVisible();
    }
    await submenuLinkByHref.click();
    return;
  }

  const label = toMenuLabel(path);
  const parentToggle = page
    .locator("button[data-sidebar='menu-button']")
    .filter({ hasText: new RegExp(`^${label}$`, "i") })
    .first();

  if ((await parentToggle.count()) > 0) {
    await parentToggle.click();
    const revealedAfterToggle = page.locator(`a[href='${path}']`).first();
    if ((await revealedAfterToggle.count()) > 0) {
      await expect(revealedAfterToggle).toBeVisible({ timeout: 8000 });
      await revealedAfterToggle.click();
      return;
    }
  }

  const revealedSubmenuLink = page.locator(`a[href='${path}']`).first();
  if ((await revealedSubmenuLink.count()) > 0) {
    await revealedSubmenuLink.click();
    return;
  }

  throw new Error(`Unable to locate sidebar submenu link for path: ${path}`);
}
