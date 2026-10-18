import { Metadata } from "next";
import ClientTable from "@/components/clients/client-table";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = {
    title: t("menu.reports.reseller_clients.title"),
};

export default function ResellerClientsReportPage() {
    return <ClientTable variant="reseller-clients" />;
}
