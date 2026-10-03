"use client";

import { FC, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { DataTable } from "@/components/data-table/data-table";
import { getAgentTransactionColumns } from "@/components/agent-transactions/agent-transaction-column";
import { AgentTransactionRow } from "@/components/agent-transactions/agent-transaction-type";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";

type AgentTransactionTableProps = {
  apiUrl: string;
  queryKey: string;
};

const AgentTransactionTable: FC<AgentTransactionTableProps> = ({
  apiUrl,
  queryKey,
}) => {
  const { t } = useTranslation();

  const { data, isLoading, isFetching, setCurrentPage } =
    useApiQuery<PaginatedApiResponse<AgentTransactionRow>>({
      queryKey: [queryKey],
      url: apiUrl,
    });

  const transactions = data?.data?.data ?? [];
  const pagination = data?.data?.pagination;

  const columns = useMemo(
    () => getAgentTransactionColumns(() => pagination),
    [pagination]
  );

  const toolbarTitle = pagination?.total
    ? `${t("agent_transaction.title_plural")} (${pagination.total})`
    : t("agent_transaction.title_plural");

  return (
    <DataTable
      data={transactions}
      columns={columns}
      toggleColumns
      pagination={pagination}
      setCurrentPage={setCurrentPage}
      isLoading={isLoading || isFetching}
      isFetching={isFetching}
      toolbarTitle={toolbarTitle}
      queryKey={queryKey}
    />
  );
};

export default AgentTransactionTable;
