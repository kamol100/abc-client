import { Metadata } from "next";
import { t } from "@/lib/i18n/server";
import ClientTicketView from "@/components/client-area/tickets/client-ticket-view";

type Props = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: t("ticket.view_title"),
};

export default async function ClientTicketViewPage({ params }: Props) {
  const { id } = await params;
  return (
    <div className="space-y-6 w-full overflow-auto pr-4">
      <ClientTicketView ticketId={id} />
    </div>
  );
}
