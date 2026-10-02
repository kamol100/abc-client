import { Metadata } from "next";
import AgentTable from "@/components/agents/agent-table";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = {
    title: t("agent.title_plural"),
};

export default function AgentsPage() {
    return <AgentTable />;
}
