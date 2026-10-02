"use client";

import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { DataTable } from "@/components/data-table/data-table";
import { usePermissions } from "@/context/app-provider";
import { useAgentColumns } from "@/components/agents/agent-column";
import AgentForm from "@/components/agents/agent-form";
import AgentFilterSchema from "@/components/agents/agent-filter-schema";
import { AgentRow } from "@/components/agents/agent-type";

const AgentTable: FC = () => {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();
    const columns = useAgentColumns();
    const [filterValue, setFilter] = useState<string | null>(null);
    const params = useMemo(
        () =>
            filterValue
                ? Object.fromEntries(new URLSearchParams(filterValue))
                : undefined,
        [filterValue]
    );

    const { data, isLoading, isFetching, setCurrentPage } =
        useApiQuery<PaginatedApiResponse<AgentRow>>({
            queryKey: ["agents"],
            url: "agents",
            params,
        });

    const agents = data?.data?.data ?? [];
    const pagination = data?.data?.pagination;
    const toolbarTitle = pagination?.total
        ? `${t("agent.title_plural")} (${pagination.total})`
        : t("agent.title_plural");

    return (
        <DataTable
            data={agents}
            setFilter={setFilter}
            columns={columns}
            toolbarOptions={{ filter: AgentFilterSchema() }}
            toggleColumns={true}
            pagination={pagination}
            setCurrentPage={setCurrentPage}
            isLoading={isLoading}
            isFetching={isFetching}
            queryKey="agents"
            form={hasPermission("agents.create") ? AgentForm : undefined}
            toolbarTitle={toolbarTitle}
        />
    );
};

export default AgentTable;
