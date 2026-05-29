import { Metadata } from "next";
import ResellerInvoiceTable from "@/components/reseller-invoice/reseller-invoice-table";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = {
    title: t("reseller_invoice.title_plural"),
};

export default function ResellerInvoicesPage() {
    return <ResellerInvoiceTable />;
}
