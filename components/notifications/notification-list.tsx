"use client";

import {
    notificationCategoryIcon,
    notificationInterpolation,
    resolveNotificationHref,
    type NotificationRow,
} from "@/components/notifications/notification-catalog";
import { MyButton } from "@/components/my-button";
import { formatRelativeTime } from "@/lib/helper/helper";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useTranslation } from "react-i18next";

interface NotificationListProps {
    items: NotificationRow[];
    isLoading?: boolean;
    isError?: boolean;
    onMarkRead?: (id: string) => void;
    onMarkUnread?: (id: string) => void;
    compact?: boolean;
}

export function NotificationList({
    items,
    isLoading = false,
    isError = false,
    onMarkRead,
    onMarkUnread,
    compact = false,
}: NotificationListProps) {
    const { t } = useTranslation();

    if (isLoading && items.length === 0) {
        return (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground" data-testid="notification-loading">
                {t("notifications.loading")}
            </p>
        );
    }

    if (isError) {
        return (
            <p className="px-3 py-6 text-center text-sm text-destructive" data-testid="notification-error">
                {t("notifications.error")}
            </p>
        );
    }

    if (items.length === 0) {
        return (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground" data-testid="notification-empty">
                {t("notifications.empty")}
            </p>
        );
    }

    return (
        <ul className="flex flex-col" data-testid="notification-list">
            {items.map((item) => (
                <NotificationItem
                    key={item.id}
                    item={item}
                    compact={compact}
                    onMarkRead={onMarkRead}
                    onMarkUnread={onMarkUnread}
                />
            ))}
        </ul>
    );
}

function NotificationItem({
    item,
    compact,
    onMarkRead,
    onMarkUnread,
}: {
    item: NotificationRow;
    compact: boolean;
    onMarkRead?: (id: string) => void;
    onMarkUnread?: (id: string) => void;
}) {
    const { t, i18n } = useTranslation();
    const Icon = notificationCategoryIcon(item.category);
    const href = resolveNotificationHref(item.subject);
    const values = notificationInterpolation(item.data);
    const unread = item.read_at === null;
    const title = t(item.title_key, values);
    const message = t(item.message_key, values);

    const body = (
        <span className="flex min-w-0 flex-1 items-start gap-2">
            <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0">
                <span className={cn("block truncate text-sm", unread && "font-medium")}>{title}</span>
                <span className="block truncate text-xs text-muted-foreground">{message}</span>
                <span className="block text-xs text-muted-foreground">
                    {formatRelativeTime(item.created_at, i18n.language)}
                </span>
            </span>
        </span>
    );

    return (
        <li
            className={cn(
                "flex items-start gap-2 border-b px-3 py-2 last:border-b-0",
                unread && "bg-accent/40"
            )}
            data-testid="notification-item"
            data-unread={unread ? "true" : "false"}
        >
            {href ? (
                <Link href={href} className="min-w-0 flex-1" onClick={() => unread && onMarkRead?.(item.id)}>
                    {body}
                </Link>
            ) : (
                <div className="min-w-0 flex-1">{body}</div>
            )}
            {!compact && onMarkUnread && !unread ? (
                <MyButton
                    icon={false}
                    variant="ghost"
                    title="notifications.mark_unread"
                    onClick={() => onMarkUnread(item.id)}
                    data-testid="notification-mark-unread"
                />
            ) : null}
            {unread && onMarkRead ? (
                <MyButton
                    icon={false}
                    variant="ghost"
                    title="notifications.mark_read"
                    onClick={() => onMarkRead(item.id)}
                    data-testid="notification-mark-read"
                />
            ) : null}
        </li>
    );
}
