import { Metadata } from "next";
import ClientTable from "@/components/clients/client-table";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = {
    title: t("client.title_plural"),
};

export default function ClientsPage() {
    return <ClientTable />;
}
