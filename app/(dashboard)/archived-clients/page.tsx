import { Metadata } from "next";
import ArchivedClientTable from "@/components/archived-clients/archived-client-table";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = {
    title: t("archived_client.title_plural"),
};

export default function ArchivedClientsPage() {
    return <ArchivedClientTable />;
}
