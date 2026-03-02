import PaymentForm from "@/components/payments/payment-form";
import i18n from "i18next";
import { Metadata } from "next";

export default async function PaymentCreate() {
    return <PaymentForm />;
}

export const metadata: Metadata = {
    title: i18n.t("payment.create_title"),
    description: "Create Payment",
};
