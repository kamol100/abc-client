import { Metadata } from "next";
import NewClientReports from "@/components/reports/new-client-report";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = {
    title: t("new_client_report.title"),
    description: t("new_client_report.title"),
};

export default function NewClientReportsPage() {
    return <NewClientReports />;
}
