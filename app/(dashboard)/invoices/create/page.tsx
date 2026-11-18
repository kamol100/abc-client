import { Metadata } from "next";
import { t } from "@/lib/i18n/server";
import { HelpGuideLink } from "@/components/help/help-centre";
import InvoiceForm from "@/components/invoices/invoice-form";

export const metadata: Metadata = {
    title: t("invoice.create.title"),
    description: t("invoice.create.title"),
};

export default function InvoiceCreatePage() {
    return (
        <>
            <HelpGuideLink href="/help/invoices/create" permission="invoices.create" />
            <InvoiceForm />
        </>
    );
}
