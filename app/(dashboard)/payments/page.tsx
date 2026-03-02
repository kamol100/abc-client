import PaymentTable from "@/components/payments/payment-table";
import i18n from "i18next";
import { Metadata } from "next";

export default async function Payments() {
    return <PaymentTable />;
}

export const metadata: Metadata = {
    title: i18n.t("payment.title_plural"),
    description: "Payments",
};
