"use client";

import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";
import { NOTIFICATION_CATEGORIES } from "@/components/notifications/notification-catalog";

export function NotificationFilterSchema(): FieldConfig[] {
    return [
        {
            type: "dropdown",
            name: "status",
            placeholder: "notifications.filters.status",
            options: [
                { value: "all", label: "notifications.filters.all" },
                { value: "unread", label: "notifications.filters.unread" },
                { value: "read", label: "notifications.filters.read" },
            ],
        },
        {
            type: "dropdown",
            name: "category",
            placeholder: "notifications.filters.category",
            options: NOTIFICATION_CATEGORIES.map((category) => ({
                value: category,
                label: `notifications.categories.${category}`,
            })),
        },
    ];
}

export function notificationListParams(filterValue: string | null): Record<string, string> | undefined {
    if (!filterValue) return undefined;
    const params = Object.fromEntries(new URLSearchParams(filterValue));
    return Object.keys(params).length > 0 ? params : undefined;
}
