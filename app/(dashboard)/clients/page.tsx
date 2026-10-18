import { Metadata } from "next";
import ClientTable from "@/components/clients/client-table";
import { t } from "@/lib/i18n/server";

type Props = {
    searchParams: Promise<{ created_at?: string | string[] }>;
};

export const metadata: Metadata = {
    title: t("client.title_plural"),
};

export default async function ClientsPage({ searchParams }: Props) {
    const { created_at: createdAt } = await searchParams;
    const createdAtFilter = Array.isArray(createdAt) ? createdAt[0] : createdAt;

    return <ClientTable createdAt={createdAtFilter} />;
}
