import { t } from "@/lib/i18n/server";
import type { Metadata } from "next";
import ClientDashboardContent from "./client-dashboard-content";

export const metadata: Metadata = {
  title: t("client_dashboard.title"),
  description: t("client_dashboard.subtitle"),
};

export default function ClientDashboardPage() {
  return <ClientDashboardContent />;
}
