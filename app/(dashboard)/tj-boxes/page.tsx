import { Metadata } from "next";
import TjBoxTable from "@/components/tj-box/tj-box-table";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = {
    title: t("tj_box.title_plural"),
};

export default function TjBoxesPage() {
    return <TjBoxTable />;
}
