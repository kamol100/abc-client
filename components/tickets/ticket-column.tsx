"use client";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import MyBadge from "@/components/my-badge";
import TicketRowActions from "@/components/tickets/ticket-row-actions";
import { STATUS_OPTIONS, TicketRow } from "@/components/tickets/ticket-type";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePermissions } from "@/context/app-provider";
import useApiMutation from "@/hooks/use-api-mutation";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const priorityVariant = (p: string) => {
    switch (p) {
        case "high": return "destructive";
        case "medium": return "secondary";
        case "low": return "outline";
        default: return "secondary";
    }
};

const statusBadgeType = (status: string) => {
    switch (status) {
        case "open":
        case "in_progress":
        case "resolved":
        case "closed":
            return status;
        default:
            return "open";
    }
};

function TicketStatusSelect({ ticket }: { ticket: TicketRow }) {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();
    const [status, setStatus] = useState<TicketRow["status"]>(ticket.status);
    const canEdit = hasPermission("tickets.edit");

    useEffect(() => {
        setStatus(ticket.status);
    }, [ticket.status]);

    const { mutate, isPending } = useApiMutation<unknown, { status: TicketRow["status"] }>({
        url: `/tickets/${ticket.id}`,
        method: "PUT",
        invalidateKeys: "tickets",
        successMessage: "ticket.status.updated",
        onError: () => setStatus(ticket.status),
    });

    const statusLabel = t(
        STATUS_OPTIONS.find((option) => option.value === status)?.label ?? "ticket.status.open",
    );

    if (!canEdit) {
        return (
            <MyBadge type={statusBadgeType(status)} variant="soft" size="sm">
                {statusLabel}
            </MyBadge>
        );
    }

    const applyStatus = (nextStatus: TicketRow["status"]) => {
        if (nextStatus === status) return;
        setStatus(nextStatus);
        mutate({ status: nextStatus });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    aria-label={`${t("ticket.status.change")}: ${statusLabel}`}
                    disabled={isPending}
                    className={cn(
                        "inline-flex h-8 items-center gap-1 rounded-md",
                        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                    )}
                >
                    <MyBadge type={statusBadgeType(status)} variant="soft" size="sm" loading={isPending}>
                        {statusLabel}
                    </MyBadge>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                {STATUS_OPTIONS.map((option) => (
                    <DropdownMenuItem
                        key={option.value}
                        className="cursor-pointer p-1"
                        onSelect={() => applyStatus(option.value)}
                    >
                        <MyBadge type={option.value} variant="soft" size="sm">
                            {t(option.label)}
                        </MyBadge>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export const TicketColumns: ColumnDef<TicketRow>[] = [
    {
        accessorKey: "ticket_code",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="ticket.ticket_id.label" />
        ),
        cell: ({ row }) => <span>{row.original.ticket_code}</span>,
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
        cell: ({ row }) => <TicketStatusSelect ticket={row.original} />,
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
