"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

/**
 * Maps route pathnames to menu translation keys (menu.*.title).
 * Keeps breadcrumb labels in sync with sidebar menu without hardcoding page names.
 */
const ROUTE_TO_MENU_KEY: Record<string, string> = {
  "/": "menu.dashboard.title",
  "/dashboard": "menu.dashboard.title",
  "/clients": "menu.clients.title",
  "/reports": "menu.reports.title",
  "/reports/income-expense": "menu.reports.income_expense.title",
  "/reports/funds": "menu.reports.funds.title",
  "/reports/invoices": "menu.reports.invoices.title",
  "/reports/payments": "menu.reports.payments.title",
  "/reports/expenses": "menu.reports.expenses.title",
  "/reports/product-in": "menu.reports.product_in.title",
  "/reports/product-out": "menu.reports.product_out.title",
  "/client/tickets": "menu.tickets.title",
  "/client/invoices": "menu.invoice.title",
  "/client/pay": "menu.payment_due.title",
  "/client/payments": "menu.payments.title",
  "/client-maps": "menu.maps.client_maps.title",
  "/tj-box-maps": "menu.maps.tj_box_maps.title",
  "/tj-boxes": "menu.maps.tj_boxes.title",
  "/invoices": "menu.invoice.title",
  "/invoice-types": "menu.invoice.type.title",
  "/payments": "menu.payments.title",
  "/products": "menu.products.title",
  "/products/reports": "menu.products.reports.title",
  "/product-categories": "menu.products.category.title",
  "/unit-types": "menu.products.unit_types.title",
  "/expenses": "menu.expense.title",
  "/expense-categories": "menu.expense.category.title",
  "/expense-types": "menu.expense.types.title",
  "/tickets": "menu.support_tickets.title",
  "/subjects": "menu.support_tickets.subjects.title",
  "/tags": "menu.support_tickets.tags.title",
  "/resellers": "menu.resellers.title",
  "/communication-gateways": "menu.communication.gateways.title",
  "/communication-queue": "menu.communication.queue.title",
  "/communication-logs": "menu.communication.logs.title",
  "/sms-send": "menu.sms.send.title",
  "/sms-templates": "menu.sms.templates.title",
  "/networks": "menu.networks.title",
  "/devices": "menu.networks.devices.title",
  "/device-types": "menu.networks.device_type.title",
  "/mikrotik-commands": "menu.mikrotik_commands.title",
  "/activity-logs": "menu.activity_logs.title",
  "/histories": "menu.history.title",
  "/zones": "menu.zones.title",
  "/sub-zones": "menu.zones.sub_zone.title",
  "/mikrotik-packages": "menu.packages.mikrotik_package.title",
  "/client-packages": "menu.packages.client_package.title",
  "/reseller-packages": "menu.packages.reseller_package.title",
  "/vendors": "menu.vendors.title",
  "/funds": "menu.funds.title",
  "/fund-transactions": "menu.funds.transaction.title",
  "/staffs": "menu.staffs.title",
  "/salaries": "menu.staffs.salaries.title",
  "/my-wallets": "menu.wallets.my_wallets.title",
  "/client-wallets": "menu.wallets.client_wallets.title",
  "/users": "menu.users.title",
  "/companies": "menu.companies.title",
  "/import-client": "menu.mikrotik_sync.import.title",
  "/re-sync": "menu.mikrotik_sync.re_sync.title",
  "/roles": "menu.role_permission.roles.title",
  "/permissions": "menu.role_permission.permissions.title",
  "/settings/general": "menu.settings.general.title",
  "/settings/sms": "menu.settings.sms.title",
  "/settings/voice-call": "menu.settings.voice_call.title",
  "/settings/map": "menu.settings.map.title",
  "/settings/payments": "menu.settings.payments.title",
  "/settings/telegram": "menu.settings.telegram.title",
};

/**
 * Dynamic route patterns: pathname is matched against these when no exact
 * ROUTE_TO_MENU_KEY match is found. Use for routes with [id] or other params.
 */
const DYNAMIC_ROUTE_PATTERNS: { pattern: RegExp; key: string }[] = [
  { pattern: /^\/clients\/edit\/[^/]+$/, key: "client.edit_title" },
  { pattern: /^\/resellers\/edit\/[^/]+$/, key: "reseller.edit_title" },
  { pattern: /^\/invoices\/edit\/[^/]+$/, key: "menu.invoice.title" },
  { pattern: /^\/staffs\/edit\/[^/]+$/, key: "menu.staffs.title" },
  { pattern: /^\/salaries\/edit\/[^/]+$/, key: "menu.staffs.salaries.title" },
];

function getPageTitleKey(pathname: string): string {
  const normalized = pathname.replace(/\/$/, "") || "/";
  const exact = ROUTE_TO_MENU_KEY[normalized];
  if (exact) return exact;
  const dynamic = DYNAMIC_ROUTE_PATTERNS.find(({ pattern }) =>
    pattern.test(normalized)
  );
  return dynamic?.key ?? "menu.dashboard.title";
}

function isDashboardRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/$/, "") || "/";
  return normalized === "/" || normalized === "/dashboard";
}

export function DashboardBreadcrumb() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const { isDashboard, pageTitleKey } = useMemo(() => {
    const isDash = isDashboardRoute(pathname);
    const key = getPageTitleKey(pathname);
    return { isDashboard: isDash, pageTitleKey: key };
  }, [pathname]);
  const pageTitle = t(pageTitleKey);

  if (isDashboard) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink asChild>
            <Link href="/">{t("menu.dashboard.title")}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden md:block" />
        <BreadcrumbItem>
          <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
