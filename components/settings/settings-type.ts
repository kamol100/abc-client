import { z } from "zod";
import type { ApiResponse } from "@/hooks/use-api-query";

export const SETTINGS_TEXT_KEYS = [
    "invoice_due_reminder_voice_campaign_name",
    "voice_call_api",
    "voice_call_api_key",
    "voice_call_campaign_id",
    "gmap_api",
    "lat",
    "lon",
    "invoice_prefix",
    "bkash_username",
    "bkash_password",
    "bkash_app_key",
    "bkash_app_secret",
    "bkash_token_url",
    "bkash_create_url",
    "bkash_execute_url",
    "bkash_refresh_token_url",
    "bkash_search_transaction_url",
    "telegram_bot_token",
    "telegram_channel_id",
] as const;

export const SETTINGS_SELECT_KEYS = [
    "sms_auto_invoice_schedule",
    "invoice_due_reminder_channel",
    "sms_invoice_reminder_before_day",
] as const;

export const SETTINGS_SWITCH_KEYS = [
    "sms_after_client_create",
    "sms_after_client_activated",
    "sms_after_client_deactivated",
    "sms_after_payment_received",
    "sms_after_manual_invoice_generate",
    "sms_after_auto_invoice_generate_client",
    "sms_after_auto_invoice_paid_from_wallet",
    "sms_after_auto_invoice_generate_reseller",
    "sms_auto_invoice_due_reminder",
    "voice_call_invoice_reminder",
    "auto_inactive_client_invoice_due",
    "telegram_client_create",
    "telegram_client_update",
    "telegram_client_delete",
    "telegram_fund_transaction_create",
    "telegram_fund_transaction_delete",
    "telegram_invoice_create",
    "telegram_invoice_auto_generate",
    "telegram_invoice_update",
    "telegram_invoice_paid",
    "telegram_invoice_delete",
    "telegram_expense_create",
    "telegram_expense_update",
    "telegram_expense_delete",
    "telegram_ticket_create",
    "telegram_ticket_update",
    "telegram_ticket_delete",
    "telegram_network_create",
    "telegram_network_update",
    "telegram_network_delete",
    "telegram_package_create",
    "telegram_package_update",
    "telegram_package_delete",
    "telegram_vendor_create",
    "telegram_vendor_update",
    "telegram_vendor_delete",
] as const;

export const SETTINGS_FIELD_KEYS = [
    ...SETTINGS_TEXT_KEYS,
    ...SETTINGS_SELECT_KEYS,
    ...SETTINGS_SWITCH_KEYS,
] as const;

export type SettingsTextKey = (typeof SETTINGS_TEXT_KEYS)[number];
export type SettingsSelectKey = (typeof SETTINGS_SELECT_KEYS)[number];
export type SettingsSwitchKey = (typeof SETTINGS_SWITCH_KEYS)[number];
export type SettingsFieldKey = (typeof SETTINGS_FIELD_KEYS)[number];

const NullableStringSchema = z.string().nullable().optional();
const NullableStringOrNumberSchema = z.union([z.string(), z.number()]).nullable().optional();
const NullableBooleanLikeSchema = z
    .union([z.boolean(), z.number(), z.string()])
    .nullable()
    .optional();

export const SettingsReminderChannelSchema = z.enum(["sms", "voice"]);

