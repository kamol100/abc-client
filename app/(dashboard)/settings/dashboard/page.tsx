import { Metadata } from "next";
import SettingsForm from "@/components/settings/settings-form";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = {
    title: t("menu.settings.dashboard.title"),
};

export default function DashboardSettingsPage() {
    return <SettingsForm section="dashboard" />;
}
