import { expect, test } from "@/tests/e2e/fixtures/authenticated";
import {
  cleanupZoneByNameViaApi,
  createZoneFromUI,
  deleteZoneFromUI,
  editZoneFromUI,
  goToZonesPageFromSidebar,
  openZoneCreateDialog,
} from "@/tests/e2e/helpers/zones";

test.describe("Zones end-to-end CRUD flow", () => {
  test("shows validation error when submitting form without a name", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await goToZonesPageFromSidebar(page);

    const dialog = await openZoneCreateDialog(page);
    await dialog.getByRole("button", { name: /save/i }).click();

    await expect(page.getByText("Zone name is required")).toBeVisible();
    await expect(dialog).toBeVisible();
  });

  test("navigates from sidebar and performs create, edit, delete", async ({
    page,
    request,
  }) => {
    test.setTimeout(180000);

    const suffix = `${Date.now()}`;
    const initialZoneName = `zone-e2e-${suffix}`;
    const updatedZoneName = `zone-e2e-updated-${suffix}`;
    let zoneToCleanup: string | null = null;

    try {
      await page.goto("/dashboard");
      await goToZonesPageFromSidebar(page);
      await expect(page.locator("table").first()).toBeVisible();

      await createZoneFromUI(page, {
        name: initialZoneName,
        lat: "23.8103",
        lon: "90.4125",
      });
      zoneToCleanup = initialZoneName;

      await editZoneFromUI(page, initialZoneName, {
        name: updatedZoneName,
        lat: "23.9100",
        lon: "90.5000",
      });
      zoneToCleanup = updatedZoneName;

      await deleteZoneFromUI(page, updatedZoneName);
      zoneToCleanup = null;
    } finally {
      if (zoneToCleanup) {
        try {
          await cleanupZoneByNameViaApi(request, zoneToCleanup);
        } catch {
          // cleanup best-effort; main assertion should remain primary signal
        }
      }
    }
  });
});
