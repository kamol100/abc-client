import PaymentForm from "@/components/payments/payment-form";
import { t } from "@/lib/i18n/server";
import { Metadata } from "next";

type Props = {
    searchParams: Promise<{ client_id?: string }>;
};

export default async function PaymentCreate({ searchParams }: Props) {
    const { client_id } = await searchParams;
    const data = client_id ? { client_id: Number(client_id) } : undefined;

    return <PaymentForm data={data} />;
}

export const metadata: Metadata = {
    title: t("payment.create_title"),
    description: "Create Payment",
};
