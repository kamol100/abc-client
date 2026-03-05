"use client";

import { FC, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePermissions } from "@/context/app-provider";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import ActionButton from "@/components/action-button";
import { DataTable } from "@/components/data-table/data-table";
import FundTransactionFilterSchema from "./fund-transaction-filter-schema";
import { getFundTransactionColumns } from "./fund-transaction-column";
import { FundTransactionRow } from "./fund-transaction-type";

type FundTransactionTableProps = {
  apiUrl?: string;
  queryKey?: string;
  includeFundFilter?: boolean;
  showFundColumn?: boolean;
  hideCreateAction?: boolean;
};

const FundTransactionTable: FC<FundTransactionTableProps> = ({
  apiUrl = "fund-transactions",
  queryKey = "fund-transactions",
  includeFundFilter = true,
  showFundColumn = true,
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

    const AddFromFunds = () => (
      <ActionButton size="default" variant="default" url="/funds">
        <Plus />
        {t("common.add")}
      </ActionButton>
    );

    return AddFromFunds;
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
      isLoading={isLoading}
      isFetching={isFetching}
      toolbarTitle={toolbarTitle}
      queryKey={queryKey}
      form={CreateAction}
    />
  );
};

export default FundTransactionTable;
