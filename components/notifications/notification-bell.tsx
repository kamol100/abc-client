"use client";

import { NotificationList } from "@/components/notifications/notification-list";
import { MyButton } from "@/components/my-button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePermissions } from "@/context/app-provider";
import {
    useNotificationActions,
    useRecentNotifications,
    useUnreadCount,
} from "@/hooks/use-notifications";
import { Bell } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export function NotificationBell() {
    const { hasPermission } = usePermissions();

    if (!hasPermission("notifications.access")) {
        return null;
    }

    return <NotificationBellMenu />;
}

function NotificationBellMenu() {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const { count } = useUnreadCount();
    const recent = useRecentNotifications(count);
    const { markRead, markAllRead } = useNotificationActions();
    const items = recent.data?.data ?? [];
    const badge = count > 99 ? "99+" : count > 0 ? String(count) : null;

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <MyButton
                    icon={false}
                    variant="outline"
                    aria-label={t("notifications.title")}
                    data-testid="notification-bell"
                    className="relative"
                    size="default"
                >
                    <Bell className="size-4" />
                    {badge ? (
                        <span
                            className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground"
                            data-testid="notification-badge"
                        >
                            {badge}
                        </span>
                    ) : null}
                </MyButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0 sm:w-96">
                <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
                    <span className="text-sm font-medium">{t("notifications.title")}</span>
                    <MyButton
                        icon={false}
                        variant="ghost"
                        title="notifications.mark_all_read"
                        onClick={() => markAllRead()}
                        disabled={count === 0}
                        data-testid="notification-mark-all"
                    />
                </div>
                <div className="max-h-96 overflow-y-auto">
                    <NotificationList
                        items={items}
                        isLoading={recent.isLoading}
                        isError={recent.isError}
                        onMarkRead={markRead}
                        compact
                    />
                </div>
                <div className="border-t px-3 py-2">
                    <Link
                        href="/notifications"
                        className="text-sm text-primary"
                        data-testid="notification-view-all"
                        onClick={() => setOpen(false)}
                    >
                        {t("notifications.view_all")}
                    </Link>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
