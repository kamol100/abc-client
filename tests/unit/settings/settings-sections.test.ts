import { describe, expect, it } from "vitest";
import { DASHBOARD_VISIBILITY_ITEMS } from "@/components/dashboard/dashboard-visibility";
import { SETTING_KEYS } from "@/components/settings/registry/fields";
import { SECTIONS, sectionKeys, type SectionName } from "@/components/settings/registry/sections";

const PREFIXES = ["invoice_prefix", "pid_prefix", "expense_id_prefix", "product_code_prefix", "ticket_code_prefix"];
const CLIENT = [
  "payment_deadline",
  "auto_inactive_client_invoice_due",
  "auto_inactive_client_time",
  "client_view_open_on_new_tab",
  "client_edit_open_on_new_tab",
  "create_invoice_billing_type_auto",
];

// Order on each page and dialog, as shown before the registry refactor.
const EXPECTED: Record<SectionName, string[]> = {
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
  clients: CLIENT,
  invoice_prefix: ["invoice_prefix"],
  pid_prefix: ["pid_prefix"],
  expense_id_prefix: ["expense_id_prefix"],
  product_code_prefix: ["product_code_prefix"],
  ticket_code_prefix: ["ticket_code_prefix"],
};

describe("settings sections", () => {
  it.each(Object.keys(SECTIONS) as SectionName[])("%s shows its settings in order", (name) => {
    expect(sectionKeys(name)).toEqual(EXPECTED[name]);
  });

  it("places every setting somewhere, except the per-reseller one", () => {
    const placed = new Set((Object.keys(SECTIONS) as SectionName[]).flatMap(sectionKeys));
    expect(SETTING_KEYS.filter((key) => !placed.has(key))).toEqual(["auto_inactive_reseller_client_termination_date"]);
  });

  it("uses a prefix dialog title and description per prefix", () => {
    for (const key of PREFIXES) {
      const section = SECTIONS[key as SectionName];
      expect(section.title).toBe(`settings.fields.${key}.label`);
      expect(section.description).toBe("settings.common.prefix_description");
    }
  });
});
