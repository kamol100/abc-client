import { DASHBOARD_CARD_PERMISSIONS } from "@/components/dashboard/dashboard-constants";

export const DASHBOARD_VISIBILITY_ITEMS = [
  {
    id: "client",
    settingKey: "dashboard_show_client",
    permission: DASHBOARD_CARD_PERMISSIONS.client,
  },
  {
    id: "reseller",
    settingKey: "dashboard_show_reseller",
    permission: DASHBOARD_CARD_PERMISSIONS.reseller,
  },
  {
    id: "invoice",
    settingKey: "dashboard_show_invoice",
    permission: DASHBOARD_CARD_PERMISSIONS.invoice,
  },
  {
    id: "invoicePaid",
    settingKey: "dashboard_show_invoice_paid",
    permission: DASHBOARD_CARD_PERMISSIONS.invoicePaid,
  },
  {
    id: "invoiceDues",
    settingKey: "dashboard_show_invoice_dues",
    permission: DASHBOARD_CARD_PERMISSIONS.invoiceDues,
  },
  {
    id: "expense",
    settingKey: "dashboard_show_expense",
    permission: DASHBOARD_CARD_PERMISSIONS.expense,
  },
  {
    id: "fund",
    settingKey: "dashboard_show_fund",
    permission: DASHBOARD_CARD_PERMISSIONS.fund,
  },
  {
    id: "ticket",
    settingKey: "dashboard_show_ticket",
    permission: DASHBOARD_CARD_PERMISSIONS.ticket,
  },
  {
    id: "productStock",
    settingKey: "dashboard_show_product_stock",
    permission: DASHBOARD_CARD_PERMISSIONS.productStock,
  },
  {
    id: "topDueInvoices",
    settingKey: "dashboard_show_top_due_invoices",
    permission: null,
  },
  {
    id: "zoneDue",
    settingKey: "dashboard_show_zone_due",
    permission: null,
  },
  {
    id: "invoiceExpenseGraph",
    settingKey: "dashboard_show_invoice_expense_graph",
    permission: DASHBOARD_CARD_PERMISSIONS.invoiceExpenseGraph,
  },
] as const;

export type DashboardVisibilityItem = (typeof DASHBOARD_VISIBILITY_ITEMS)[number];
export type DashboardVisibilityId = DashboardVisibilityItem["id"];
export type DashboardVisibilitySettingKey = DashboardVisibilityItem["settingKey"];
export type DashboardVisibilityMap = Record<DashboardVisibilityId, boolean>;

const DASHBOARD_VISIBILITY_SETTING_KEYS: ReadonlySet<string> = new Set(
  DASHBOARD_VISIBILITY_ITEMS.map((item) => item.settingKey),
);

export function isDashboardVisibilitySettingKey(key: string): key is DashboardVisibilitySettingKey {
  return DASHBOARD_VISIBILITY_SETTING_KEYS.has(key);
}

export function isDashboardItemVisible(value: unknown): boolean {
  if (value === null || value === undefined || value === "") {
    return true;
  }

  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "0" || normalized === "false") return false;
    if (normalized === "1" || normalized === "true") return true;
  }

  return true;
}

export function resolveDashboardVisibility(
  hasPermission: (permission: string) => boolean,
  settings: Partial<Record<string, unknown>> | null | undefined,
): DashboardVisibilityMap {
  const visibility = {} as DashboardVisibilityMap;

  for (const item of DASHBOARD_VISIBILITY_ITEMS) {
    const allowed = item.permission === null || hasPermission(item.permission);
    visibility[item.id] = allowed && isDashboardItemVisible(settings?.[item.settingKey]);
  }

  return visibility;
}
