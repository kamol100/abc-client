"use client";

import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { usePermissions } from "@/context/app-provider";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { DataTable } from "@/components/data-table/data-table";
import type { DataTableToolbarConfig } from "@/components/data-table/toolbar/toolbar-config";
import FundTransactionForm from "@/components/fund-transactions/fund-transaction-form";
import FundTransactionFilterSchema from "@/components/fund-transactions/fund-transaction-filter-schema";
import { getFundTransactionColumns } from "@/components/fund-transactions/fund-transaction-column";
import { FundTransactionRow } from "@/components/fund-transactions/fund-transaction-type";

type FundTransactionTarget = {
  id: string | number;
  name?: string | null;
  balance?: number | string | null;
};

type FundTransactionTableProps = {
  apiUrl?: string;
  queryKey?: string;
  includeFundFilter?: boolean;
  showFundColumn?: boolean;
  hideCreateAction?: boolean;
  fund?: FundTransactionTarget;
};

const FundTransactionTable: FC<FundTransactionTableProps> = ({
  apiUrl = "fund-transactions",
  queryKey = "fund-transactions",
  includeFundFilter = true,
  showFundColumn = true,
  hideCreateAction = false,
  fund,
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
    useApiQuery<PaginatedApiResponse<FundTransactionRow>>({
      queryKey: [queryKey],
      url: apiUrl,
      params,
    });

  const transactions = data?.data?.data ?? [];
  const pagination = data?.data?.pagination;

  const toolbarTitle = pagination?.total
    ? `${t("fund_transaction.title_plural")} (${pagination.total})`
    : t("fund_transaction.title_plural");

  const toolbarOptions = useMemo(
    () => ({
      filter: FundTransactionFilterSchema(includeFundFilter),
      watchFields: ["created_at"],
    }),
    [includeFundFilter]
  );

  const columns = useMemo(
    () => getFundTransactionColumns(() => pagination, showFundColumn),
    [pagination, showFundColumn]
  );

  const CreateAction = useMemo(() => {
    if (hideCreateAction || !hasPermission("fund-transactions.create")) {
      return undefined;
    }

    const invalidateKeys = ["funds", "fund-transactions", queryKey]
      .filter((key, index, keys) => Boolean(key) && keys.indexOf(key) === index)
      .join(",");

    const AddTransaction = () => (
      <FundTransactionForm
        fundId={fund?.id}
        fundName={fund?.name}
        fundBalance={fund?.balance}
        queryKey={invalidateKeys}
      />
    );

    return AddTransaction;
  }, [fund?.balance, fund?.id, fund?.name, hasPermission, hideCreateAction, queryKey]);

  const toolbar: DataTableToolbarConfig = {
    title: toolbarTitle,
    features: {
      columns: true,
      filter: toolbarOptions,
      add: CreateAction,
    },
  };

  return (
    <DataTable
      data={transactions}
      columns={columns}
      setFilter={setFilter}
      toolbar={toolbar}
      pagination={pagination}
      setCurrentPage={setCurrentPage}
      isLoading={isLoading || isFetching}
      isFetching={isFetching}
      queryKey={queryKey}
    />
  );
};

export default FundTransactionTable;
