import { Metadata } from "next";
import { SettingsPanel } from "@/components/settings/ui/settings-panel";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = {
    title: t("menu.settings.sms.title"),
};

export default function SmsSettingsPage() {
    return <SettingsPanel section="sms" />;
}
