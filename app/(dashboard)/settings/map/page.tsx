import { Metadata } from "next";
import { SettingsPanel } from "@/components/settings/ui/settings-panel";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = {
    title: t("menu.settings.map.title"),
};

export default function MapSettingsPage() {
    return <SettingsPanel section="map" />;
}
