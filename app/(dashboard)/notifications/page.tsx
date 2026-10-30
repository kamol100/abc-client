import NotificationTable from "@/components/notifications/notification-table";
import { t } from "@/lib/i18n/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: t("notifications.title"),
};

export default function NotificationsPage() {
    return <NotificationTable />;
}
