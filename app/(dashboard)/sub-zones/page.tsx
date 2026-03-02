import SubZoneTable from "@/components/sub-zones/sub-zone-table";
import i18n from "i18next";
import { Metadata } from "next";

export default async function SubZones() {
    return <SubZoneTable />;
}

export const metadata: Metadata = {
    title: i18n.t("sub_zone.title") || "Sub Zones",
    description: i18n.t("sub_zone.title") || "Sub Zones",
};