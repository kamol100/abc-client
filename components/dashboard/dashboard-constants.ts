import { formatMoney } from "@/lib/helper/helper";
import type { DashboardDateFilter } from "./dashboard-type";

export const CLIENT_DATE_FILTER_OPTIONS: ReadonlyArray<{ value: DashboardDateFilter; labelKey: string }> = [
  { value: "all", labelKey: "dashboard.filters.date.all" },
  { value: "this_month", labelKey: "dashboard.filters.date.this_month" },
  { value: "last_month", labelKey: "dashboard.filters.date.last_month" },
  { value: "this_week", labelKey: "dashboard.filters.date.this_week" },
  { value: "last_week", labelKey: "dashboard.filters.date.last_week" },
  { value: "last_15_days", labelKey: "dashboard.filters.date.last_15_days" },
  { value: "today", labelKey: "dashboard.filters.date.today" },
  { value: "this_year", labelKey: "dashboard.filters.date.this_year" },
  { value: "last_year", labelKey: "dashboard.filters.date.last_year" },
];

export const DATE_FILTER_OPTIONS: ReadonlyArray<{ value: DashboardDateFilter; labelKey: string }> = [
  { value: "this_month", labelKey: "dashboard.filters.date.this_month" },
  { value: "last_month", labelKey: "dashboard.filters.date.last_month" },
  { value: "this_week", labelKey: "dashboard.filters.date.this_week" },
  { value: "last_week", labelKey: "dashboard.filters.date.last_week" },
  { value: "last_15_days", labelKey: "dashboard.filters.date.last_15_days" },
  { value: "today", labelKey: "dashboard.filters.date.today" },
  { value: "this_year", labelKey: "dashboard.filters.date.this_year" },
  { value: "last_year", labelKey: "dashboard.filters.date.last_year" },
];

export const CHART_COLORS = ["#2563eb", "#22c55e", "#f59e0b", "#d946ef", "#ef4444"] as const;

export function formatDashboardValue(value: number): string {
  return formatMoney(value, 0);
}
