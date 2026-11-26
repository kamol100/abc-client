import { describe, expect, it } from "vitest";
import {
  DASHBOARD_VISIBILITY_ITEMS,
  isDashboardItemVisible,
  resolveDashboardVisibility,
} from "@/components/dashboard/dashboard-visibility";
import { readSetting } from "@/components/settings/core/values";
import { visibleSettingKeys } from "@/components/settings/core/visibility";
import { fieldOf } from "@/components/settings/registry/fields";
import { sectionKeys } from "@/components/settings/registry/sections";

describe("dashboard visibility settings", () => {
  // ড্যাশবোর্ড যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «shows an item when the setting is missing»।
  it("Dashboard visibility: shows an item when the setting is missing", () => {
    expect(isDashboardItemVisible(undefined)).toBe(true);
    expect(isDashboardItemVisible(null)).toBe(true);
    expect(isDashboardItemVisible("")).toBe(true);
  });

  // ড্যাশবোর্ড যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «hides an item only when the setting is explicitly off»।
  it("Dashboard visibility: hides an item only when the setting is explicitly off", () => {
    expect(isDashboardItemVisible(0)).toBe(false);
    expect(isDashboardItemVisible("0")).toBe(false);
    expect(isDashboardItemVisible(false)).toBe(false);
    expect(isDashboardItemVisible("false")).toBe(false);
    expect(isDashboardItemVisible(1)).toBe(true);
    expect(isDashboardItemVisible("1")).toBe(true);
    expect(isDashboardItemVisible(true)).toBe(true);
  });

  // ড্যাশবোর্ড যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «keeps permission before the visibility setting»।
  it("Dashboard visibility: keeps permission before the visibility setting", () => {
    const visibility = resolveDashboardVisibility(
      (permission) => permission === "dashboard-card.client",
      { dashboard_show_client: 0, dashboard_show_reseller: 1 },
    );

    expect(visibility.client).toBe(false);
    expect(visibility.reseller).toBe(false);
    expect(visibility.topDueInvoices).toBe(false);
    expect(visibility.zoneDue).toBe(false);
  });

  // ড্যাশবোর্ড যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «shows a permitted item when its setting has never been saved»।
  it("Dashboard visibility: shows a permitted item when its setting has never been saved", () => {
    const visibility = resolveDashboardVisibility(
      () => true,
      {},
    );

    for (const item of DASHBOARD_VISIBILITY_ITEMS) {
      expect(visibility[item.id]).toBe(true);
    }
  });

  // ড্যাশবোর্ড যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «registers every dashboard item as a settings switch that defaults on»।
  it("Dashboard visibility: registers every dashboard item as a settings switch that defaults on", () => {
    for (const item of DASHBOARD_VISIBILITY_ITEMS) {
      expect(fieldOf(item.settingKey).kind).toBe("toggle");
      expect(readSetting(item.settingKey, null)).toBe(true);
      expect(readSetting(item.settingKey, 0)).toBe(false);
    }
  });

  // ড্যাশবোর্ড যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «hides settings for dashboard cards the user cannot access»।
  it("Dashboard visibility: hides settings for dashboard cards the user cannot access", () => {
    const keys = visibleSettingKeys(sectionKeys("dashboard"), {
      hasPermission: (permission) => permission === "dashboard-card.invoice",
      valueOf: () => null,
    });

    expect(keys).toContain("dashboard_show_invoice");
    expect(keys).toContain("dashboard_show_top_due_invoices");
    expect(keys).toContain("dashboard_show_zone_due");
    expect(keys).not.toContain("dashboard_show_client");
    expect(keys).not.toContain("dashboard_show_reseller");
  });
});
