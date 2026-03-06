import { Metadata } from "next";
import HistoryTable from "@/components/histories/history-table";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = {
    title: t("history.title_plural"),
};

export default function HistoriesPage() {
    return <HistoryTable />;
}
