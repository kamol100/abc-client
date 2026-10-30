"use client";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { MyButton } from "@/components/my-button";
import {
    notificationInterpolation,
    resolveNotificationHref,
    type NotificationRow,
} from "@/components/notifications/notification-catalog";
import { cellIndex, formatRelativeTime } from "@/lib/helper/helper";
import { cn } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useTranslation } from "react-i18next";

type GetPagination = () => Pagination | undefined;

interface NotificationColumnActions {
    onMarkRead: (id: string) => void;
    onMarkUnread: (id: string) => void;
}

export function getNotificationColumns(
    getPagination: GetPagination,
    actions: NotificationColumnActions
): ColumnDef<NotificationRow>[] {
    return [
        {
            id: "sl",
            header: ({ column }) => <DataTableColumnHeader column={column} title="notifications.sl" />,
            cell: ({ row }) => <div className="font-medium">{cellIndex(row.index, getPagination())}</div>,
            enableSorting: false,
            enableHiding: false,
        },
        {
            id: "message",
            header: ({ column }) => <DataTableColumnHeader column={column} title="notifications.message" />,
            cell: ({ row }) => <NotificationMessageCell item={row.original} />,
            enableSorting: false,
        },
        {
            id: "category",
            header: ({ column }) => <DataTableColumnHeader column={column} title="notifications.filters.category" />,
            cell: ({ row }) => <NotificationCategoryCell category={row.original.category} />,
            enableSorting: false,
        },
        {
            id: "created_at",
            header: ({ column }) => <DataTableColumnHeader column={column} title="notifications.when" />,
            cell: ({ row }) => <NotificationTimeCell createdAt={row.original.created_at} />,
            enableSorting: false,
        },
        {
            id: "actions",
            header: () => null,
            cell: ({ row }) => (
                <NotificationRowActions item={row.original} actions={actions} />
            ),
            enableSorting: false,
            enableHiding: false,
        },
    ];
}

function NotificationMessageCell({ item }: { item: NotificationRow }) {
    const { t } = useTranslation();
    const values = notificationInterpolation(item.data);
    const href = resolveNotificationHref(item.subject);
    const unread = item.read_at === null;
    const content = (
        <span className="block min-w-[220px]">
            <span className={cn("block truncate", unread && "font-medium")}>{t(item.title_key, values)}</span>
            <span className="block truncate text-xs text-muted-foreground">{t(item.message_key, values)}</span>
        </span>
    );

    if (!href) return content;
    return <Link href={href}>{content}</Link>;
}

function NotificationCategoryCell({ category }: { category: string }) {
    const { t } = useTranslation();
    return <span className="whitespace-nowrap">{t(`notifications.categories.${category}`)}</span>;
}

function NotificationTimeCell({ createdAt }: { createdAt: string }) {
    const { i18n } = useTranslation();
    return <span className="whitespace-nowrap text-muted-foreground">{formatRelativeTime(createdAt, i18n.language)}</span>;
}

function NotificationRowActions({
    item,
    actions,
}: {
    item: NotificationRow;
    actions: NotificationColumnActions;
}) {
    const unread = item.read_at === null;

    if (unread) {
        return (
            <MyButton
                icon={false}
                variant="ghost"
                title="notifications.mark_read"
                onClick={() => actions.onMarkRead(item.id)}
                data-testid="notification-mark-read"
            />
        );
    }

    return (
        <MyButton
            icon={false}
            variant="ghost"
            title="notifications.mark_unread"
            onClick={() => actions.onMarkUnread(item.id)}
            data-testid="notification-mark-unread"
        />
    );
}
