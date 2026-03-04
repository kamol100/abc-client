import { Metadata } from "next";
import { t } from "@/lib/i18n/server";
import CommunicationQueueTable from "@/components/communication-queue/communication-queue-table";

export const metadata: Metadata = {
  title: t("communication_queue.title_plural"),
  description: t("communication_queue.title_plural"),
};

export default async function CommunicationQueuePage() {
  return <CommunicationQueueTable />;
}
