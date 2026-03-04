"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { NetworkRow } from "./network-type";
import NetworkStatusCell from "./network-status-cell";
import NetworkConnectionStatusCell from "./network-connection-status-cell";
import NetworkActionsCell from "./network-actions-cell";

export const NetworkColumns: ColumnDef<NetworkRow>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="network.name.label" />
    ),
    cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "ip_address",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="network.ip_address.label" />
    ),
    cell: ({ row }) => <span>{row.original.ip_address || "—"}</span>,
    enableSorting: false,
  },
  {
    accessorKey: "status_meta",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="network.status.label" />
    ),
    cell: ({ row }) => <NetworkStatusCell network={row.original} />,
    enableSorting: false,
  },
  {
    accessorKey: "connection",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="network.connection.label" />
    ),
    cell: ({ row }) => (
      <NetworkConnectionStatusCell networkId={row.original.id} />
    ),
    enableSorting: false,
  },
  {
    id: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        className="flex justify-end capitalize mr-3"
        title="common.actions"
      />
    ),
    cell: ({ row }) => <NetworkActionsCell network={row.original} />,
    enableSorting: false,
    enableHiding: false,
  },
];