export const SettingsRowSchema = z
    .object({
        invoice_due_reminder_voice_campaign_name: NullableStringSchema,
        voice_call_api: NullableStringSchema,
        voice_call_api_key: NullableStringSchema,
        voice_call_campaign_id: NullableStringSchema,
        gmap_api: NullableStringSchema,
        lat: NullableStringOrNumberSchema,
        lon: NullableStringOrNumberSchema,
        invoice_prefix: NullableStringSchema,
        bkash_username: NullableStringSchema,
        bkash_password: NullableStringSchema,
        bkash_app_key: NullableStringSchema,
        bkash_app_secret: NullableStringSchema,
        bkash_token_url: NullableStringSchema,
        bkash_create_url: NullableStringSchema,
        bkash_execute_url: NullableStringSchema,
        bkash_refresh_token_url: NullableStringSchema,
        bkash_search_transaction_url: NullableStringSchema,
        telegram_bot_token: NullableStringSchema,
        telegram_channel_id: NullableStringSchema,
        sms_auto_invoice_schedule: NullableStringOrNumberSchema,
        invoice_due_reminder_channel: SettingsReminderChannelSchema.nullable().optional(),
        sms_invoice_reminder_before_day: NullableStringOrNumberSchema,
        sms_after_client_create: NullableBooleanLikeSchema,
        sms_after_client_activated: NullableBooleanLikeSchema,
        sms_after_client_deactivated: NullableBooleanLikeSchema,
        sms_after_payment_received: NullableBooleanLikeSchema,
        sms_after_manual_invoice_generate: NullableBooleanLikeSchema,
        sms_after_auto_invoice_generate_client: NullableBooleanLikeSchema,
        sms_after_auto_invoice_paid_from_wallet: NullableBooleanLikeSchema,
        sms_after_auto_invoice_generate_reseller: NullableBooleanLikeSchema,
        sms_auto_invoice_due_reminder: NullableBooleanLikeSchema,
        voice_call_invoice_reminder: NullableBooleanLikeSchema,
        auto_inactive_client_invoice_due: NullableBooleanLikeSchema,
        telegram_client_create: NullableBooleanLikeSchema,
        telegram_client_update: NullableBooleanLikeSchema,
        telegram_client_delete: NullableBooleanLikeSchema,
        telegram_fund_transaction_create: NullableBooleanLikeSchema,
        telegram_fund_transaction_delete: NullableBooleanLikeSchema,
        telegram_invoice_create: NullableBooleanLikeSchema,
        telegram_invoice_auto_generate: NullableBooleanLikeSchema,
        telegram_invoice_update: NullableBooleanLikeSchema,
        telegram_invoice_paid: NullableBooleanLikeSchema,
        telegram_invoice_delete: NullableBooleanLikeSchema,
        telegram_expense_create: NullableBooleanLikeSchema,
        telegram_expense_update: NullableBooleanLikeSchema,
        telegram_expense_delete: NullableBooleanLikeSchema,
        telegram_ticket_create: NullableBooleanLikeSchema,
        telegram_ticket_update: NullableBooleanLikeSchema,
        telegram_ticket_delete: NullableBooleanLikeSchema,
        telegram_network_create: NullableBooleanLikeSchema,
        telegram_network_update: NullableBooleanLikeSchema,
        telegram_network_delete: NullableBooleanLikeSchema,
        telegram_package_create: NullableBooleanLikeSchema,
        telegram_package_update: NullableBooleanLikeSchema,
        telegram_package_delete: NullableBooleanLikeSchema,
        telegram_vendor_create: NullableBooleanLikeSchema,
        telegram_vendor_update: NullableBooleanLikeSchema,
        telegram_vendor_delete: NullableBooleanLikeSchema,
    })
    .passthrough();

const NullableTextFormSchema = z.string().nullable().optional();
const NullableNumberFormSchema = z.union([z.string(), z.number()]).nullable().optional();
const NullableSwitchFormSchema = z.boolean().nullable().optional();

export const SettingsFormSchema = z
    .object({
        invoice_due_reminder_voice_campaign_name: NullableTextFormSchema,
        voice_call_api: NullableTextFormSchema,
        voice_call_api_key: NullableTextFormSchema,
        voice_call_campaign_id: NullableTextFormSchema,
        gmap_api: NullableTextFormSchema,
        lat: NullableNumberFormSchema,
        lon: NullableNumberFormSchema,
        invoice_prefix: NullableTextFormSchema,
        bkash_username: NullableTextFormSchema,
        bkash_password: NullableTextFormSchema,
        bkash_app_key: NullableTextFormSchema,
        bkash_app_secret: NullableTextFormSchema,
        bkash_token_url: NullableTextFormSchema,
        bkash_create_url: NullableTextFormSchema,
        bkash_execute_url: NullableTextFormSchema,
        bkash_refresh_token_url: NullableTextFormSchema,
        bkash_search_transaction_url: NullableTextFormSchema,
        telegram_bot_token: NullableTextFormSchema,
        telegram_channel_id: NullableTextFormSchema,
        sms_auto_invoice_schedule: NullableNumberFormSchema,
        invoice_due_reminder_channel: SettingsReminderChannelSchema.nullable().optional(),
        sms_invoice_reminder_before_day: NullableNumberFormSchema,
        sms_after_client_create: NullableSwitchFormSchema,
        sms_after_client_activated: NullableSwitchFormSchema,
        sms_after_client_deactivated: NullableSwitchFormSchema,
        sms_after_payment_received: NullableSwitchFormSchema,
        sms_after_manual_invoice_generate: NullableSwitchFormSchema,
        sms_after_auto_invoice_generate_client: NullableSwitchFormSchema,
        sms_after_auto_invoice_paid_from_wallet: NullableSwitchFormSchema,
        sms_after_auto_invoice_generate_reseller: NullableSwitchFormSchema,
        sms_auto_invoice_due_reminder: NullableSwitchFormSchema,
        voice_call_invoice_reminder: NullableSwitchFormSchema,
        auto_inactive_client_invoice_due: NullableSwitchFormSchema,
        telegram_client_create: NullableSwitchFormSchema,
        telegram_client_update: NullableSwitchFormSchema,
        telegram_client_delete: NullableSwitchFormSchema,
        telegram_fund_transaction_create: NullableSwitchFormSchema,
        telegram_fund_transaction_delete: NullableSwitchFormSchema,
        telegram_invoice_create: NullableSwitchFormSchema,
        telegram_invoice_auto_generate: NullableSwitchFormSchema,
        telegram_invoice_update: NullableSwitchFormSchema,
        telegram_invoice_paid: NullableSwitchFormSchema,
        telegram_invoice_delete: NullableSwitchFormSchema,
        telegram_expense_create: NullableSwitchFormSchema,
        telegram_expense_update: NullableSwitchFormSchema,
        telegram_expense_delete: NullableSwitchFormSchema,
        telegram_ticket_create: NullableSwitchFormSchema,
        telegram_ticket_update: NullableSwitchFormSchema,
        telegram_ticket_delete: NullableSwitchFormSchema,
        telegram_network_create: NullableSwitchFormSchema,
        telegram_network_update: NullableSwitchFormSchema,
        telegram_network_delete: NullableSwitchFormSchema,
        telegram_package_create: NullableSwitchFormSchema,
        telegram_package_update: NullableSwitchFormSchema,
        telegram_package_delete: NullableSwitchFormSchema,
        telegram_vendor_create: NullableSwitchFormSchema,
        telegram_vendor_update: NullableSwitchFormSchema,
        telegram_vendor_delete: NullableSwitchFormSchema,
    })
    .passthrough();

