/**
 * Converts between what the API stores and what the screen shows.
 *
 * There is one rule per KIND of setting, never per key. A setting that needs
 * something special says so in its registry entry (`default`, `strict`, `read`).
 */

import { z } from "zod";
import type { ApiResponse } from "@/hooks/use-api-query";
import type { SettingValue } from "@/components/settings/registry/define";
import { fieldOf, type SettingKey } from "@/components/settings/registry/fields";
import {
  CLIENT_AUTO_INACTIVE_TIME_RANGE,
  PAYMENT_DEADLINE_RANGE,
} from "@/components/settings/registry/options";

export type { SettingValue };

/** Body of POST /company/settings. */
export const SettingsPayloadSchema = z.object({
  settings: z.record(z.string(), z.union([z.string(), z.number(), z.null()])),
});
export type SettingsPayload = z.infer<typeof SettingsPayloadSchema>;

function toNumber(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === "") return null;
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;
  if (typeof raw === "string") {
    const parsed = Number(raw.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toBoolean(raw: unknown): boolean {
  if (typeof raw === "boolean") return raw;
  if (typeof raw === "number") return raw === 1;
  if (typeof raw === "string") return ["1", "true"].includes(raw.trim().toLowerCase());
  return false;
}

function toText(raw: unknown): string {
  if (raw === null || raw === undefined) return "";
  return typeof raw === "string" ? raw : String(raw);
}

/** Stored API value → value shown on screen. */
export function readSetting(key: SettingKey, raw: unknown): SettingValue {
  const field = fieldOf(key);
  if (field.read) return field.read(raw);

  switch (field.kind) {
    case "toggle":
      return raw === null || raw === undefined || raw === "" ? field.default : toBoolean(raw);

    case "select": {
      if (field.valueType === "string") return raw === null || raw === undefined || raw === "" ? field.default ?? null : String(raw);
      const value = toNumber(raw);
      if (field.strict) {
        const listed = field.options.some((option) => option.value === value);
        return listed ? value : field.default ?? null;
      }
      return value ?? field.default ?? null;
    }

    case "text": {
      if (field.default === undefined) return toText(raw);
      return toText(raw).trim() || field.default;
    }

    case "number":
    case "date":
      return toText(raw);
  }
}

/** Value on screen → value sent to the API. */
export function toPayload(key: SettingKey, value: unknown): string | number | null {
  const field = fieldOf(key);
  switch (field.kind) {
    case "toggle":
      return toBoolean(value) ? 1 : 0;
    case "select":
      if (field.valueType === "number") return toNumber(value);
      return value === null || value === undefined || String(value).trim() === "" ? null : String(value).trim();
    case "number":
      return toNumber(value);
    case "text":
    case "date": {
      const textValue = value === null || value === undefined ? "" : String(value).trim();
      return textValue === "" ? null : textValue;
    }
  }
}

/** Translation key of the problem with a typed value, or null when it can be saved. */
export function validateSetting(key: SettingKey, value: unknown): string | null {
  const field = fieldOf(key);
  if (field.kind !== "number" || value === null || value === undefined || value === "") return null;
  const parsed = toNumber(value);
  if (parsed === null) return "settings.errors.number";
  if ((field.min !== undefined && parsed < field.min) || (field.max !== undefined && parsed > field.max)) {
    return `settings.fields.${key}.errors.range`;
  }
  return null;
}

/** Payment deadline day for new clients (1–30, default 11). */
export function paymentDeadlineSetting(value: unknown): number {
  const day = toNumber(value);
  return day !== null && Number.isInteger(day) && day >= PAYMENT_DEADLINE_RANGE.min && day <= PAYMENT_DEADLINE_RANGE.max
    ? day
    : PAYMENT_DEADLINE_RANGE.fallback;
}

/** Hour of day for client auto inactive (0–23, default 12). */
export function clientAutoInactiveTimeSetting(value: unknown): number {
  const hour = toNumber(value);
  return hour !== null && Number.isInteger(hour) && hour >= CLIENT_AUTO_INACTIVE_TIME_RANGE.min && hour <= CLIENT_AUTO_INACTIVE_TIME_RANGE.max
    ? hour
    : CLIENT_AUTO_INACTIVE_TIME_RANGE.fallback;
}

/** GET /company/settings response. */
export type SettingsApiResponse = ApiResponse<{ settings: Record<string, unknown> }>;
