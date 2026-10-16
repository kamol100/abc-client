import BtrcReports from "@/components/reports/btrc-report";
import { t } from "@/lib/i18n/server";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: t("btrc.title"),
    description: t("btrc.title"),
};

export default function BtrcReportsPage() {
    return <BtrcReports />;
}
