"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import DisplayCount from "@/components/display-count";
import MyBadge from "@/components/my-badge";
import { AgentTransactionRow } from "@/components/agent-transactions/agent-transaction-type";
import { cellIndex, toNumber } from "@/lib/helper/helper";

type GetPagination = () => Pagination | undefined;

const TYPE_BADGE = {
  commission: "success",
  deposit: "info",
} as const;

function TransactionTypeCell({
  transactionType,
}: {
  transactionType: string;
}) {
  const { t } = useTranslation();
  const key = `agent_transaction.transaction_type.options.${transactionType}`;
  const label = t(key);
  const badgeType = TYPE_BADGE[transactionType as keyof typeof TYPE_BADGE] ?? "info";

  return (
    <MyBadge type={badgeType} variant="soft" className="capitalize">
      {label === key ? transactionType : label}
    </MyBadge>
  );
}

export function getAgentTransactionColumns(
  getPagination: GetPagination
): ColumnDef<AgentTransactionRow>[] {
  return [
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
        <span className="font-semibold text-primary">
          <DisplayCount amount={toNumber(row.original.amount)} formatCurrency />
        </span>
      ),
      enableSorting: false,
    },
    {
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
    },
  ];
}
