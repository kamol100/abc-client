import { Metadata } from "next";
import SettingsForm from "@/components/settings/settings-form";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = {
    title: t("menu.settings.sms.title"),
};

export default function SmsSettingsPage() {
    return <SettingsForm section="sms" />;
}
