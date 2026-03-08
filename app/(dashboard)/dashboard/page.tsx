import type { Metadata } from "next";
import DashboardOverview from "@/components/dashboard/dashboard-overview";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: t("menu.dashboard.title"),
  description: t("menu.dashboard.title"),
};

export default function DashboardPage() {
  return <DashboardOverview />;
}
