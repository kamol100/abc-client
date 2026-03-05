"use client";

import { ColumnDef } from "@tanstack/react-table";
import { formatMoney } from "@/lib/helper/helper";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { ClientWalletRow, WalletRow } from "./wallet-type";

export const WalletColumns: ColumnDef<WalletRow>[] = [
  {
    accessorKey: "payment_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="wallet.payment_date.label" />
    ),
    cell: ({ row }) => <span>{row.original.payment_date ?? "—"}</span>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "note",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="wallet.note.label" />
    ),
    cell: ({ row }) => <p className="line-clamp-1">{row.original.note ?? "—"}</p>,
    enableSorting: false,
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="wallet.amount.label" />
    ),
    cell: ({ row }) => (
      <span className="font-semibold text-primary">
        ৳{formatMoney(row.original.amount)}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "fund.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="wallet.method.label" />
    ),
    cell: ({ row }) => <span>{row.original.fund?.name ?? "—"}</span>,
    enableSorting: false,
  },
];

export const ClientWalletColumns: ColumnDef<ClientWalletRow>[] = [
  {
    accessorKey: "client.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="wallet.client.label" />
    ),
    cell: ({ row }) => <span className="capitalize">{row.original.client?.name ?? "—"}</span>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "balance",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="wallet.balance.label" />
    ),
    cell: ({ row }) => (
      <span className="font-semibold text-primary">
        ৳{formatMoney(row.original.balance)}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="wallet.created_at.label" />
    ),
    cell: ({ row }) => <span>{row.original.created_at ?? "—"}</span>,
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
