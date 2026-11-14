import { z } from "zod";
import type { FieldConfig, FormFieldConfig } from "@/components/form-wrapper/form-builder-type";
import {
    SUPPORT_CATEGORIES,
    SUPPORT_CHAT_STATUSES,
    SUPPORT_ISSUE_STATUSES,
    SUPPORT_PRIORITIES,
    type SupportKind,
    type SupportScope,
} from "@/components/platform-support/support-model";

const category = z.enum(SUPPORT_CATEGORIES, {
    required_error: "platform_support.category.errors.required",
    invalid_type_error: "platform_support.category.errors.invalid",
});

const priority = z.enum(SUPPORT_PRIORITIES, {
    required_error: "platform_support.priority.errors.required",
    invalid_type_error: "platform_support.priority.errors.invalid",
});

const body = z.string().max(10000, "platform_support.message.errors.max").optional();

function needsMessage(value: { body?: string; attachment_count?: number }, context: z.RefinementCtx) {
    const text = value.body?.trim() ?? "";
    if (text === "" && (value.attachment_count ?? 0) < 1) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["body"],
            message: "platform_support.message.errors.required",
        });
    }
}

export const SupportIssueSchema = z.object({
    category,
    priority,
    body,
    attachment_count: z.number().optional(),
}).superRefine(needsMessage);

export const SupportMessageSchema = z.object({
    body,
    attachment_count: z.number().optional(),
}).superRefine(needsMessage);

export const SupportConvertSchema = z.object({
    category,
    priority,
});

function choice(name: string, placeholder: string, values: readonly string[], prefix: string): FieldConfig {
    return {
        type: "dropdown",
        name,
        placeholder,
        label: { labelText: placeholder, mandatory: true },
        options: values.map((value) => ({ value, label: `${prefix}.${value}` })),
    };
}

export function supportIssueFields(): FormFieldConfig[] {
    return [
        choice("category", "platform_support.category.label", SUPPORT_CATEGORIES, "platform_support.categories"),
        {
            type: "dropdown",
            name: "priority",
            placeholder: "platform_support.priority.label",
            label: { labelText: "platform_support.priority.label", mandatory: true },
            defaultValue: "normal",
            options: SUPPORT_PRIORITIES.map((value) => ({
                value,
                label: `platform_support.priorities.${value}`,
            })),
        },
        {
            type: "textarea",
            name: "body",
            rows: 4,
            placeholder: "platform_support.message.placeholder",
            label: { labelText: "platform_support.message.label" },
        },
    ];
}

export function supportMessageFields(): FormFieldConfig[] {
    return [
        {
            type: "textarea",
            name: "body",
            rows: 3,
            placeholder: "platform_support.message.placeholder",
            label: { labelText: "platform_support.message.label" },
        },
    ];
}

export function supportConvertFields(): FormFieldConfig[] {
    return supportIssueFields().filter((field) => field.name !== "body");
}

export function supportFilterSchema(scope: SupportScope, kind: SupportKind): FieldConfig[] {
    const statuses = kind === "chat" ? SUPPORT_CHAT_STATUSES : SUPPORT_ISSUE_STATUSES;
    const fields: FieldConfig[] = [
        choice("status", "platform_support.filters.status", statuses, "platform_support.statuses"),
        choice("priority", "platform_support.filters.priority", SUPPORT_PRIORITIES, "platform_support.priorities"),
        choice("category", "platform_support.filters.category", SUPPORT_CATEGORIES, "platform_support.categories"),
        {
            type: "text",
            name: "reference",
            placeholder: "platform_support.filters.reference",
            watchForFilter: true,
        },
    ];
    if (scope === "company") {
        fields.push({
            type: "text",
            name: "reseller",
            placeholder: "platform_support.filters.reseller",
            watchForFilter: true,
        });
    }
    return fields.map((field) => field.type === "dropdown" ? { ...field, label: undefined } : field);
}
