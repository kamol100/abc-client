"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { toNumber } from "@/lib/helper/helper";
import { cn } from "@/lib/utils";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import DisplayCount from "@/components/display-count";
import { WalletTransactionRow } from "@/components/wallets/wallet-type";

const TRANSACTION_TYPE_BADGE_STYLES: Record<string, string> = {
  deposit:
    "bg-green-600/10 text-green-600 dark:bg-green-500/10 dark:text-green-400",
  deduction:
    "bg-red-600/10 text-red-600 dark:bg-red-500/10 dark:text-red-400",
};

const TRANSACTION_TYPE_AMOUNT_STYLES: Record<string, string> = {
  deposit: "text-green-600 dark:text-green-400",
  deduction: "text-red-600 dark:text-red-400",
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
