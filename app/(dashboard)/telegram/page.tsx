import TelegramTable from "@/components/telegram/telegram-table";
import { t } from "@/lib/i18n/server";
import { Metadata } from "next";

export default function TelegramPage() {
  return <TelegramTable />;
}

export const metadata: Metadata = {
  title: t("telegram.title_plural"),
  description: t("telegram.title_plural"),
};
