import type { Metadata } from "next";
import ClientMapsTable from "@/components/maps/client-maps-table";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: t("menu.maps.client_maps.title"),
  description: t("menu.maps.client_maps.title"),
};

export default async function ClientMapsPage() {
  return <ClientMapsTable />;
}
