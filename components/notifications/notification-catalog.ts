import type { LucideIcon } from "lucide-react";
import { LifeBuoy, MessagesSquare, Network, Receipt, Users } from "lucide-react";

export const NOTIFICATION_CATEGORIES = ["network", "client", "support", "invoice", "platform_support"] as const;

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
    { value: "sms_not_sent", category: "invoice" },
    { value: "platform_support_issue_created", category: "platform_support" },
    { value: "platform_support_chat_started", category: "platform_support" },
    { value: "platform_support_message_received", category: "platform_support" },
    { value: "platform_support_assignment_changed", category: "platform_support" },
    { value: "platform_support_status_changed", category: "platform_support" },
    { value: "platform_support_chat_converted", category: "platform_support" },
] as const;

export type NotificationEventValue = (typeof NOTIFICATION_EVENTS)[number]["value"];

const PAYMENT_SOURCES = ["collector", "online", "wallet"] as const;

const CATEGORY_ICONS: Record<NotificationCategory, LucideIcon> = {
    network: Network,
    client: Users,
    support: LifeBuoy,
    invoice: Receipt,
    platform_support: MessagesSquare,
};

const PLATFORM_SUPPORT_EVENTS = new Set<string>([
    "platform_support_issue_created",
    "platform_support_chat_started",
    "platform_support_message_received",
    "platform_support_assignment_changed",
    "platform_support_status_changed",
    "platform_support_chat_converted",
]);

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
    if (PLATFORM_SUPPORT_EVENTS.has(event)) {
        return [
            `notifications.events.${event}.platform`,
            `notifications.events.${event}.tenant`,
        ];
    }

    if (event === "invoice_paid" || event === "invoice_partially_paid") {
        return [
            ...PAYMENT_SOURCES.map((source) => `notifications.events.${event}.${source}`),
            `notifications.events.${event}.message`,
        ];
    }

    return [`notifications.events.${event}.message`];
}

type NotificationTranslator = (key: string) => string;

const STATUS_LABEL_KEYS: Record<string, string> = {
    open: "ticket.status.open",
    in_progress: "ticket.status.in_progress",
    resolved: "ticket.status.resolved",
    closed: "ticket.status.closed",
    online: "onu.status.online",
    offline: "onu.status.offline",
    los: "onu.status.los",
    dying_gasp: "onu.status.dying_gasp",
    unknown: "onu.status.unknown",
    waiting_for_requester: "notifications.statuses.waiting_for_requester",
    converted: "notifications.statuses.converted",
    up: "monitoring.state.up",
    down: "monitoring.state.down",
};

const CHANGE_LABEL_KEYS: Record<string, string> = {
    details: "notifications.changes.details",
    package: "notifications.changes.package",
    status: "notifications.changes.status",
};

function translatedToken(
    value: string,
    labels: Record<string, string>,
    translate: NotificationTranslator | undefined
): string {
    const key = labels[value];
    if (!key || !translate) return value;
    const text = translate(key);
    return text && text !== key ? text : value;
}

export function notificationInterpolation(
    data: NotificationRow["data"] | undefined,
    translate?: NotificationTranslator
): Record<string, string | number> {
    const values: Record<string, string | number> = {};
    for (const [key, value] of Object.entries(data ?? {})) {
        if (typeof value === "string" || typeof value === "number") values[key] = value;
        else if (typeof value === "boolean") values[key] = value ? "1" : "0";
    }

    const ticketNumber = values.ticket_number;
    if (
        (typeof ticketNumber === "string" || typeof ticketNumber === "number") &&
        values.ticket_no === undefined
    ) {
        values.ticket_no = ticketNumber;
    }

    if (typeof values.status === "string") {
        values.status = translatedToken(values.status, STATUS_LABEL_KEYS, translate);
        if (values.to === undefined) values.to = values.status;
    }

    if (typeof values.from_status === "string" && values.from === undefined) {
        values.from = translatedToken(values.from_status, STATUS_LABEL_KEYS, translate);
    }

    if (typeof values.change === "string") {
        values.change = translatedToken(values.change, CHANGE_LABEL_KEYS, translate);
    }

    return values;
}

export function resolveNotificationHref(
    subject: NotificationSubject | null | undefined,
    data?: NotificationRow["data"]
): string | null {
    if (!subject?.type) return null;
    if (subject.type === "onu") return "/onus";
    if (!subject.uuid) return null;

    if (subject.type === "platform_support_thread") {
        if (data?.audience === "platform") return `/platform-support-admin/threads/${subject.uuid}`;
        if (data?.kind === "chat") return `/platform-support/chats/${subject.uuid}`;
        return `/platform-support/issues/${subject.uuid}`;
    }

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
