import { Metadata } from "next";
import { t } from "@/lib/i18n/server";
import InvoiceForm from "@/components/invoices/invoice-form";

type Props = {
    params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
    title: t("invoice.edit.title"),
    description: t("invoice.edit.title"),
};

export default async function InvoiceEditPage({ params }: Props) {
    const { id } = await params;
    return <InvoiceForm mode="edit" data={{ id }} />;
}
