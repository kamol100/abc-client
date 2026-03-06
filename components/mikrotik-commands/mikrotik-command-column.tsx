"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { MikrotikCommandRow } from "./mikrotik-command-type";

export const MikrotikCommandColumns: ColumnDef<MikrotikCommandRow>[] = [
  {
    id: "sl",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="mikrotik_command.table.sl" />
    ),
    cell: ({ row }) => <span className="font-medium">{row.index + 1}</span>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "key",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="mikrotik_command.table.key.label"
      />
    ),
    cell: ({ row }) => (
      <span className="text-sm font-medium capitalize">{row.original.key}</span>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "value",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="mikrotik_command.table.value.label"
      />
    ),
    cell: ({ row }) => (
      <pre className="text-xs whitespace-pre-wrap break-words font-mono">
        {row.original.value}
      </pre>
    ),
    enableSorting: false,
  },
];
