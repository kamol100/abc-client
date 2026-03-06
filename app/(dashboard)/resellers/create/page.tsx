import { Metadata } from "next";
import { t } from "@/lib/i18n/server";
import ResellerForm from "@/components/resellers/reseller-form";

export const metadata: Metadata = {
    title: t("reseller.create_title"),
    description: t("reseller.create_title"),
};

export default function ResellerCreatePage() {
    return <ResellerForm />;
}
