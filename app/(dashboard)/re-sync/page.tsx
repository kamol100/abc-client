import { Metadata } from "next";
import { t } from "@/lib/i18n/server";
import ReSyncTable from "@/components/re-sync/re-sync-table";

export const metadata: Metadata = {
  title: t("re_sync.title_plural"),
  description: t("re_sync.title_plural"),
};

export default function ReSyncPage() {
  return <ReSyncTable />;
}
