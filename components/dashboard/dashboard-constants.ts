import type { DashboardDateFilter } from "@/components/dashboard/dashboard-type";
import { formatMoney } from "@/lib/helper/helper";
import {
  CalendarClock,
  CircleCheck,
  FileText,
  HandCoins,
  Landmark,
  LifeBuoy,
  Network,
  Package,
  Receipt,
  Users,
  type LucideIcon,
} from "lucide-react";

export const DASHBOARD_CARD_PERMISSIONS = {
  client: "dashboard-card.client",
  reseller: "dashboard-card.reseller",
  invoice: "dashboard-card.invoice",
  invoicePaid: "dashboard-card.invoice-paid",
  invoiceDues: "dashboard-card.invoice-dues",
  expense: "dashboard-card.expense",
  fund: "dashboard-card.fund",
  ticket: "dashboard-card.ticket",
  productStock: "dashboard-card.product-stock",
  invoiceExpenseGraph: "dashboard-card.invoice-expense-graph",
} as const;

/** Which of the theme's 5 card colors a card uses (chart colors, or the primary color in Brand only). */
export type DashboardCardTone = 1 | 2 | 3 | 4 | 5;

export interface DashboardCardAccent {
  icon: LucideIcon;
  tone: DashboardCardTone;
}

/**
 * Fixed icon and color slot per summary card. Fixed per card (not by position), so a
 * card keeps its color when permissions hide the cards around it.
 */
export const DASHBOARD_CARD_ACCENTS = {
  client: { icon: Users, tone: 1 },
  reseller: { icon: Network, tone: 2 },
  invoice: { icon: FileText, tone: 3 },
  invoicePaid: { icon: CircleCheck, tone: 4 },
  staffCollection: { icon: HandCoins, tone: 5 },
  invoiceDues: { icon: CalendarClock, tone: 1 },
  expense: { icon: Receipt, tone: 2 },
  fund: { icon: Landmark, tone: 3 },
  ticket: { icon: LifeBuoy, tone: 4 },
  productStock: { icon: Package, tone: 5 },
} as const satisfies Record<string, DashboardCardAccent>;

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
