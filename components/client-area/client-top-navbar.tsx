"use client";

import { FC, useMemo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import { LanguageSwitcher } from "@/components/language-switcher";
import ThemeCustomize from "@/components/theme-customizer";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ClientProfile } from "@/components/client-area/client-profile";

const CLIENT_DASHBOARD_ROUTE = "/client/dashboard";

const CLIENT_ROUTE_TO_MENU_KEY: Record<string, string> = {
  "/client/dashboard": "menu.dashboard.title",
  "/client/invoices": "menu.invoice.title",
  "/client/pay": "menu.payment_due.title",
  "/client/payments": "menu.payments.title",
  "/client/tickets": "menu.tickets.title",
  "/client/history": "menu.history.title",
};

function getPageTitleKey(pathname: string): string {
  const normalized = pathname.replace(/\/$/, "") || "/";
  return CLIENT_ROUTE_TO_MENU_KEY[normalized] ?? "menu.dashboard.title";
}

function isClientDashboardRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/$/, "") || "/";
  return normalized === CLIENT_DASHBOARD_ROUTE;
}

function ClientBreadcrumb() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const { isDashboard, pageTitleKey } = useMemo(
    () => ({
      isDashboard: isClientDashboardRoute(pathname),
      pageTitleKey: getPageTitleKey(pathname),
    }),
    [pathname]
  );
  const pageTitle = t(pageTitleKey);

  if (isDashboard) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
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
            <Link href={CLIENT_DASHBOARD_ROUTE}>{t("menu.dashboard.title")}</Link>
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

export const ClientTopNavbar: FC = () => {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1 hidden md:flex" />
        <Separator orientation="vertical" className="mr-2 h-4 hidden md:block" />
        <ClientBreadcrumb />
      </div>
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeCustomize />
        <ClientProfile />
      </div>
    </header>
  );
};

export default ClientTopNavbar;
