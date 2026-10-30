import type { FormFieldConfig, SelectOption } from "@/components/form-wrapper/form-builder-type";
import { DASHBOARD_VISIBILITY_ITEMS } from "@/components/dashboard/dashboard-visibility";
import type {
    SettingsFieldKey,
    SettingsSelectKey,
    SettingsSwitchKey,
    SettingsTextKey,
} from "@/components/settings/settings-type";

export type SettingsSectionKey =
    | "general"
    | "olt"
    | "sms"
    | "map"
    | "telegram"
    | "dashboard"
    | "monitoring";

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
    permission?: string;
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

/** Minutes between OLT polls (PON ports and ONUs); 0 = off. Same values as the API's monitoring.olt.poll_intervals. */
export const OLT_POLL_INTERVAL_OPTIONS: SettingsOptionConfig[] = [0, 5, 15, 30].map((minutes) => ({
    value: minutes,
    label: `settings.options.olt_poll_interval_${minutes}`,
}));

const SMS_CHANNEL_OPTIONS: SettingsOptionConfig[] = [
    { value: "sms", label: "settings.options.reminder_channel_sms" }
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

// Minutes between automatic device checks (0 = off), and the failed checks in a row before a device is marked down.
const MONITOR_INTERVAL_OPTIONS: SettingsOptionConfig[] = [0, 1, 2, 5, 10, 15, 30, 60].map((minutes) => ({
    value: minutes,
    label: `settings.options.monitor_interval_${minutes === 0 ? "off" : minutes}`,
}));

const MONITOR_FAIL_THRESHOLD_OPTIONS: SettingsOptionConfig[] = Array.from({ length: 10 }, (_, index) => ({
    value: index + 1,
    label: `settings.options.monitor_fail_threshold_${index + 1}`,
}));

export const SETTINGS_SECTION_SCHEMA: Record<SettingsSectionKey, SettingsSectionSchema> = {
    general: {
        title: "settings.sections.general.title",
        description: "settings.sections.general.description",
        fields: [
            { kind: "text", key: "invoice_prefix" },
            { kind: "text", key: "pid_prefix" },
            { kind: "text", key: "expense_id_prefix" },
            { kind: "text", key: "product_code_prefix" },
            { kind: "switch", key: "auto_inactive_client_invoice_due" },
            { kind: "switch", key: "client_view_open_on_new_tab" },
            { kind: "switch", key: "client_edit_open_on_new_tab" },
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
    olt: {
        title: "settings.sections.olt.title",
        description: "settings.sections.olt.description",
        fields: [
            { kind: "select", key: "olt_poll_interval", options: OLT_POLL_INTERVAL_OPTIONS },
            { kind: "text", key: "onu_rx_power_low_dbm", inputType: "number" },
            { kind: "switch", key: "telegram_onu_low_power" },
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
    dashboard: {
        title: "settings.sections.dashboard.title",
        description: "settings.sections.dashboard.description",
        fields: DASHBOARD_VISIBILITY_ITEMS.map((item): SettingsSwitchFieldSchema =>
            item.permission
                ? { kind: "switch", key: item.settingKey, permission: item.permission }
                : { kind: "switch", key: item.settingKey },
        ),
    },
    monitoring: {
        title: "settings.sections.monitoring.title",
        description: "settings.sections.monitoring.description",
        fields: [
            { kind: "select", key: "device_monitor_interval", options: MONITOR_INTERVAL_OPTIONS },
            { kind: "select", key: "device_monitor_fail_threshold", options: MONITOR_FAIL_THRESHOLD_OPTIONS },
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

export function filterSettingsFieldsByPermission(
    fields: SettingsFieldSchema[],
    hasPermission: (permission: string) => boolean,
): SettingsFieldSchema[] {
    return fields.filter((field) => {
        if (field.kind !== "switch" || !field.permission) return true;
        return hasPermission(field.permission);
    });
}

export function buildSettingsFieldConfigs(fields: SettingsFieldSchema[]): FormFieldConfig[] {
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

export function buildSettingsFormSchema(
    section: SettingsSectionKey
): FormFieldConfig[] {
    return buildSettingsFieldConfigs(SETTINGS_SECTION_SCHEMA[section].fields);
}

export function getSectionFieldKeys(section: SettingsSectionKey): SettingsFieldKey[] {
    return SETTINGS_SECTION_SCHEMA[section].fields.map((field) => field.key);
}
