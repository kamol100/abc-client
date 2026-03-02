import PaymentForm from "@/components/payments/payment-form";
import { t } from "@/lib/i18n/server";
import { Metadata } from "next";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function PaymentEdit({ params }: Props) {
    const { id } = await params;
    return <PaymentForm mode="edit" data={{ id }} />;
}

export const metadata: Metadata = {
    title: t("payment.edit_title"),
    description: "Edit Payment",
};
