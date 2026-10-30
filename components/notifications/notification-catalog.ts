import type { LucideIcon } from "lucide-react";
import { LifeBuoy, Network, Receipt, Users } from "lucide-react";

export const NOTIFICATION_CATEGORIES = ["network", "client", "support", "invoice"] as const;

export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

export const NOTIFICATION_EVENTS = [
    { value: "olt_offline", category: "network" },
    { value: "olt_online", category: "network" },
    { value: "olt_status_changed", category: "network" },
    { value: "onu_offline", category: "network" },
    { value: "onu_online", category: "network" },
    { value: "onu_status_changed", category: "network" },
    { value: "onu_status_summary", category: "network" },
    { value: "client_created", category: "client" },
    { value: "client_updated", category: "client" },
    { value: "client_deleted", category: "client" },
    { value: "ticket_created", category: "support" },
    { value: "ticket_updated", category: "support" },
    { value: "ticket_status_changed", category: "support" },
    { value: "ticket_resolved", category: "support" },
    { value: "ticket_closed", category: "support" },
    { value: "invoice_created", category: "invoice" },
    { value: "invoice_updated", category: "invoice" },
    { value: "invoice_paid", category: "invoice" },
    { value: "invoice_partially_paid", category: "invoice" },
    { value: "invoices_generated", category: "invoice" },
    { value: "invoice_overdue", category: "invoice" },
] as const;

export type NotificationEventValue = (typeof NOTIFICATION_EVENTS)[number]["value"];

const PAYMENT_SOURCES = ["collector", "online", "wallet"] as const;

const CATEGORY_ICONS: Record<NotificationCategory, LucideIcon> = {
    network: Network,
    client: Users,
    support: LifeBuoy,
    invoice: Receipt,
};

export interface NotificationSubject {
    type: string;
    uuid: string | null;
}

export interface NotificationRow {
    id: string;
    category: string;
    event: string;
    title_key: string;
    message_key: string;
    data: Record<string, string | number | boolean | null>;
    subject: NotificationSubject | null;
    read_at: string | null;
    created_at: string;
}

export function notificationCategoryIcon(category: string): LucideIcon {
    if (isNotificationCategory(category)) return CATEGORY_ICONS[category];
    return Network;
}

export function isNotificationCategory(value: string): value is NotificationCategory {
    return (NOTIFICATION_CATEGORIES as readonly string[]).includes(value);
}

export function eventsForCategory(category: NotificationCategory): NotificationEventValue[] {
    return NOTIFICATION_EVENTS.filter((event) => event.category === category).map((event) => event.value);
}

export function notificationSettingKey(event: NotificationEventValue): string {
    return `notify_${event}`;
}

export function notificationCategorySettingKey(category: NotificationCategory): string {
    return `notify_category_${category}`;
}

/** A missing setting is enabled. Only an explicit off value disables the event. */
export function isNotificationSettingEnabled(value: unknown): boolean {
    return value !== 0 && value !== "0" && value !== false;
}

export function notificationTitleKey(event: string): string {
    return `notifications.events.${event}.title`;
}

export function notificationMessageKeys(event: string): string[] {
    if (event === "invoice_paid" || event === "invoice_partially_paid") {
        return [
            ...PAYMENT_SOURCES.map((source) => `notifications.events.${event}.${source}`),
            `notifications.events.${event}.message`,
        ];
    }

    return [`notifications.events.${event}.message`];
}

export function notificationInterpolation(
    data: NotificationRow["data"] | undefined
): Record<string, string | number> {
    const values: Record<string, string | number> = {};
    for (const [key, value] of Object.entries(data ?? {})) {
        if (typeof value === "string" || typeof value === "number") values[key] = value;
        else if (typeof value === "boolean") values[key] = value ? "1" : "0";
    }
    return values;
}

export function resolveNotificationHref(subject: NotificationSubject | null | undefined): string | null {
    if (!subject?.type) return null;
    if (subject.type === "onu") return "/onus";
    if (!subject.uuid) return null;

    switch (subject.type) {
        case "client":
            return `/clients/view/${subject.uuid}`;
        case "ticket":
            return `/tickets/view/${subject.uuid}`;
        case "invoice":
            return `/invoices/edit/${subject.uuid}`;
        case "olt":
            return `/olts/view/${subject.uuid}`;
        default:
            return null;
    }
}
