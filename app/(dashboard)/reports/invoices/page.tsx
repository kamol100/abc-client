import { Metadata } from "next";
import InvoiceTable from "@/components/invoices/invoice-table";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = {
    title: t("menu.reports.invoices.title"),
};

export default function InvoiceReportsPage() {
    return (
        <InvoiceTable
            toolbarTitleKey="menu.reports.invoices.title"
            showCreateAction={false}
        />
    );
}
