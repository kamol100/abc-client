"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format, isValid, parseISO } from "date-fns";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { SupportBadge, SupportViewLink } from "@/components/platform-support/support-ui";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { PlatformThread } from "@/components/platform-support/admin/inbox-model";

function inboxTime(value: string | null): string {
    if (!value) return "";
    const date = parseISO(value);
    return isValid(date) ? format(date, "dd MMM yyyy, HH:mm") : value;
}

function threadHref(thread: PlatformThread): string {
    return `/platform-support-admin/threads/${thread.uuid}`;
}

function IdentityCell({ thread }: { thread: PlatformThread }) {
    const { t } = useTranslation();
    const company = thread.company?.name ?? "";
    const domain = thread.company?.domain ?? "";
    const reseller = thread.reseller?.name ?? "";
    const requester = thread.requester.name ?? "";
    return (
        <div data-testid="platform-inbox-identity">
            <p className="font-semibold text-foreground">{company}</p>
            {domain ? <p className="text-xs text-muted-foreground">{domain}</p> : null}
            {reseller ? <p className="text-xs text-muted-foreground">{t("platform_support.inbox.reseller")}: {reseller}</p> : null}
            <p className="mt-1 text-xs text-muted-foreground">{requester}{thread.requester_role ? ` · ${thread.requester_role}` : ""}</p>
        </div>
    );
}

function AssigneeCell({ name }: { name?: string | null }) {
    const { t } = useTranslation();
    return name ? <span className="text-sm">{name}</span>
        : <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">{t("platform_support.inbox.unassigned_agent")}</span>;
}

export const inboxColumns: ColumnDef<PlatformThread>[] = [
    {
        accessorKey: "company",
        header: ({ column }) => <DataTableColumnHeader column={column} title="platform_support.inbox.company" />,
        cell: ({ row }) => <IdentityCell thread={row.original} />,
        enableSorting: false,
    },
    {
        accessorKey: "reference",
        header: ({ column }) => <DataTableColumnHeader column={column} title="platform_support.reference" />,
        cell: ({ row }) => (
            <Link href={threadHref(row.original)} className="whitespace-nowrap font-mono text-xs font-medium text-muted-foreground hover:text-foreground">
                {row.original.reference ?? ""}
            </Link>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "subject",
        header: ({ column }) => <DataTableColumnHeader column={column} title="platform_support.subject.label" />,
        cell: ({ row }) => {
            const label = row.original.subject?.trim() || row.original.reference || "";
            return (
                <Link href={threadHref(row.original)} className="block min-w-32 max-w-xs whitespace-normal break-words font-semibold leading-snug text-foreground underline-offset-4 hover:underline">
                    {label}
                </Link>
            );
        },
        enableSorting: false,
    },
    {
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title="platform_support.filters.status" />,
        cell: ({ row }) => <SupportBadge type="status" value={row.original.status} />,
        enableSorting: false,
    },
    {
        accessorKey: "priority",
        header: ({ column }) => <DataTableColumnHeader column={column} title="platform_support.filters.priority" />,
        cell: ({ row }) => <SupportBadge type="priority" value={row.original.priority} />,
        enableSorting: false,
    },
    {
        accessorKey: "assigned_agent",
        header: ({ column }) => <DataTableColumnHeader column={column} title="platform_support.inbox.assignee" />,
        cell: ({ row }) => <AssigneeCell name={row.original.assigned_agent?.name} />,
        enableSorting: false,
    },
    {
        accessorKey: "unread_count",
        header: ({ column }) => <DataTableColumnHeader column={column} title="platform_support.unread" />,
        cell: ({ row }) => row.original.unread_count > 0 ? <span className="inline-flex min-w-5 justify-center rounded-full bg-primary/10 px-1.5 text-xs font-medium tabular-nums text-primary">{row.original.unread_count}</span> : null,
        enableSorting: false,
    },
    {
        accessorKey: "last_activity_at",
        header: ({ column }) => <DataTableColumnHeader column={column} title="platform_support.last_activity" />,
        cell: ({ row }) => <span>{inboxTime(row.original.last_activity_at)}</span>,
        enableSorting: false,
    },
    {
        id: "actions",
        header: ({ column }) => <DataTableColumnHeader column={column} title="common.actions" />,
        cell: ({ row }) => <SupportViewLink href={threadHref(row.original)} />,
        enableSorting: false,
        enableHiding: false,
    },
];
