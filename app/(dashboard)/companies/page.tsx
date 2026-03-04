import CompanyTable from "@/components/companies/company-table";
import { t } from "@/lib/i18n/server";
import { Metadata } from "next";

export default async function Companies() {
    return <CompanyTable />;
}

export const metadata: Metadata = {
    title: t("company.title_plural"),
    description: t("company.title_plural"),
};
