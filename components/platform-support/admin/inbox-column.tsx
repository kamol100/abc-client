"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format, isValid, parseISO } from "date-fns";
import Link from "next/link";
import { useTranslation } from "react-i18next";
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

function LabelCell({ prefix, value }: { prefix: string; value: string | null }) {
    const { t } = useTranslation();
    if (!value) return null;
    return <span>{t(`${prefix}.${value}`, { defaultValue: value })}</span>;
}

function IdentityCell({ thread }: { thread: PlatformThread }) {
    const { t } = useTranslation();
    const company = thread.company?.name ?? "";
    const domain = thread.company?.domain ?? "";
    const reseller = thread.reseller?.name ?? "";
    const requester = thread.requester.name ?? "";
    return (
        <div data-testid="platform-inbox-identity">
            <p className="text-sm text-foreground">{company}</p>
            {domain ? <p className="text-xs text-muted-foreground">{domain}</p> : null}
            {reseller ? <p className="text-xs text-muted-foreground">{t("platform_support.inbox.reseller")}: {reseller}</p> : null}
            <p className="text-xs text-foreground">{requester}{thread.requester_role ? ` · ${thread.requester_role}` : ""}</p>
        </div>
    );
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
            <Link href={threadHref(row.original)} className="text-foreground underline-offset-4 hover:underline">
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
                <Link href={threadHref(row.original)} className="font-medium text-foreground underline-offset-4 hover:underline">
                    {label}
                </Link>
            );
        },
        enableSorting: false,
    },
    {
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title="platform_support.filters.status" />,
        cell: ({ row }) => <LabelCell prefix="platform_support.statuses" value={row.original.status} />,
        enableSorting: false,
    },
    {
        accessorKey: "priority",
        header: ({ column }) => <DataTableColumnHeader column={column} title="platform_support.filters.priority" />,
        cell: ({ row }) => <LabelCell prefix="platform_support.priorities" value={row.original.priority} />,
        enableSorting: false,
    },
    {
        accessorKey: "assigned_agent",
        header: ({ column }) => <DataTableColumnHeader column={column} title="platform_support.inbox.assignee" />,
        cell: ({ row }) => <span>{row.original.assigned_agent?.name ?? ""}</span>,
        enableSorting: false,
    },
    {
        accessorKey: "unread_count",
        header: ({ column }) => <DataTableColumnHeader column={column} title="platform_support.unread" />,
        cell: ({ row }) => <span>{row.original.unread_count > 0 ? row.original.unread_count : ""}</span>,
        enableSorting: false,
    },
    {
        accessorKey: "last_activity_at",
        header: ({ column }) => <DataTableColumnHeader column={column} title="platform_support.last_activity" />,
        cell: ({ row }) => <span>{inboxTime(row.original.last_activity_at)}</span>,
        enableSorting: false,
    },
];
