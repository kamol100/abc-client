import { describe, expect, it } from "vitest";
import {
  DASHBOARD_VISIBILITY_ITEMS,
  isDashboardItemVisible,
  resolveDashboardVisibility,
} from "@/components/dashboard/dashboard-visibility";
import {
  filterSettingsFieldsByPermission,
  SETTINGS_SECTION_SCHEMA,
} from "@/components/settings/settings-form-schema";
import {
  isSettingsSwitchKey,
  normalizeSettingValueForForm,
} from "@/components/settings/settings-type";

describe("dashboard visibility settings", () => {
  it("shows an item when the setting is missing", () => {
    expect(isDashboardItemVisible(undefined)).toBe(true);
    expect(isDashboardItemVisible(null)).toBe(true);
    expect(isDashboardItemVisible("")).toBe(true);
  });

  it("hides an item only when the setting is explicitly off", () => {
    expect(isDashboardItemVisible(0)).toBe(false);
    expect(isDashboardItemVisible("0")).toBe(false);
    expect(isDashboardItemVisible(false)).toBe(false);
    expect(isDashboardItemVisible("false")).toBe(false);
    expect(isDashboardItemVisible(1)).toBe(true);
    expect(isDashboardItemVisible("1")).toBe(true);
    expect(isDashboardItemVisible(true)).toBe(true);
  });

  it("keeps permission before the visibility setting", () => {
    const visibility = resolveDashboardVisibility(
      (permission) => permission === "dashboard-card.client",
      { dashboard_show_client: 0, dashboard_show_reseller: 1 },
    );

    expect(visibility.client).toBe(false);
    expect(visibility.reseller).toBe(false);
    expect(visibility.topDueInvoices).toBe(true);
    expect(visibility.zoneDue).toBe(true);
  });

  it("shows a permitted item when its setting has never been saved", () => {
    const visibility = resolveDashboardVisibility(
      () => true,
      {},
    );

    for (const item of DASHBOARD_VISIBILITY_ITEMS) {
      expect(visibility[item.id]).toBe(true);
    }
  });

  it("registers every dashboard item as a settings switch that defaults on", () => {
    for (const item of DASHBOARD_VISIBILITY_ITEMS) {
      expect(isSettingsSwitchKey(item.settingKey)).toBe(true);
      expect(normalizeSettingValueForForm(item.settingKey, null)).toBe(true);
      expect(normalizeSettingValueForForm(item.settingKey, 0)).toBe(false);
    }
  });

  it("hides settings for dashboard cards the user cannot access", () => {
    const visible = filterSettingsFieldsByPermission(
      SETTINGS_SECTION_SCHEMA.dashboard.fields,
      (permission) => permission === "dashboard-card.invoice",
    );
    const keys = visible.map((field) => field.key);

    expect(keys).toContain("dashboard_show_invoice");
    expect(keys).toContain("dashboard_show_top_due_invoices");
    expect(keys).toContain("dashboard_show_zone_due");
    expect(keys).not.toContain("dashboard_show_client");
    expect(keys).not.toContain("dashboard_show_reseller");
  });
});
