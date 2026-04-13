import { expect, type APIRequestContext, type Page } from "@playwright/test";

import { backendBaseUrl, getBackendAccessToken } from "@/tests/e2e/helpers/auth";
import { navigateToSidebarSubmenu } from "@/tests/e2e/helpers/sidebar";

type ZoneFormInput = {
  name: string;
  lat: string;
  lon: string;
};

function zoneRowLocator(page: Page, zoneName: string) {
  return page.locator("tbody tr").filter({
    hasText: zoneName,
  });
}

export async function goToZonesPageFromSidebar(page: Page): Promise<void> {
  try {
    await navigateToSidebarSubmenu(page, "/zones");
  } catch {
    const sidebarContent = page.locator("[data-sidebar='content']").first();
    const zonesMenuButton = sidebarContent
      .locator("button[data-sidebar='menu-button']")
      .filter({ hasText: /^Zones$/i })
      .first();

    await expect(zonesMenuButton).toBeVisible({ timeout: 20000 });
    await zonesMenuButton.click();

    const zonesSubmenuLinkByHref = sidebarContent.locator("a[href='/zones']").first();
    if ((await zonesSubmenuLinkByHref.count()) > 0) {
      await zonesSubmenuLinkByHref.click();
    } else {
      await sidebarContent.getByRole("link", { name: /^Zones$/i }).first().click();
    }
  }

  await expect(page).toHaveURL(/\/zones/);
  await expect(page.locator("table").first()).toBeVisible();
}

export async function openZoneCreateDialog(page: Page) {
  const createButton = page
    .locator("button")
    .filter({ has: page.locator("svg.lucide-plus") })
    .first();
  await expect(createButton).toBeVisible({ timeout: 20000 });
  await createButton.click();

  const dialog = page.locator("[role='dialog']").last();
  await expect(dialog).toBeVisible();
  return dialog;
}

export async function createZoneFromUI(
  page: Page,
  payload: ZoneFormInput,
): Promise<void> {
  const dialog = await openZoneCreateDialog(page);

  await page.locator("#name").fill(payload.name);
  await page.locator("#lat").fill(payload.lat);
  await page.locator("#lon").fill(payload.lon);
  await dialog.getByRole("button", { name: /save/i }).click();

  await expect(zoneRowLocator(page, payload.name).first()).toBeVisible({
    timeout: 30000,
  });
}

export async function editZoneFromUI(
  page: Page,
  existingName: string,
  payload: ZoneFormInput,
): Promise<void> {
  const row = zoneRowLocator(page, existingName).first();
  await expect(row).toBeVisible({ timeout: 30000 });

  const buttons = row.locator("button");
  await buttons.first().click();

  const dialog = page.locator("[role='dialog']").last();
  await expect(dialog).toBeVisible();

  await page.locator("#name").fill(payload.name);
  await page.locator("#lat").fill(payload.lat);
  await page.locator("#lon").fill(payload.lon);
  await dialog.getByRole("button", { name: /save/i }).click();

  await expect(zoneRowLocator(page, payload.name).first()).toBeVisible({
    timeout: 30000,
  });
}

export async function deleteZoneFromUI(
  page: Page,
  zoneName: string,
): Promise<void> {
  const row = zoneRowLocator(page, zoneName).first();
  await expect(row).toBeVisible({ timeout: 30000 });

  const buttons = row.locator("button");
  await buttons.nth(1).click();

  const dialog = page.locator("[role='dialog']").last();
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: /confirm delete|delete/i }).click();

  await expect(zoneRowLocator(page, zoneName)).toHaveCount(0, {
    timeout: 30000,
  });
}

type ZoneItem = {
  id?: number | string;
  name?: string;
};

function extractZoneItems(payload: unknown): ZoneItem[] {
  if (!payload || typeof payload !== "object") return [];
  const root = payload as { data?: unknown };
  const data = root.data;
  if (!data || typeof data !== "object") return [];
  const nested = data as { data?: unknown };
  if (!Array.isArray(nested.data)) return [];
  return nested.data as ZoneItem[];
}

export async function cleanupZoneByNameViaApi(
  request: APIRequestContext,
  zoneName: string,
): Promise<void> {
  const token = await getBackendAccessToken(request);
  const listResponse = await request.get(
    `${backendBaseUrl}/api/v1/zones?page=1&per_page=100`,
    {
      headers: {
        "Content-type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        Authorization: `Bearer ${token}`,
      },
    },
  );
  if (!listResponse.ok()) return;

  const body = (await listResponse.json()) as unknown;
  const matchedIds = extractZoneItems(body)
    .filter((zone) => zone.name === zoneName && zone.id !== undefined)
    .map((zone) => zone.id as string | number);

  for (const zoneId of matchedIds) {
    await request.delete(`${backendBaseUrl}/api/v1/zones/${zoneId}`, {
      headers: {
        "Content-type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        Authorization: `Bearer ${token}`,
      },
    });
  }
}
