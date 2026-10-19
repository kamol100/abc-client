import TelegramZoneTable from "@/components/telegram-zones/telegram-zone-table";
import { t } from "@/lib/i18n/server";
import { Metadata } from "next";

export default function TelegramZonePage() {
  return <TelegramZoneTable />;
}

export const metadata: Metadata = {
  title: t("telegram_zone.title_plural"),
  description: t("telegram_zone.title_plural"),
};
