"use client";

import { FC, ReactNode, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DataTable } from "@/components/data-table/data-table";
import type { DataTableToolbarConfig, ToolbarItem } from "@/components/data-table/toolbar/toolbar-config";
import { TransactionsColumns } from "@/components/wallets/transactions-column";
import {
  WalletTransactionRow,
  WalletTransactionRowSchema,
} from "@/components/wallets/wallet-type";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { useMyWallet } from "@/hooks/use-my-wallet";

interface TransactionsTableProps {
  walletId?: string | number;
  /** Toolbar center items, e.g. the balance chip on the my-wallet page. */
  toolbarCenter?: ToolbarItem[];
  /** Toolbar add slot (always last, on the right), e.g. the bKash recharge button. */
  toolbarAdd?: ReactNode;
}

export const TransactionsTable: FC<TransactionsTableProps> = ({ walletId, toolbarCenter, toolbarAdd }) => {
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
      url: `wallets/${resolvedWalletId}/wallet-transactions`,
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

  const toolbar: DataTableToolbarConfig = {
    title: toolbarTitle,
    center: toolbarCenter,
    features: {
      columns: true,
      add: toolbarAdd,
    },
  };

  return (
    <DataTable
      data={rows}
      setFilter={setFilter}
      columns={TransactionsColumns}
      toolbar={toolbar}
      pagination={pagination}
      setCurrentPage={setCurrentPage}
      isLoading={isLoading}
      isFetching={isFetching}
    />
  );
};
