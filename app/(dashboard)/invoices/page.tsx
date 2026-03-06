import { Metadata } from "next";
import InvoiceTable from "@/components/invoices/invoice-table";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = {
    title: t("invoice.title_plural"),
};

export default function InvoicesPage() {
    return <InvoiceTable />;
}
