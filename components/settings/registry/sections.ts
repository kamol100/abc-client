/**
 * WHERE settings appear.
 *
 * A section is either a settings page (/settings/<name>) or a quick dialog
 * opened from the ⚙ button on a list page. Both have the same shape: a title,
 * a description and groups of setting keys in display order. A key may appear
 * in several sections; its value is shared.
 */

import { DASHBOARD_VISIBILITY_ITEMS } from "@/components/dashboard/dashboard-visibility";
import type { SettingKey } from "@/components/settings/registry/fields";
import {
  LIST_PAGES,
  LIST_PAGE_IDS,
  filterPositionKey,
  listSettingsSection,
  type ListPageId,
  type ListSettingsSectionName,
} from "@/components/data-table/toolbar/list-pages";

export type SettingsGroup = {
  /** Optional heading above the group (translation key). */
  title?: string;
  keys: SettingKey[];
};

export type SettingsSection = {
  title: string;
  description: string;
  groups: SettingsGroup[];
  /** Section-wide rule: "sms-gateway" locks SMS sending switches until a gateway is active. */
  guard?: "sms-gateway";
  /** Shown when the user may see none of the settings (translation key). */
  emptyText?: string;
};

const CLIENT_KEYS: SettingKey[] = [
  "payment_deadline",
  "auto_inactive_client_invoice_due",
  "auto_inactive_client_time",
  "client_view_open_on_new_tab",
  "client_edit_open_on_new_tab",
  "create_invoice_billing_type_auto",
];

const PREFIX_KEYS = [
  "invoice_prefix",
  "pid_prefix",
  "expense_id_prefix",
  "product_code_prefix",
  "ticket_code_prefix",
] as const satisfies readonly SettingKey[];

const SMS_SECTION: SettingsSection = {
  title: "settings.sections.sms.title",
  description: "settings.sections.sms.description",
  guard: "sms-gateway",
  groups: [
    {
      title: "settings.groups.sms_client_events",
      keys: ["sms_after_client_create", "sms_after_client_activated", "sms_after_client_deactivated", "sms_after_payment_received"],
    },
    {
      title: "settings.groups.sms_invoices",
      keys: [
        "sms_after_manual_invoice_generate",
        "sms_after_auto_invoice_generate_client",
        "sms_after_auto_invoice_paid_from_wallet",
        "sms_auto_invoice_schedule",
      ],
    },
    {
      title: "settings.groups.due_reminders",
      keys: [
        "sms_auto_invoice_due_reminder",
        "invoice_due_reminder_channel",
        "invoice_due_reminder_voice_campaign_name",
        "voice_call_invoice_reminder",
        "sms_invoice_reminder_before_day",
      ],
    },
  ],
};

const OLT_SECTION: SettingsSection = {
  title: "settings.sections.olt.title",
  description: "settings.sections.olt.description",
  groups: [{ keys: ["olt_poll_interval", "onu_rx_power_low_dbm"] }],
};

const TELEGRAM_SECTION: SettingsSection = {
  title: "settings.sections.telegram.title",
  description: "settings.sections.telegram.description",
  groups: [{ keys: ["telegram_bot_token"] }],
};

/**
 * The page's own settings, shown above the filter setting in its ⚙ dialog.
 * A page not listed here has only the filter setting.
 */
const LIST_PAGE_GROUPS: Partial<Record<ListPageId, SettingsGroup[]>> = {
  clients: [{ keys: CLIENT_KEYS }],
  invoices: [{ keys: ["invoice_prefix"] }],
  payments: [{ keys: ["pid_prefix"] }],
  expenses: [{ keys: ["expense_id_prefix"] }],
  products: [{ keys: ["product_code_prefix"] }],
  tickets: [{ keys: ["ticket_code_prefix"] }],
  olts: OLT_SECTION.groups,
  telegram: TELEGRAM_SECTION.groups,
};

/** The ⚙ dialog of a list page: its own settings, then where its filter opens. */
function listSection(page: ListPageId): SettingsSection {
  return {
    title: LIST_PAGES[page],
    description: "settings.sections.list_page.description",
    groups: [
      ...(LIST_PAGE_GROUPS[page] ?? []),
      { title: "settings.groups.filter", keys: [filterPositionKey(page)] },
    ],
  };
}

const LIST_SECTIONS = Object.fromEntries(
  LIST_PAGE_IDS.map((page) => [listSettingsSection(page), listSection(page)]),
) as Record<ListSettingsSectionName, SettingsSection>;

export const SECTIONS = {
  // ── Settings pages ─────────────────────────────────────────────────
  general: {
    title: "settings.sections.general.title",
    description: "settings.sections.general.description",
    groups: [
      { title: "settings.groups.id_prefixes", keys: [...PREFIX_KEYS] },
      { title: "settings.groups.clients", keys: CLIENT_KEYS },
    ],
  },
  dashboard: {
    title: "settings.sections.dashboard.title",
    description: "settings.sections.dashboard.description",
    emptyText: "settings.sections.dashboard.empty",
    groups: [{ keys: DASHBOARD_VISIBILITY_ITEMS.map((item) => item.settingKey) }],
  },
  sms: SMS_SECTION,
  map: {
    title: "settings.sections.map.title",
    description: "settings.sections.map.description",
    groups: [{ keys: ["gmap_api", "lat", "lon"] }],
  },
  monitoring: {
    title: "settings.sections.monitoring.title",
    description: "settings.sections.monitoring.description",
    groups: [{ keys: ["device_monitor_interval", "device_monitor_fail_threshold"] }],
  },
  olt: OLT_SECTION,
  telegram: TELEGRAM_SECTION,

  // ── ⚙ dialogs on list pages (one per LIST_PAGES id) ─────────────────
  ...LIST_SECTIONS,
} satisfies Record<string, SettingsSection>;

export type SectionName = keyof typeof SECTIONS;

/** All setting keys of a section, in display order. */
export function sectionKeys(section: SectionName): SettingKey[] {
  const config: SettingsSection = SECTIONS[section];
  return config.groups.flatMap((group) => group.keys);
}
