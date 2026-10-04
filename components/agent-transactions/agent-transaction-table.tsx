"use client";

import { FC, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DataTable } from "@/components/data-table/data-table";
import MyButton from "@/components/my-button";
import AgentTransactionFilterSchema from "@/components/agent-transactions/agent-transaction-filter-schema";
import { getAgentTransactionColumns } from "@/components/agent-transactions/agent-transaction-column";
import { AgentTransactionRow } from "@/components/agent-transactions/agent-transaction-type";
import { usePermissions } from "@/context/app-provider";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";

type AgentTransactionTableProps = {
  apiUrl?: string;
  queryKey?: string;
  includeAgentFilter?: boolean;
  showAgentColumn?: boolean;
  hideCreateAction?: boolean;
};

const AgentTransactionTable: FC<AgentTransactionTableProps> = ({
  apiUrl = "agent-transactions",
  queryKey = "agent-transactions",
  includeAgentFilter = true,
  showAgentColumn = true,
  hideCreateAction = false,
}) => {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const [filterValue, setFilter] = useState<string | null>(null);

  const params = useMemo(
    () =>
      filterValue
        ? Object.fromEntries(new URLSearchParams(filterValue))
        : undefined,
    [filterValue]
  );

  const { data, isLoading, isFetching, setCurrentPage } =
    useApiQuery<PaginatedApiResponse<AgentTransactionRow>>({
      queryKey: [queryKey],
      url: apiUrl,
      params,
    });

  const transactions = data?.data?.data ?? [];
  const pagination = data?.data?.pagination;

  const toolbarTitle = pagination?.total
    ? `${t("agent_transaction.title_plural")} (${pagination.total})`
    : t("agent_transaction.title_plural");

  const toolbarOptions = useMemo(
    () => ({
      filter: AgentTransactionFilterSchema(includeAgentFilter),
      watchFields: ["created_at"],
    }),
    [includeAgentFilter]
  );

  const columns = useMemo(
    () => getAgentTransactionColumns(() => pagination, showAgentColumn),
    [pagination, showAgentColumn]
  );

  const CreateAction = useMemo(() => {
    if (hideCreateAction || !hasPermission("agent-transactions.create")) {
      return undefined;
    }

    const AddFromAgents = () => (
      <MyButton size="default" variant="default" url="/agents">
        <Plus />
        {t("common.add")}
      </MyButton>
    );

    return AddFromAgents;
  }, [hasPermission, hideCreateAction, t]);

  return (
    <DataTable
      data={transactions}
      columns={columns}
      setFilter={setFilter}
      toolbarOptions={toolbarOptions}
      toggleColumns
      pagination={pagination}
      setCurrentPage={setCurrentPage}
      isLoading={isLoading || isFetching}
      isFetching={isFetching}
      toolbarTitle={toolbarTitle}
      queryKey={queryKey}
      form={CreateAction}
    />
  );
};

export default AgentTransactionTable;
