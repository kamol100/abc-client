import PaymentForm from "@/components/payments/payment-form";
import i18n from "i18next";
import { Metadata } from "next";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function PaymentEdit({ params }: Props) {
    const { id } = await params;
    return <PaymentForm mode="edit" data={{ id }} />;
}

export const metadata: Metadata = {
    title: i18n.t("payment.edit_title"),
    description: "Edit Payment",
};
