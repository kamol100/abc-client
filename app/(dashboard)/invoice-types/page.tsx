import { Metadata } from "next";
import InvoiceTypeTable from "@/components/invoice-type/invoice-type-table";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = {
    title: t("invoice_type.title_plural"),
};

export default function InvoiceTypesPage() {
    return <InvoiceTypeTable />;
}
