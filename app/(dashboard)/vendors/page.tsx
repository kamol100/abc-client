import VendorTable from "@/components/vendors/vendor-table";
import { t } from "@/lib/i18n/server";
import { Metadata } from "next";

export default async function Vendors() {
    return <VendorTable />;
}

export const metadata: Metadata = {
    title: t("vendor.title"),
    description: t("vendor.title"),
};