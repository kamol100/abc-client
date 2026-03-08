import { Metadata } from "next";
import SettingsForm from "@/components/settings/settings-form";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = {
    title: t("menu.settings.voice_call.title"),
};

export default function VoiceCallSettingsPage() {
    return <SettingsForm section="voice_call" />;
}
