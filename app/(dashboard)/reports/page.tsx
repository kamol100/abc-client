import { Metadata } from "next";
import ReportsView from "@/components/reports/reports-view";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = {
    title: t("menu.reports.title"),
};

export default function ReportsPage() {
    return <ReportsView />;
}
