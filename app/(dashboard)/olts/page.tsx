import { Metadata } from "next";
import OltTable from "@/components/olt/olt-table";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = {
    title: t("olt.title_plural"),
};

export default function OltsPage() {
    return <OltTable />;
}
