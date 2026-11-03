import { NotificationSettings } from "@/components/settings/notification-settings";
import { t } from "@/lib/i18n/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: t("menu.settings.notifications.title"),
};

export default function NotificationSettingsPage() {
    return <NotificationSettings />;
}
