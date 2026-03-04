"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { TicketRow } from "./ticket-type";
import TicketRowActions from "./ticket-row-actions";

const priorityVariant = (p: string) => {
    switch (p) {
        case "high": return "destructive";
        case "medium": return "secondary";
        case "low": return "outline";
        default: return "secondary";
    }
};

const statusVariant = (s: string) => {
    switch (s) {
        case "open": return "default";
        case "in_progress": return "secondary";
        case "resolved": return "outline";
        case "closed": return "outline";
        default: return "default";
    }
};

export const TicketColumns: ColumnDef<TicketRow>[] = [
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
        accessorKey: "client",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="ticket.client.label" />
        ),
        cell: ({ row }) => {
            const client = row.original.client;
            if (!client) return <span>—</span>;
            return (
                <div className="text-sm">
                    <div className="font-medium">{client.name}</div>
                    {client.phone && (
                        <div className="text-muted-foreground">{client.phone}</div>
                    )}
                </div>
            );
        },
        enableSorting: false,
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
        accessorKey: "tag",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="ticket.tags.label" />
        ),
        cell: ({ row }) => {
            const tags = row.original.tag;
            if (!tags?.length) return <span>—</span>;
            return (
                <div className="flex flex-wrap gap-1">
                    {tags.map((tag) => (
                        <Badge key={tag.id} variant="outline" className="text-xs">
                            {tag.name}
                        </Badge>
                    ))}
                </div>
            );
        },
        enableSorting: false,
    },
    {
        accessorKey: "staff",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="ticket.assigned_to.label" />
        ),
        cell: ({ row }) => <span>{row.original.staff?.name ?? "—"}</span>,
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
            <Badge variant={priorityVariant(row.original.priority)} className="capitalize">
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
            <Badge variant={statusVariant(row.original.status)} className="capitalize">
                {row.original.status.replace("_", " ")}
            </Badge>
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
        cell: ({ row }) => <TicketRowActions row={row} />,
    },
];
