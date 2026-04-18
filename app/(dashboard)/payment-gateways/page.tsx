import { Metadata } from "next";
import { t } from "@/lib/i18n/server";
import PaymentGatewaysContent from "./content";

type Props = {
  searchParams: Promise<{ id?: string }>;
};

export const metadata: Metadata = {
  title: t("payment_gateway.title_plural"),
  description: t("payment_gateway.title_plural"),
};

export default async function PaymentGatewaysPage({ searchParams }: Props) {
  const { id } = await searchParams;
  return <PaymentGatewaysContent initialGatewayId={id} />;
}
