import VendorTable from "@/components/vendors/vendor-table";
import i18n from "i18next";
import { Metadata } from "next";

export default async function Vendors() {
    return <VendorTable />;
}

export const metadata: Metadata = {
    title: i18n.t("vendors") || "Vendors",
    description: i18n.t("vendors_description") || "Vendors Description",
};