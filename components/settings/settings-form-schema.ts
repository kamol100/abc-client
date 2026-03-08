import type { FormFieldConfig, SelectOption } from "@/components/form-wrapper/form-builder-type";
import type {
    SettingsFieldKey,
    SettingsSelectKey,
    SettingsSwitchKey,
    SettingsTextKey,
} from "./settings-type";

export type SettingsSectionKey =
    | "general"
    | "sms"
    | "voice_call"
    | "map"
    | "payments"
    | "telegram";

type SettingsOptionConfig = {
    value: string | number;
    label: string;
};

type SettingsTextFieldSchema = {
    kind: "text";
    key: SettingsTextKey;
    inputType?: "text" | "password" | "number";
};

type SettingsSwitchFieldSchema = {
    kind: "switch";
    key: SettingsSwitchKey;
};

type SettingsSelectFieldSchema = {
    kind: "select";
    key: SettingsSelectKey;
    options: SettingsOptionConfig[];
};

export type SettingsFieldSchema =
    | SettingsTextFieldSchema
    | SettingsSwitchFieldSchema
    | SettingsSelectFieldSchema;

export type SettingsSectionSchema = {
    title: string;
    description: string;
    fields: SettingsFieldSchema[];
};

const SMS_CHANNEL_OPTIONS: SettingsOptionConfig[] = [
    { value: "sms", label: "settings.options.reminder_channel_sms" },
    { value: "voice", label: "settings.options.reminder_channel_voice" },
];

const SMS_REMINDER_DAY_OPTIONS: SettingsOptionConfig[] = Array.from(
    { length: 15 },
    (_, index) => {
        const day = index + 1;
        return {
            value: day,
            label: `settings.options.reminder_day_${day}`,
        };
    }
);

const SMS_SCHEDULE_OPTIONS: SettingsOptionConfig[] = Array.from(
    { length: 14 },
    (_, index) => {
        const hour = index + 7;
        const paddedHour = String(hour).padStart(2, "0");
        return {
            value: hour,
            label: `settings.options.schedule_${paddedHour}`,
        };
    }
);

export const SETTINGS_SECTION_SCHEMA: Record<SettingsSectionKey, SettingsSectionSchema> = {
    general: {
        title: "settings.sections.general.title",
        description: "settings.sections.general.description",
        fields: [
            { kind: "text", key: "invoice_prefix" },
            { kind: "switch", key: "auto_inactive_client_invoice_due" },
        ],
    },
    sms: {
        title: "settings.sections.sms.title",
        description: "settings.sections.sms.description",
        fields: [
            { kind: "switch", key: "sms_after_client_create" },
            { kind: "switch", key: "sms_after_client_activated" },
            { kind: "switch", key: "sms_after_client_deactivated" },
            { kind: "switch", key: "sms_after_payment_received" },
            { kind: "switch", key: "sms_after_manual_invoice_generate" },
            { kind: "switch", key: "sms_after_auto_invoice_generate_client" },
            { kind: "switch", key: "sms_after_auto_invoice_paid_from_wallet" },
            { kind: "switch", key: "sms_after_auto_invoice_generate_reseller" },
            { kind: "select", key: "sms_auto_invoice_schedule", options: SMS_SCHEDULE_OPTIONS },
            { kind: "switch", key: "sms_auto_invoice_due_reminder" },
            { kind: "select", key: "invoice_due_reminder_channel", options: SMS_CHANNEL_OPTIONS },
            { kind: "text", key: "invoice_due_reminder_voice_campaign_name" },
            { kind: "switch", key: "voice_call_invoice_reminder" },
            { kind: "select", key: "sms_invoice_reminder_before_day", options: SMS_REMINDER_DAY_OPTIONS },
        ],
    },
    voice_call: {
        title: "settings.sections.voice_call.title",
        description: "settings.sections.voice_call.description",
        fields: [
            { kind: "text", key: "voice_call_api" },
            { kind: "text", key: "voice_call_api_key" },
            { kind: "text", key: "voice_call_campaign_id" },
        ],
    },
    map: {
        title: "settings.sections.map.title",
        description: "settings.sections.map.description",
        fields: [
            { kind: "text", key: "gmap_api" },
            { kind: "text", key: "lat", inputType: "number" },
            { kind: "text", key: "lon", inputType: "number" },
        ],
    },
    payments: {
        title: "settings.sections.payments.title",
        description: "settings.sections.payments.description",
        fields: [
            { kind: "text", key: "bkash_username" },
            { kind: "text", key: "bkash_password", inputType: "password" },
            { kind: "text", key: "bkash_app_key" },
            { kind: "text", key: "bkash_app_secret", inputType: "password" },
            { kind: "text", key: "bkash_token_url" },
            { kind: "text", key: "bkash_create_url" },
            { kind: "text", key: "bkash_execute_url" },
            { kind: "text", key: "bkash_refresh_token_url" },
            { kind: "text", key: "bkash_search_transaction_url" },
        ],
    },
    telegram: {
        title: "settings.sections.telegram.title",
        description: "settings.sections.telegram.description",
        fields: [
            { kind: "text", key: "telegram_bot_token" },
            { kind: "text", key: "telegram_channel_id" },
            { kind: "switch", key: "telegram_client_create" },
            { kind: "switch", key: "telegram_client_update" },
            { kind: "switch", key: "telegram_client_delete" },
            { kind: "switch", key: "telegram_fund_transaction_create" },
            { kind: "switch", key: "telegram_fund_transaction_delete" },
            { kind: "switch", key: "telegram_invoice_create" },
            { kind: "switch", key: "telegram_invoice_auto_generate" },
            { kind: "switch", key: "telegram_invoice_update" },
            { kind: "switch", key: "telegram_invoice_paid" },
            { kind: "switch", key: "telegram_invoice_delete" },
            { kind: "switch", key: "telegram_expense_create" },
            { kind: "switch", key: "telegram_expense_update" },
            { kind: "switch", key: "telegram_expense_delete" },
            { kind: "switch", key: "telegram_ticket_create" },
            { kind: "switch", key: "telegram_ticket_update" },
            { kind: "switch", key: "telegram_ticket_delete" },
            { kind: "switch", key: "telegram_network_create" },
            { kind: "switch", key: "telegram_network_update" },
            { kind: "switch", key: "telegram_network_delete" },
            { kind: "switch", key: "telegram_package_create" },
            { kind: "switch", key: "telegram_package_update" },
            { kind: "switch", key: "telegram_package_delete" },
            { kind: "switch", key: "telegram_vendor_create" },
            { kind: "switch", key: "telegram_vendor_update" },
            { kind: "switch", key: "telegram_vendor_delete" },
        ],
    },
};

export function buildSettingsFormSchema(
    section: SettingsSectionKey
): FormFieldConfig[] {
    const fields = SETTINGS_SECTION_SCHEMA[section].fields;

    return fields.map((field): FormFieldConfig => {
        if (field.kind === "text") {
            return {
                type: field.inputType ?? "text",
                name: field.key,
                placeholder: `settings.fields.${field.key}.placeholder`,
            };
        }

        if (field.kind === "switch") {
            return {
                type: "switch",
                name: field.key,
            };
        }

        return {
            type: "dropdown",
            name: field.key,
            options: field.options as SelectOption[],
            placeholder: `settings.fields.${field.key}.placeholder`,
            isClearable: false,
        };
    });
}

export function getSectionFieldKeys(section: SettingsSectionKey): SettingsFieldKey[] {
    return SETTINGS_SECTION_SCHEMA[section].fields.map((field) => field.key);
}
