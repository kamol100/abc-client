import PaymentPay from "@/components/payments/payment-pay";
import { t } from "@/lib/i18n/server";
import { Metadata } from "next";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function PaymentPayPage({ params }: Props) {
    const { id } = await params;
    return <PaymentPay paymentId={id} />;
}

export const metadata: Metadata = {
    title: t("payment.pay_title"),
    description: "Pay Payment",
};
