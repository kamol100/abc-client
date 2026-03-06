import TicketView from "@/components/tickets/ticket-view";
import { t } from "@/lib/i18n/server";
import { Metadata } from "next";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function TicketViewPage({ params }: Props) {
    const { id } = await params;
    return (
        <div className="space-y-6 w-full overflow-auto pr-4">
            <TicketView ticketId={id} />
        </div>
    );
}

export const metadata: Metadata = {
    title: t("ticket.view_title"),
};
