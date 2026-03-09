import { Metadata } from "next";
import FundTable from "@/components/funds/fund-table";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = {
    title: t("menu.reports.funds.title"),
};

export default function FundReportsPage() {
    return (
        <FundTable
            toolbarTitleKey="menu.reports.funds.title"
            showCreateAction={false}
        />
    );
}