export const SettingsPayloadSchema = z.object({
    settings: z.record(z.string(), z.union([z.string(), z.number(), z.null()])),
});

export type SettingsRow = z.infer<typeof SettingsRowSchema>;
export type SettingsFormInput = z.infer<typeof SettingsFormSchema>;
export type SettingsPayload = z.infer<typeof SettingsPayloadSchema>;
export type SettingsApiResponse = ApiResponse<{ settings: SettingsRow }>;

const NUMBER_INPUT_KEYS = new Set<SettingsTextKey>(["lat", "lon"]);
const NUMBER_SELECT_KEYS = new Set<SettingsSelectKey>([
    "sms_auto_invoice_schedule",
    "sms_invoice_reminder_before_day",
]);

export function isSettingsSwitchKey(key: SettingsFieldKey): key is SettingsSwitchKey {
    return (SETTINGS_SWITCH_KEYS as readonly string[]).includes(key);
}

export function isSettingsSelectKey(key: SettingsFieldKey): key is SettingsSelectKey {
    return (SETTINGS_SELECT_KEYS as readonly string[]).includes(key);
}

function toBoolean(value: unknown): boolean {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value === 1;
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        return normalized === "1" || normalized === "true";
    }
    return false;
}

function toNumberOrNull(value: unknown): number | null {
    if (value === null || value === undefined || value === "") return null;
    if (typeof value === "number") return Number.isFinite(value) ? value : null;
    if (typeof value === "string") {
        const parsed = Number(value.trim());
        return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
}

function toStringOrEmpty(value: unknown): string {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value;
    return String(value);
}

export function normalizeSettingValueForForm(
    key: SettingsFieldKey,
    value: unknown
): SettingsFormInput[SettingsFieldKey] {
    if (isSettingsSwitchKey(key)) {
        return toBoolean(value);
    }

    if (isSettingsSelectKey(key)) {
        if (NUMBER_SELECT_KEYS.has(key)) {
            return toNumberOrNull(value);
        }
        if (key === "invoice_due_reminder_channel") {
            return value === "voice" ? "voice" : "sms";
        }
    }

    if (NUMBER_INPUT_KEYS.has(key as SettingsTextKey)) {
        return toStringOrEmpty(value);
    }

    return toStringOrEmpty(value);
}

export function normalizeSettingsForForm(
    rawSettings: Partial<Record<string, unknown>>
): SettingsFormInput {
    const normalized: Partial<Record<SettingsFieldKey, unknown>> = {};

    SETTINGS_FIELD_KEYS.forEach((key) => {
        normalized[key] = normalizeSettingValueForForm(key, rawSettings[key]);
    });

    return normalized as SettingsFormInput;
}

export function toSettingsPayloadValue(
    key: SettingsFieldKey,
    value: unknown
): string | number | null {
    if (isSettingsSwitchKey(key)) {
        return toBoolean(value) ? 1 : 0;
    }

    if (isSettingsSelectKey(key)) {
        if (NUMBER_SELECT_KEYS.has(key)) {
            return toNumberOrNull(value);
        }
        if (value === null || value === undefined) return null;
        const stringValue = String(value).trim();
        return stringValue ? stringValue : null;
    }

    if (NUMBER_INPUT_KEYS.has(key as SettingsTextKey)) {
        return toNumberOrNull(value);
    }

    if (value === null || value === undefined) return null;
    const textValue = String(value).trim();
    return textValue ? textValue : null;
}
