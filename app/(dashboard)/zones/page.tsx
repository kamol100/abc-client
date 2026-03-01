import ZoneTable from "@/components/zones/zone-table";
import i18n from "i18next";
import { Metadata } from "next";

export default async function Zones() {
    return <ZoneTable />;
}

export const metadata: Metadata = {
    title: i18n.t("zones") || "Zones",
    description: i18n.t("zones_description") || "Zones Description",
};