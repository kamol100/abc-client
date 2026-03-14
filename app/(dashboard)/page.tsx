import type { Metadata } from "next";
import DashboardOverviewClient from "@/components/dashboard/dashboard-overview-client";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: t("menu.dashboard.title"),
  description: t("menu.dashboard.title"),
};

export default function DashboardHomePage() {
  return <DashboardOverviewClient />;
}
