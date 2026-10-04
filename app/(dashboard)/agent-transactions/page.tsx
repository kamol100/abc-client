import { Metadata } from "next";
import { t } from "@/lib/i18n/server";
import AgentTransactionTable from "@/components/agent-transactions/agent-transaction-table";

export const metadata: Metadata = {
  title: t("agent_transaction.title_plural"),
};

export default function AgentTransactionsPage() {
  return <AgentTransactionTable />;
}
