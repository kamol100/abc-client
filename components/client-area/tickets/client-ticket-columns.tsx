"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import MyBadge from "@/components/my-badge";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { TicketRow } from "@/components/tickets/ticket-type";
import ClientTicketRowActions from "./client-ticket-row-actions";

const priorityVariant = (p: string) => {
  switch (p) {
    case "high":
      return "destructive" as const;
    case "medium":
      return "secondary" as const;
    case "low":
      return "outline" as const;
    default:
      return "secondary" as const;
  }
};

const statusBadgeType = (s: string) => {
  switch (s) {
    case "open":
    case "in_progress":
    case "resolved":
    case "closed":
      return s;
    default:
      return "open";
  }
};

export const useClientTicketColumns = (): ColumnDef<TicketRow>[] =>
  useMemo(
    () => [
      {
        accessorKey: "ticketId",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="ticket.ticket_id.label" />
        ),
        cell: ({ row }) => <span>#{row.original.ticketId}</span>,
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "subject",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="ticket.subject.label" />
        ),
        cell: ({ row }) => <span>{row.original.subject?.name ?? "—"}</span>,
        enableSorting: false,
      },
      {
        accessorKey: "messages_count",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="ticket.replies" />
        ),
        cell: ({ row }) => (
          <Badge variant="secondary">{row.original.messages_count ?? 0}</Badge>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "priority",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="ticket.priority.label" />
        ),
        cell: ({ row }) => (
          <Badge
            variant={priorityVariant(row.original.priority)}
            className="capitalize"
          >
            {row.original.priority}
          </Badge>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="ticket.status.label" />
        ),
        cell: ({ row }) => (
          <MyBadge
            type={statusBadgeType(row.original.status)}
            variant="soft"
            size="sm"
            className="capitalize"
          >
            {row.original.status.replace("_", " ")}
          </MyBadge>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "created_at",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="ticket.created_at" />
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
        cell: ({ row }) => <ClientTicketRowActions row={row} />,
      },
    ],
    [],
  );
