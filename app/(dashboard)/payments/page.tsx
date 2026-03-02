import PaymentTable from "@/components/payments/payment-table";
import { t } from "@/lib/i18n/server";
import { Metadata } from "next";

export default async function Payments() {
    return <PaymentTable />;
}

export const metadata: Metadata = {
    title: t("payment.title_plural"),
    description: "Payments",
};
