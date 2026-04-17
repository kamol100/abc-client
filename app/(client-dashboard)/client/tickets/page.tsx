import { Metadata } from "next";
import { t } from "@/lib/i18n/server";
import ClientTicketsTable from "@/components/client-area/tickets/client-tickets-table";

export const metadata: Metadata = {
  title: t("ticket.title_plural"),
};

export default function ClientTicketsPage() {
  return <ClientTicketsTable />;
}
