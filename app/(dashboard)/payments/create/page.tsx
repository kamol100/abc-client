import PaymentForm from "@/components/payments/payment-form";
import { t } from "@/lib/i18n/server";
import { Metadata } from "next";

export default async function PaymentCreate() {
    return <PaymentForm />;
}

export const metadata: Metadata = {
    title: t("payment.create_title"),
    description: "Create Payment",
};
