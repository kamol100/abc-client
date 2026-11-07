import { Metadata } from "next";
import MikrotikSyncTable from "@/components/mikrotik-sync/mikrotik-sync-table";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: t("mikrotik_sync.title_plural"),
  description: t("mikrotik_sync.title_plural"),
};

export default function MikrotikSyncPage() {
  return <MikrotikSyncTable />;
}
