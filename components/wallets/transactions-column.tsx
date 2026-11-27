"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { toNumber } from "@/lib/helper/helper";
import { cn } from "@/lib/utils";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import DisplayCount from "@/components/display-count";
import { WalletTransactionRow } from "@/components/wallets/wallet-type";
import { DeleteModal } from "@/components/delete-modal";
import { ChainDeleteModal } from "@/components/wallets/chain-delete-modal";

const TRANSACTION_TYPE_BADGE_STYLES: Record<string, string> = {
  deposit: "theme-badge-success",
  deduction: "theme-badge-danger",
};

const TRANSACTION_TYPE_AMOUNT_STYLES: Record<string, string> = {
  deposit: "theme-tone-success",
  deduction: "theme-tone-danger",
};

const TransactionTypeCell = ({
  transactionType,
}: {
  transactionType: WalletTransactionRow["transaction_type"];
}) => {
  const { t } = useTranslation();
  const key = `wallet.transaction_type.options.${transactionType}`;

  return (
    <Badge className={cn(TRANSACTION_TYPE_BADGE_STYLES[transactionType])}>
      {t(key, { defaultValue: transactionType })}
    </Badge>
  );
};

/** A transaction of a payment names what goes with it; any other is a plain delete. */
const TransactionDeleteCell = ({ row }: { row: WalletTransactionRow }) => {
  const api = `/wallet-transactions/${row.id}`;

  return (
    <div className="flex items-center justify-end mr-2">
      {row.linked ? (
        <ChainDeleteModal api_url={api} linked={row.linked} />
      ) : (
        <DeleteModal
          api_url={api}
          keys="wallet-transactions,client-wallets,clients"
          confirmMessage="wallet.transaction_delete_confirmation"
        />
      )}
    </div>
  );
};

const deleteColumn: ColumnDef<WalletTransactionRow> = {
  id: "actions",
  header: ({ column }) => (
    <DataTableColumnHeader
      column={column}
      title="common.actions"
      className="flex justify-end mr-2"
    />
  ),
  cell: ({ row }) => <TransactionDeleteCell row={row.original} />,
  enableSorting: false,
  enableHiding: false,
};

/** `withDelete` adds the delete action: only for a client wallet opened by staff. */
export const getTransactionsColumns = (withDelete: boolean): ColumnDef<WalletTransactionRow>[] =>
  withDelete ? [...TransactionsColumns, deleteColumn] : TransactionsColumns;

export const TransactionsColumns: ColumnDef<WalletTransactionRow>[] = [
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="wallet.created_at.label" />
    ),
    cell: ({ row }) => <span>{row.original.created_at ?? "—"}</span>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "transaction_type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="wallet.transaction_type.label" />
    ),
    cell: ({ row }) => (
      <TransactionTypeCell transactionType={row.original.transaction_type} />
    ),
    enableSorting: false,
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="wallet.amount.label" />
    ),
    cell: ({ row }) => (
      <span
        className={cn(
          "font-semibold",
          TRANSACTION_TYPE_AMOUNT_STYLES[row.original.transaction_type] ?? "text-primary"
        )}
      >
        <DisplayCount amount={toNumber(row.original.amount)} formatCurrency />
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "recharge_method",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="wallet.method.label" />
    ),
    cell: ({ row }) => <span>{row.original.recharge_method ?? "—"}</span>,
    enableSorting: false,
  },
  {
    accessorKey: "note",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="wallet.note.label" />
    ),
    cell: ({ row }) => <p className="line-clamp-1">{row.original.note ?? "—"}</p>,
    enableSorting: false,
  },
];
