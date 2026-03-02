import SubZoneTable from "@/components/sub-zones/sub-zone-table";
import { t } from "@/lib/i18n/server";
import { Metadata } from "next";

export default async function SubZones() {
    return <SubZoneTable />;
}

export const metadata: Metadata = {
    title: t("sub_zone.title"),
    description: t("sub_zone.title"),
};