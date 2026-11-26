/**
 * EVERY company setting, defined once.
 *
 * The key is the name the API stores. The label is always the translation
 * `settings.fields.<key>.label` (and `.placeholder` for empty text/dropdowns).
 *
 * To add a setting:
 *   1. add one line below with toggle(), select(), text() or number(),
 *   2. put its key in a section in sections.ts (a page or a ⚙ dialog),
 *   3. add `settings.fields.<key>.label` to public/lang/en.json and bn.json.
 * How it is shown, read and saved all follows from this one entry.
 */

import {
  DASHBOARD_VISIBILITY_ITEMS,
  isDashboardItemVisible,
  type DashboardVisibilitySettingKey,
} from "@/components/dashboard/dashboard-visibility";
import { number, select, text, toggle, type SelectSetting, type SettingDefinition, type ToggleSetting } from "@/components/settings/registry/define";
import {
  CLIENT_AUTO_INACTIVE_TIME_OPTIONS,
  CLIENT_AUTO_INACTIVE_TIME_RANGE,
  MONITOR_FAIL_THRESHOLD_OPTIONS,
  MONITOR_INTERVAL_OPTIONS,
  OLT_POLL_INTERVAL_OPTIONS,
  ONU_RX_LOW_DBM_RANGE,
  PAYMENT_DEADLINE_OPTIONS,
  PAYMENT_DEADLINE_RANGE,
  REMINDER_CHANNEL_OPTIONS,
  REMINDER_DAY_OPTIONS,
  SMS_SCHEDULE_OPTIONS,
  FILTER_POSITION_OPTIONS,
} from "@/components/settings/registry/options";
import {
  DEFAULT_FILTER_POSITION,
  LIST_PAGE_IDS,
  filterPositionKey,
  toFilterPosition,
  type FilterPositionSettingKey,
} from "@/components/data-table/toolbar/list-pages";
import {
  CLIENT_VIEW_MODE_OPTIONS,
  DEFAULT_CLIENT_VIEW_MODE,
  toClientViewMode,
} from "@/components/clients/view-mode/client-view-mode";

/** One "show on dashboard" switch per dashboard card. On until turned off; hidden without the card's permission. */
const dashboardSettings = Object.fromEntries(
  DASHBOARD_VISIBILITY_ITEMS.map((item) => [
    item.settingKey,
    toggle({ default: true, permission: item.permission, read: isDashboardItemVisible }),
  ]),
) as Record<DashboardVisibilitySettingKey, ToggleSetting>;

/** One "filter position" per list page (inline in the toolbar, or a panel below it). */
const filterPositionSettings = Object.fromEntries(
  LIST_PAGE_IDS.map((page) => [
    filterPositionKey(page),
    select({
      options: FILTER_POSITION_OPTIONS,
      default: DEFAULT_FILTER_POSITION,
      strict: true,
      read: toFilterPosition,
      label: "settings.fields.filter_position.label",
    }),
  ]),
) as Record<FilterPositionSettingKey, SelectSetting>;

export const SETTINGS = {
  // ── General: ID prefixes ───────────────────────────────────────────
  invoice_prefix: text(),
  pid_prefix: text(),
  expense_id_prefix: text({ default: "EXP" }),
  product_code_prefix: text({ default: "PRO" }),
  ticket_code_prefix: text({ default: "TKT" }),

  // ── General: clients ───────────────────────────────────────────────
  payment_deadline: select({ options: PAYMENT_DEADLINE_OPTIONS, default: PAYMENT_DEADLINE_RANGE.fallback, strict: true }),
  auto_inactive_client_invoice_due: toggle(),
  auto_inactive_client_time: select({
    options: CLIENT_AUTO_INACTIVE_TIME_OPTIONS,
    default: CLIENT_AUTO_INACTIVE_TIME_RANGE.fallback,
    strict: true,
    visibleWhen: { key: "auto_inactive_client_invoice_due", equals: true },
  }),
  // Replaces the on/off "client_view_open_on_new_tab"; the API migration copies "on" to new_tab.
  client_view_open_mode: select({
    options: CLIENT_VIEW_MODE_OPTIONS,
    default: DEFAULT_CLIENT_VIEW_MODE,
    strict: true,
    read: toClientViewMode,
  }),
  client_edit_open_on_new_tab: toggle(),
  create_invoice_billing_type_auto: toggle(),

  // ── SMS: client events ─────────────────────────────────────────────
  sms_after_client_create: toggle(),
  sms_after_client_activated: toggle(),
  sms_after_client_deactivated: toggle(),
  sms_after_payment_received: toggle(),

  // ── SMS: invoices ──────────────────────────────────────────────────
  sms_after_manual_invoice_generate: toggle(),
  sms_after_auto_invoice_generate_client: toggle(),
  sms_after_auto_invoice_paid_from_wallet: toggle(),
  sms_auto_invoice_schedule: select({ options: SMS_SCHEDULE_OPTIONS }),

  // ── SMS: due reminders ─────────────────────────────────────────────
  sms_auto_invoice_due_reminder: toggle(),
  invoice_due_reminder_channel: select({
    options: REMINDER_CHANNEL_OPTIONS,
    // "voice" may still be stored by older companies; anything else is SMS.
    read: (raw) => (raw === "voice" ? "voice" : "sms"),
  }),
  invoice_due_reminder_voice_campaign_name: text(),
  voice_call_invoice_reminder: toggle(),
  sms_invoice_reminder_before_day: select({ options: REMINDER_DAY_OPTIONS }),

  // ── Map ────────────────────────────────────────────────────────────
  gmap_api: text(),
  lat: number(),
  lon: number(),

  // ── Device monitoring ──────────────────────────────────────────────
  device_monitor_interval: select({ options: MONITOR_INTERVAL_OPTIONS, default: 0 }),
  device_monitor_fail_threshold: select({ options: MONITOR_FAIL_THRESHOLD_OPTIONS, default: 2 }),

  // ── OLT polling ────────────────────────────────────────────────────
  olt_poll_interval: select({ options: OLT_POLL_INTERVAL_OPTIONS, default: 0 }),
  onu_rx_power_low_dbm: number(ONU_RX_LOW_DBM_RANGE),

  // ── Telegram ───────────────────────────────────────────────────────
  telegram_bot_token: text(),

  // ── Resellers (edited from the reseller list, per reseller) ─────────
  auto_inactive_reseller_client_termination_date: toggle(),

  // ── Dashboard cards ────────────────────────────────────────────────
  ...dashboardSettings,

  // ── List pages: where the desktop filter opens ─────────────────────
  ...filterPositionSettings,
} satisfies Record<string, SettingDefinition>;

export type SettingKey = keyof typeof SETTINGS;

export const SETTING_KEYS = Object.keys(SETTINGS) as SettingKey[];

/** The definition of one setting. */
export function fieldOf(key: SettingKey): SettingDefinition {
  return SETTINGS[key];
}

/** Translation key of a setting's label. */
export function settingLabelKey(key: SettingKey): string {
  return SETTINGS[key].label ?? `settings.fields.${key}.label`;
}

export function isSettingKey(key: string): key is SettingKey {
  return Object.prototype.hasOwnProperty.call(SETTINGS, key);
}
