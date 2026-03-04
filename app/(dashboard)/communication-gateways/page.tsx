import { Metadata } from "next";
import { t } from "@/lib/i18n/server";
import CommunicationGatewaysContent from "./content";

type Props = {
  searchParams: Promise<{ id?: string }>;
};

export const metadata: Metadata = {
  title: t("communication_gateway.title_plural"),
  description: t("communication_gateway.title_plural"),
};

export default async function CommunicationGatewaysPage({ searchParams }: Props) {
  const { id } = await searchParams;
  const gatewayId = id ? Number(id) : undefined;
  return (
    <CommunicationGatewaysContent
      initialGatewayId={Number.isFinite(gatewayId) ? gatewayId : undefined}
    />
  );
}
