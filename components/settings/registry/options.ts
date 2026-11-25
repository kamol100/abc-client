/** Option lists used by dropdown settings. Labels are translation keys or plain numbers. */

import type { SettingOption } from "@/components/settings/registry/define";
import { FILTER_POSITIONS } from "@/components/data-table/toolbar/list-pages";

const pad = (n: number) => String(n).padStart(2, "0");

const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);

/** Day of the month used as the default client payment deadline. */
export const PAYMENT_DEADLINE_RANGE = { min: 1, max: 30, fallback: 11 } as const;
/** Hour of day (00–23) for the client auto inactive setting. */
export const CLIENT_AUTO_INACTIVE_TIME_RANGE = { min: 0, max: 23, fallback: 12 } as const;
/** The API accepts −40 … −10 dBm (default −27). */
export const ONU_RX_LOW_DBM_RANGE = { min: -40, max: -10 } as const;

/** 01 … 30 */
export const PAYMENT_DEADLINE_OPTIONS: SettingOption[] = range(PAYMENT_DEADLINE_RANGE.min, PAYMENT_DEADLINE_RANGE.max)
  .map((day) => ({ value: day, label: pad(day) }));

/** 00 … 23 */
export const CLIENT_AUTO_INACTIVE_TIME_OPTIONS: SettingOption[] = range(
  CLIENT_AUTO_INACTIVE_TIME_RANGE.min,
  CLIENT_AUTO_INACTIVE_TIME_RANGE.max,
).map((hour) => ({ value: hour, label: pad(hour) }));

/** 07:00 … 20:00, when the auto invoice SMS goes out. */
export const SMS_SCHEDULE_OPTIONS: SettingOption[] = range(7, 20)
  .map((hour) => ({ value: hour, label: `settings.options.schedule_${pad(hour)}` }));

/** Only SMS today; voice reminders use their own switch. */
export const REMINDER_CHANNEL_OPTIONS: SettingOption[] = [
  { value: "sms", label: "settings.options.reminder_channel_sms" },
];

/** 1 … 15 days before the payment deadline. */
export const REMINDER_DAY_OPTIONS: SettingOption[] = range(1, 15)
  .map((day) => ({ value: day, label: `settings.options.reminder_day_${day}` }));

/** Minutes between OLT polls (PON ports and ONUs); 0 = off. Same values as the API's monitoring.olt.poll_intervals. */
export const OLT_POLL_INTERVAL_OPTIONS: SettingOption[] = [0, 5, 15, 30]
  .map((minutes) => ({ value: minutes, label: `settings.options.olt_poll_interval_${minutes}` }));

/** Minutes between automatic device checks; 0 = off. */
export const MONITOR_INTERVAL_OPTIONS: SettingOption[] = [0, 1, 2, 5, 10, 15, 30, 60]
  .map((minutes) => ({ value: minutes, label: `settings.options.monitor_interval_${minutes === 0 ? "off" : minutes}` }));

/** Failed checks in a row before a device is marked down. */
export const MONITOR_FAIL_THRESHOLD_OPTIONS: SettingOption[] = range(1, 10)
  .map((count) => ({ value: count, label: `settings.options.monitor_fail_threshold_${count}` }));

/** Where a list page's desktop filter opens. */
export const FILTER_POSITION_OPTIONS: SettingOption[] = FILTER_POSITIONS.map((position) => ({
  value: position,
  label: `settings.options.filter_position_${position}`,
}));
