import { Metadata } from "next";
import { t } from "@/lib/i18n/server";
import ClientTrafficReport from "@/components/client-area/traffic-report/client-traffic-report";

export const metadata: Metadata = {
  title: t("traffic_report.title"),
};

export default function ClientTrafficReportPage() {
  return <ClientTrafficReport />;
}
