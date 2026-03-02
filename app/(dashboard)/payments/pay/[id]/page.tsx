import PaymentPay from "@/components/payments/payment-pay";
import i18n from "i18next";
import { Metadata } from "next";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function PaymentPayPage({ params }: Props) {
    const { id } = await params;
    return <PaymentPay paymentId={id} />;
}

export const metadata: Metadata = {
    title: i18n.t("payment.pay_title"),
    description: "Pay Payment",
};
