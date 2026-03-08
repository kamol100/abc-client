import type { Metadata } from "next";
import TjBoxMapsTable from "@/components/maps/tj-box-maps-table";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: t("menu.maps.tj_box_maps.title"),
  description: t("menu.maps.tj_box_maps.title"),
};

export default async function TjBoxMapsPage() {
  return <TjBoxMapsTable />;
}
