import ClientInvoiceTable from "@/components/invoices/client-invoice-table";
import { t } from "@/lib/i18n/server";
import { Metadata } from "next";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function ClientInvoicesPage({ params }: Props) {
    const { id } = await params;
    return <ClientInvoiceTable clientId={id} />;
}

export const metadata: Metadata = {
    title: t("invoice.client_history.title"),
};
