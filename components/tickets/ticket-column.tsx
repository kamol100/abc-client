"use client";

import ChoiceMenu from "@/components/choice-menu";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import MyBadge from "@/components/my-badge";
import TicketRowActions from "@/components/tickets/ticket-row-actions";
import { STATUS_OPTIONS, TicketRow } from "@/components/tickets/ticket-type";
import { Badge } from "@/components/ui/badge";
import { usePermissions } from "@/context/app-provider";
import useApiMutation from "@/hooks/use-api-mutation";
import useApiQuery from "@/hooks/use-api-query";
import { ColumnDef } from "@tanstack/react-table";
import { User } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
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
    const canEdit = hasPermission("tickets.status.update");

    useEffect(() => {
        setStatus(ticket.status);
    }, [ticket.status]);

    const { mutate, isPending } = useApiMutation<unknown, { status: TicketRow["status"] }>({
        url: `/ticket-status/${ticket.id}`,
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
        <ChoiceMenu
            ariaLabel={`${t("ticket.status.change")}: ${statusLabel}`}
            value={status}
            disabled={isPending}
            trigger={(
                <MyBadge type={statusBadgeType(status)} variant="soft" size="sm" loading={isPending}>
                    {statusLabel}
                </MyBadge>
            )}
            options={STATUS_OPTIONS.map((option) => ({
                value: option.value,
                content: (
                    <MyBadge type={option.value} variant="soft" size="sm">
                        {t(option.label)}
                    </MyBadge>
                ),
            }))}
            onSelect={applyStatus}
        />
    );
}

const UNASSIGNED_VALUE = "";

type StaffChoice = {
    id: number;
    name: string;
};

function toStaffChoice(value: { id?: unknown; name?: unknown } | null | undefined): StaffChoice | null {
    if (!value || typeof value.name !== "string") return null;
    const id = Number(value.id);
    if (!Number.isInteger(id)) return null;
    return { id, name: value.name };
}

function WithUserIcon({ children }: { children: ReactNode }) {
    return (
        <span className="inline-flex items-center gap-2">
            <User aria-hidden className="h-3.5 w-3.5 shrink-0" />
            <span>{children}</span>
        </span>
    );
}

function TicketAssigneeSelect({ ticket }: { ticket: TicketRow }) {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();
    const canAssign = hasPermission("tickets.assignee.update");
    const [assignee, setAssignee] = useState<StaffChoice | null>(toStaffChoice(ticket.staff));

    useEffect(() => {
        setAssignee(toStaffChoice(ticket.staff));
    }, [ticket.staff]);

    const { data: staffResponse } = useApiQuery<{ data?: Array<{ id?: unknown; name?: unknown }> }>({
        queryKey: ["dropdown-staffs"],
        url: "dropdown-staffs",
        pagination: false,
        enabled: canAssign,
    });

    const { mutate, isPending } = useApiMutation<unknown, { assigned_to: number | null }>({
        url: `/ticket-assignee/${ticket.id}`,
        method: "PUT",
        invalidateKeys: "tickets",
        successMessage: "ticket.assigned_to.updated",
        onError: () => setAssignee(toStaffChoice(ticket.staff)),
    });

    const label = assignee?.name ?? t("ticket.not_assigned");
    const staffRows = useMemo(() => {
        const rows = Array.isArray(staffResponse?.data) ? staffResponse.data : [];
        const choices = new Map<number, StaffChoice>();
        const current = toStaffChoice(ticket.staff);
        if (current) choices.set(current.id, current);
        for (const row of rows) {
            const choice = toStaffChoice(row);
            if (choice) choices.set(choice.id, choice);
        }
        return [...choices.values()];
    }, [staffResponse?.data, ticket.staff]);

    const applyAssignee = (value: string) => {
        const next = value === UNASSIGNED_VALUE
            ? null
            : staffRows.find((staff) => String(staff.id) === value) ?? null;
        if ((next?.id ?? null) === (assignee?.id ?? null)) return;
        setAssignee(next);
        mutate({ assigned_to: next?.id ?? null });
    };

    if (!canAssign) {
        return (
            <span className="inline-flex h-8 items-center text-sm">
                <WithUserIcon>{label}</WithUserIcon>
            </span>
        );
    }

    return (
        <ChoiceMenu
            ariaLabel={`${t("ticket.assigned_to.change")}: ${label}`}
            value={assignee ? String(assignee.id) : UNASSIGNED_VALUE}
            disabled={isPending}
            trigger={<WithUserIcon>{label}</WithUserIcon>}
            options={[
                {
                    value: UNASSIGNED_VALUE,
                    content: <WithUserIcon>{t("ticket.not_assigned")}</WithUserIcon>,
                },
                ...staffRows.map((staff) => ({
                    value: String(staff.id),
                    content: <WithUserIcon>{staff.name}</WithUserIcon>,
                })),
            ]}
            onSelect={applyAssignee}
        />
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
        cell: ({ row }) => <TicketAssigneeSelect ticket={row.original} />,
        enableSorting: false,
        enableHiding: false,
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
        enableHiding: false,
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
