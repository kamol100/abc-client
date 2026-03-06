import { Metadata } from "next";
import { t } from "@/lib/i18n/server";
import ResellerTable from "@/components/resellers/reseller-table";

export const metadata: Metadata = {
    title: t("reseller.title_plural"),
    description: t("reseller.title_plural"),
};

export default function ResellersPage() {
    return <ResellerTable />;
}
