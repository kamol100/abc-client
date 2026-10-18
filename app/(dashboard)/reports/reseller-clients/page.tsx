import { Metadata } from "next";
import ClientTable from "@/components/clients/client-table";
import { t } from "@/lib/i18n/server";

type Props = {
    searchParams: Promise<{ created_at?: string | string[] }>;
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: t("menu.reports.reseller_clients.title"),
};

export default async function ResellerClientsReportPage({ searchParams }: Props) {
    const { created_at: createdAt } = await searchParams;
    const createdAtFilter = Array.isArray(createdAt) ? createdAt[0] : createdAt;

    return <ClientTable variant="reseller-clients" createdAt={createdAtFilter} />;
}
