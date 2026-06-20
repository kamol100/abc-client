"use client";

import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DataTable } from "@/components/data-table/data-table";
import { TransactionsColumns } from "@/components/wallets/transactions-column";
import {
  WalletTransactionRow,
  WalletTransactionRowSchema,
} from "@/components/wallets/wallet-type";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { useMyWallet } from "@/hooks/use-my-wallet";

interface TransactionsTableProps {
  walletId?: string | number;
}

export const TransactionsTable: FC<TransactionsTableProps> = ({ walletId }) => {
  const { t } = useTranslation();
  const { wallet } = useMyWallet();
  const [filterValue, setFilter] = useState<string | null>(null);
  const resolvedWalletId = walletId ?? wallet?.id;

  const params = useMemo(
    () =>
      filterValue
        ? Object.fromEntries(new URLSearchParams(filterValue))
        : undefined,
    [filterValue]
  );

  const { data, isLoading, isFetching, setCurrentPage } =
    useApiQuery<PaginatedApiResponse<WalletTransactionRow>>({
      queryKey: ["wallet-transactions", resolvedWalletId],
      url: `wallets/${resolvedWalletId}/transactions`,
      params,
      enabled: !!resolvedWalletId,
    });

  const rows = useMemo(() => {
    const incoming = data?.data?.data ?? [];
    return incoming
      .map((item) => WalletTransactionRowSchema.safeParse(item))
      .filter((item) => item.success)
      .map((item) => item.data);
  }, [data]);

  const pagination = data?.data?.pagination;
  const toolbarTitle = pagination?.total
    ? `${t("wallet.title_plural")} (${pagination.total})`
    : t("wallet.title_plural");

  return (
    <DataTable
      data={rows}
      setFilter={setFilter}
      columns={TransactionsColumns}
      toggleColumns
      pagination={pagination}
      setCurrentPage={setCurrentPage}
      isLoading={isLoading}
      isFetching={isFetching}
      toolbarTitle={toolbarTitle}
    />
  );
};
