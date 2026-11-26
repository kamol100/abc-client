import { describe, expect, it } from "vitest";
import { DASHBOARD_VISIBILITY_ITEMS } from "@/components/dashboard/dashboard-visibility";
import { SETTING_KEYS } from "@/components/settings/registry/fields";
import { SECTIONS, sectionKeys, type SectionName } from "@/components/settings/registry/sections";
import { LIST_PAGES, LIST_PAGE_IDS, filterPositionKey, listSettingsSection } from "@/components/data-table/toolbar/list-pages";

const PREFIXES = ["invoice_prefix", "pid_prefix", "expense_id_prefix", "product_code_prefix", "ticket_code_prefix"];
const CLIENT = [
  "payment_deadline",
  "auto_inactive_client_invoice_due",
  "auto_inactive_client_time",
  "client_view_open_mode",
  "client_edit_open_on_new_tab",
  "create_invoice_billing_type_auto",
];

// Each list page's ⚙ dialog: its own settings, then where its filter opens.
const LIST_EXTRA: Record<string, string[]> = {
  clients: CLIENT,
  invoices: ["invoice_prefix"],
  payments: ["pid_prefix"],
  expenses: ["expense_id_prefix"],
  products: ["product_code_prefix"],
  tickets: ["ticket_code_prefix"],
  olts: ["olt_poll_interval", "onu_rx_power_low_dbm"],
  telegram: ["telegram_bot_token"],
};
const LIST_EXPECTED = Object.fromEntries(
  LIST_PAGE_IDS.map((page) => [listSettingsSection(page), [...(LIST_EXTRA[page] ?? []), filterPositionKey(page)]]),
);

// Order on each page and dialog, as shown before the registry refactor.
const EXPECTED = {
  ...LIST_EXPECTED,
  general: [...PREFIXES, ...CLIENT],
  dashboard: DASHBOARD_VISIBILITY_ITEMS.map((item) => item.settingKey),
  sms: [
    "sms_after_client_create",
    "sms_after_client_activated",
    "sms_after_client_deactivated",
    "sms_after_payment_received",
    "sms_after_manual_invoice_generate",
    "sms_after_auto_invoice_generate_client",
    "sms_after_auto_invoice_paid_from_wallet",
    "sms_auto_invoice_schedule",
    "sms_auto_invoice_due_reminder",
    "invoice_due_reminder_channel",
    "invoice_due_reminder_voice_campaign_name",
    "voice_call_invoice_reminder",
    "sms_invoice_reminder_before_day",
  ],
  map: ["gmap_api", "lat", "lon"],
  monitoring: ["device_monitor_interval", "device_monitor_fail_threshold"],
  olt: ["olt_poll_interval", "onu_rx_power_low_dbm"],
  telegram: ["telegram_bot_token"],
} as Record<SectionName, string[]>;

describe("settings sections", () => {
  // অ্যাপের সেটিংস যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «%s shows its settings in order»।
  it.each(Object.keys(SECTIONS) as SectionName[])("Settings section fields: %s shows its settings in order", (name) => {
    expect(sectionKeys(name)).toEqual(EXPECTED[name]);
  });

  // অ্যাপের সেটিংস যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «places every setting somewhere, except the per-reseller one»।
  it("Settings section fields: places every setting somewhere, except the per-reseller one", () => {
    const placed = new Set((Object.keys(SECTIONS) as SectionName[]).flatMap(sectionKeys));
    expect(SETTING_KEYS.filter((key) => !placed.has(key))).toEqual(["auto_inactive_reseller_client_termination_date"]);
  });

  // অ্যাপের সেটিংস যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «titles each list page's ⚙ dialog with the page title»।
  it("Settings section fields: titles each list page's ⚙ dialog with the page title", () => {
    for (const page of LIST_PAGE_IDS) {
      const section = SECTIONS[listSettingsSection(page)];
      expect(section.title).toBe(LIST_PAGES[page]);
      expect(section.description).toBe("settings.sections.list_page.description");
    }
  });
});
