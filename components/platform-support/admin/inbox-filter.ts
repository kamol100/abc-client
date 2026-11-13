import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";
import {
    SUPPORT_CATEGORIES,
    SUPPORT_CHAT_STATUSES,
    SUPPORT_ISSUE_STATUSES,
    SUPPORT_PRIORITIES,
    type SupportKind,
} from "@/components/platform-support/support-model";

function choice(name: string, placeholder: string, values: readonly string[], prefix: string): FieldConfig {
    return {
        type: "dropdown",
        name,
        placeholder,
        options: values.map((value) => ({ value, label: `${prefix}.${value}` })),
    };
}

export function inboxFilterSchema(kind: SupportKind): FieldConfig[] {
    const statuses = kind === "chat" ? SUPPORT_CHAT_STATUSES : SUPPORT_ISSUE_STATUSES;
    return [
        choice("status", "platform_support.filters.status", statuses, "platform_support.statuses"),
        choice("priority", "platform_support.filters.priority", SUPPORT_PRIORITIES, "platform_support.priorities"),
        choice("category", "platform_support.filters.category", SUPPORT_CATEGORIES, "platform_support.categories"),
        {
            type: "text",
            name: "reference",
            placeholder: "platform_support.filters.reference",
            watchForFilter: true,
        },
        {
            type: "text",
            name: "subject",
            placeholder: "platform_support.inbox.filters.search",
            watchForFilter: true,
        },
        {
            type: "text",
            name: "company",
            placeholder: "platform_support.inbox.filters.company",
            watchForFilter: true,
        },
        {
            type: "text",
            name: "reseller",
            placeholder: "platform_support.inbox.filters.reseller",
            watchForFilter: true,
        },
        {
            type: "text",
            name: "requester",
            placeholder: "platform_support.inbox.filters.requester",
            watchForFilter: true,
        },
    ];
}
