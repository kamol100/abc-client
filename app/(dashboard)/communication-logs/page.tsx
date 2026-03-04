import { Metadata } from "next";
import { t } from "@/lib/i18n/server";
import CommunicationLogTable from "@/components/communication-logs/communication-log-table";

export const metadata: Metadata = {
  title: t("communication_log.title_plural"),
  description: t("communication_log.title_plural"),
};

export default async function CommunicationLogsPage() {
  return <CommunicationLogTable />;
}
