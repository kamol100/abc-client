import type { Metadata } from "next";
import ClientMaps from "@/components/maps/client-maps";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: t("menu.maps.client_maps.title"),
  description: t("menu.maps.client_maps.title"),
};

export default async function ClientMapsPage() {
  return <ClientMaps />;
}
