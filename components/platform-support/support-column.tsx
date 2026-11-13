"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format, isValid, parseISO } from "date-fns";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { SupportBadge, SupportViewLink } from "@/components/platform-support/support-ui";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { SupportThread } from "@/components/platform-support/support-model";

function supportTime(value: string | null): string {
    if (!value) return "";
    const date = parseISO(value);
    return isValid(date) ? format(date, "dd MMM yyyy, HH:mm") : value;
}

function threadHref(thread: SupportThread): string {
    const section = thread.kind === "chat" ? "chats" : "issues";
    return `/platform-support/${section}/${thread.uuid}`;
}

function SubjectCell({ thread }: { thread: SupportThread }) {
    const { t } = useTranslation();
    const label = thread.subject?.trim() || (thread.kind === "chat" ? t("platform_support.chat.untitled") : thread.reference ?? "");
    return (
        <Link href={threadHref(thread)} className="block min-w-32 max-w-xs whitespace-normal break-words font-semibold leading-snug text-foreground underline-offset-4 hover:underline">
            {label}
        </Link>
    );
}

export const supportColumns: ColumnDef<SupportThread>[] = [
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
        cell: ({ row }) => <SubjectCell thread={row.original} />,
        enableSorting: false,
    },
    {
        accessorKey: "requester",
        header: ({ column }) => <DataTableColumnHeader column={column} title="platform_support.requester" />,
        cell: ({ row }) => <span>{row.original.requester.name ?? ""}</span>,
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
        accessorKey: "unread_count",
        header: ({ column }) => <DataTableColumnHeader column={column} title="platform_support.unread" />,
        cell: ({ row }) => row.original.unread_count > 0 ? <span className="inline-flex min-w-5 justify-center rounded-full bg-primary/10 px-1.5 text-xs font-medium tabular-nums text-primary">{row.original.unread_count}</span> : null,
        enableSorting: false,
    },
    {
        accessorKey: "last_activity_at",
        header: ({ column }) => <DataTableColumnHeader column={column} title="platform_support.last_activity" />,
        cell: ({ row }) => <span>{supportTime(row.original.last_activity_at)}</span>,
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
