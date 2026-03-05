"use client";

import { useTranslation } from "react-i18next";
import { ColumnDef } from "@tanstack/react-table";
import { usePermissions } from "@/context/app-provider";
import { cellIndex, formatMoney } from "@/lib/helper/helper";
import { cn } from "@/lib/utils";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { DeleteModal } from "@/components/delete-modal";
import { FundTransactionRow } from "./fund-transaction-type";

type GetPagination = () => Pagination | undefined;

const TYPE_BADGE_STYLES: Record<string, string> = {
  deposit:
    "bg-green-600/10 text-green-600 dark:bg-green-500/10 dark:text-green-400",
  transfer:
    "bg-yellow-600/10 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-300",
  withdraw:
    "bg-red-600/10 text-red-600 dark:bg-red-500/10 dark:text-red-400",
  expense:
    "bg-red-600/10 text-red-600 dark:bg-red-500/10 dark:text-red-400",
  salary:
    "bg-red-600/10 text-red-600 dark:bg-red-500/10 dark:text-red-400",
};

const TYPE_AMOUNT_STYLES: Record<string, string> = {
  deposit: "text-green-600 dark:text-green-400",
  transfer: "text-yellow-700 dark:text-yellow-300",
  withdraw: "text-red-600 dark:text-red-400",
  expense: "text-red-600 dark:text-red-400",
  salary: "text-red-600 dark:text-red-400",
};

const FundTransactionActions = ({ row }: { row: FundTransactionRow }) => {
  const { hasPermission } = usePermissions();
  const canDelete = hasPermission("fund-transactions.delete");

  if (!canDelete) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <div className="flex items-center justify-end gap-2 mr-2">
      <DeleteModal
        api_url={`/fund-transactions/${row.id}`}
        keys="fund-transactions,funds"
        confirmMessage="fund_transaction.delete_confirmation"
      />
    </div>
  );
};

const TransactionTypeCell = ({
  transactionType,
}: {
  transactionType: FundTransactionRow["transaction_type"];
}) => {
  const { t } = useTranslation();
  const key = `fund_transaction.transaction_type.options.${transactionType}`;
  return (
    <Badge className={cn(TYPE_BADGE_STYLES[transactionType])}>
      {t(key)}
    </Badge>
  );
};

export const getFundTransactionColumns = (
  getPagination: GetPagination,
  showFundColumn = true
): ColumnDef<FundTransactionRow>[] => {
  const columns: ColumnDef<FundTransactionRow>[] = [
    {
      id: "sl",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="fund_transaction.sl" />
      ),
      cell: ({ row }) => (
        <div className="font-medium">{cellIndex(row.index, getPagination())}</div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="fund_transaction.created_at.label"
        />
      ),
      cell: ({ row }) => <span>{row.original.created_at ?? "—"}</span>,
      enableSorting: false,
      enableHiding: false,
    },
  ];

  if (showFundColumn) {
    columns.push({
      accessorKey: "fund.name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="fund_transaction.fund.label" />
      ),
      cell: ({ row }) => <span>{row.original.fund?.name ?? "—"}</span>,
      enableSorting: false,
    });
  }

  columns.push(
    {
      accessorKey: "transaction_type",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="fund_transaction.transaction_type.label"
        />
      ),
      cell: ({ row }) => (
        <TransactionTypeCell transactionType={row.original.transaction_type} />
      ),
      enableSorting: false,
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="fund_transaction.amount.label" />
      ),
      cell: ({ row }) => (
        <span className={cn("font-semibold", TYPE_AMOUNT_STYLES[row.original.transaction_type])}>
          ৳{formatMoney(row.original.amount)}
        </span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "note",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="fund_transaction.note.label" />
      ),
      cell: ({ row }) => <span>{row.original.note ?? "—"}</span>,
      enableSorting: false,
    },
    {
      id: "actions",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="common.actions"
          className="flex justify-end mr-2"
        />
      ),
      cell: ({ row }) => <FundTransactionActions row={row.original} />,
      enableSorting: false,
      enableHiding: false,
    }
  );

  return columns;
};
