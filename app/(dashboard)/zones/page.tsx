import ZoneTable from "@/components/zones/zone-table";
import { t } from "@/lib/i18n/server";
import { Metadata } from "next";

export default async function Zones() {
    return <ZoneTable />;
}

export const metadata: Metadata = {
    title: t("zone.title"),
    description: t("zone.title"),
};