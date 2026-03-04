import TicketTable from "@/components/tickets/ticket-table";
import { t } from "@/lib/i18n/server";
import { Metadata } from "next";

type Props = {
    searchParams: Promise<{ client_id?: string }>;
};

export default async function TicketsPage({ searchParams }: Props) {
    const { client_id } = await searchParams;
    return <TicketTable clientId={client_id} />;
}

export const metadata: Metadata = {
    title: t("ticket.title_plural"),
};
