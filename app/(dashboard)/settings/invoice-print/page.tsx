import { InvoicePrintSettingsPage } from "@/components/settings/invoice-print-settings";
import { t } from "@/lib/i18n/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: t("settings.invoice_print.title"),
};

export default function InvoicePrintSettingsRoute() {
    return <InvoicePrintSettingsPage />;
}
