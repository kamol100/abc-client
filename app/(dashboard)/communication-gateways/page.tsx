import { Metadata } from "next";
import { t } from "@/lib/i18n/server";
import CommunicationGatewayTable from "@/components/communication-gateways/communication-gateway-table";

export const metadata: Metadata = {
  title: t("communication_gateway.title_plural"),
  description: t("communication_gateway.title_plural"),
};

export default function CommunicationGatewaysPage() {
  return <CommunicationGatewayTable />;
}
