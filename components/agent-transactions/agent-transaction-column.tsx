"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import DisplayCount from "@/components/display-count";
import { Badge } from "@/components/ui/badge";
import { AgentTransactionRow } from "@/components/agent-transactions/agent-transaction-type";
import { cellIndex, toNumber } from "@/lib/helper/helper";
import { cn } from "@/lib/utils";

type GetPagination = () => Pagination | undefined;

const TYPE_BADGE_STYLES: Record<string, string> = {
  commission:
    "bg-green-600/10 text-green-600 dark:bg-green-500/10 dark:text-green-400",
  deposit:
    "bg-green-600/10 text-green-600 dark:bg-green-500/10 dark:text-green-400",
  withdrawal:
    "bg-red-600/10 text-red-600 dark:bg-red-500/10 dark:text-red-400",
};

const TYPE_AMOUNT_STYLES: Record<string, string> = {
  commission: "text-green-600 dark:text-green-400",
  deposit: "text-green-600 dark:text-green-400",
  withdrawal: "text-red-600 dark:text-red-400",
};

function TransactionTypeCell({
  transactionType,
}: {
  transactionType: string;
}) {
  const { t } = useTranslation();
  const key = `agent_transaction.transaction_type.options.${transactionType}`;

  return (
    <Badge className={cn(TYPE_BADGE_STYLES[transactionType])}>
      {t(key)}
    </Badge>
  );
}

export function getAgentTransactionColumns(
  getPagination: GetPagination,
  showAgentColumn = true
): ColumnDef<AgentTransactionRow>[] {
  const columns: ColumnDef<AgentTransactionRow>[] = [
    {
      id: "sl",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="agent_transaction.sl" />
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
          title="agent_transaction.created_at.label"
        />
      ),
      cell: ({ row }) => <span>{row.original.created_at ?? "—"}</span>,
      enableSorting: false,
      enableHiding: false,
    },
  ];

  if (showAgentColumn) {
    columns.push({
      accessorKey: "agent.name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="agent_transaction.agent.label" />
      ),
      cell: ({ row }) => <span>{row.original.agent?.name ?? "—"}</span>,
      enableSorting: false,
    });
  }

  columns.push(
    {
      accessorKey: "transaction_type",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="agent_transaction.transaction_type.label"
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
        <DataTableColumnHeader column={column} title="agent_transaction.amount.label" />
      ),
      cell: ({ row }) => (
        <span className={cn("font-semibold", TYPE_AMOUNT_STYLES[row.original.transaction_type])}>
          <DisplayCount amount={toNumber(row.original.amount)} formatCurrency />
        </span>
      ),
      enableSorting: false,
    }
  );

  if (showAgentColumn) {
    columns.push({
      accessorKey: "agent.balance",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="agent_transaction.balance.label" />
      ),
      cell: ({ row }) => (
        <DisplayCount amount={toNumber(row.original.agent?.balance)} formatCurrency />
      ),
      enableSorting: false,
    });
  }

  columns.push({
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="agent_transaction.description.label"
      />
    ),
    cell: ({ row }) => (
      <div className="max-w-[240px] truncate" title={row.original.description ?? undefined}>
        {row.original.description || "—"}
      </div>
    ),
    enableSorting: false,
  });

  return columns;
}
