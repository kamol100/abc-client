"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { DashboardStaffCollectionDetail } from "@/components/dashboard/dashboard-type";
import DisplayCount from "@/components/display-count";
import { toNumber } from "@/lib/helper/helper";

export const DashboardStaffCollectionColumns: ColumnDef<DashboardStaffCollectionDetail>[] = [
  {
    id: "invoice_id",
    accessorFn: (row) => row.invoice?.trackID ?? "",
    header: ({ column }) => <DataTableColumnHeader column={column} title="invoice.invoice_id" />,
    cell: ({ row }) => <span className="whitespace-nowrap text-sm font-medium">{row.original.invoice?.trackID ?? "—"}</span>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "create_date",
    accessorFn: (row) => row.invoice?.create_date ?? "",
    header: ({ column }) => <DataTableColumnHeader column={column} title="invoice.filter.create_date" />,
    cell: ({ row }) => <span className="whitespace-nowrap text-sm">{row.original.invoice?.create_date ?? "—"}</span>,
    enableSorting: false,
  },
  {
    id: "due_date",
    accessorFn: (row) => row.invoice?.due_date ?? "",
    header: ({ column }) => <DataTableColumnHeader column={column} title="invoice.filter.due_date" />,
    cell: ({ row }) => <span className="whitespace-nowrap text-sm">{row.original.invoice?.due_date ?? "—"}</span>,
    enableSorting: false,
  },
  {
    id: "invoice_type",
    accessorFn: (row) => row.invoice?.invoice_type?.name ?? "",
    header: ({ column }) => <DataTableColumnHeader column={column} title="invoice.filter.type" />,
    cell: ({ row }) => <span className="whitespace-nowrap text-sm capitalize">{row.original.invoice?.invoice_type?.name ?? "—"}</span>,
    enableSorting: false,
  },
  {
    id: "client",
    accessorFn: (row) => row.client?.name ?? "",
    header: ({ column }) => <DataTableColumnHeader column={column} title="invoice.filter.client" />,
    cell: ({ row }) => {
      const name = row.original.client?.name?.trim() || "—";
      return (
        <span className="block max-w-[160px] truncate text-sm capitalize" title={name}>
          {name}
        </span>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "note",
    header: ({ column }) => <DataTableColumnHeader column={column} title="common.note" />,
    cell: ({ row }) => {
      const note = row.original.note?.trim() || "—";
      return (
        <span className="block max-w-[200px] truncate text-sm" title={note}>
          {note}
        </span>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "amount",
    header: ({ column }) => <DataTableColumnHeader column={column} title="payment.amount.label" />,
    cell: ({ row }) => (
      <span className="font-semibold text-primary">
        <DisplayCount amount={toNumber(row.original.amount)} formatCurrency />
      </span>
    ),
    enableSorting: false,
    enableHiding: false,
  },
];
