import { Metadata } from "next";
import ActivityLogTable from "@/components/activity-logs/activity-log-table";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = {
    title: t("activity_log.title_plural"),
};

export default function ActivityLogsPage() {
    return <ActivityLogTable />;
}
