"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format, isValid, parseISO } from "date-fns";
import Link from "next/link";
import { useTranslation } from "react-i18next";
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
        <Link href={threadHref(thread)} className="font-medium text-foreground underline-offset-4 hover:underline">
            {label}
        </Link>
    );
}

function LabelCell({ prefix, value }: { prefix: string; value: string | null }) {
    const { t } = useTranslation();
    if (!value) return null;
    return <span>{t(`${prefix}.${value}`, { defaultValue: value })}</span>;
}

export const supportColumns: ColumnDef<SupportThread>[] = [
    {
        accessorKey: "reference",
        header: ({ column }) => <DataTableColumnHeader column={column} title="platform_support.reference" />,
        cell: ({ row }) => (
            <Link href={threadHref(row.original)} className="text-foreground">
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
        accessorKey: "unread_count",
        header: ({ column }) => <DataTableColumnHeader column={column} title="platform_support.unread" />,
        cell: ({ row }) => <span>{row.original.unread_count > 0 ? row.original.unread_count : ""}</span>,
        enableSorting: false,
    },
    {
        accessorKey: "last_activity_at",
        header: ({ column }) => <DataTableColumnHeader column={column} title="platform_support.last_activity" />,
        cell: ({ row }) => <span>{supportTime(row.original.last_activity_at)}</span>,
        enableSorting: false,
    },
];
