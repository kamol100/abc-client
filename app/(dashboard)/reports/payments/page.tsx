import { Metadata } from "next";
import PaymentTable from "@/components/payments/payment-table";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = {
    title: t("menu.reports.payments.title"),
};

export default function PaymentReportsPage() {
    return <PaymentTable toolbarTitleKey="menu.reports.payments.title" />;
}
