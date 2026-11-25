import { MenuLayoutSettingsPage } from "@/components/settings/menu-layout/menu-layout-settings";
import { t } from "@/lib/i18n/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: t("menu_layout.title"),
};

export default function MenuLayoutSettingsRoute() {
    return <MenuLayoutSettingsPage />;
}
