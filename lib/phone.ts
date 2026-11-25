import { z } from "zod";

/**
 * Bangladeshi mobile numbers are saved in one form: 11 digits, 01[3-9]XXXXXXXX
 * (013/017 GP, 014/019 Banglalink, 015 Teletalk, 016/018 Robi). The API applies
 * the same rule (isp-backend `App\Services\Phone\BangladeshMobile`).
 */
export const BD_MOBILE_REGEX = /^01[3-9]\d{8}$/;

export const BD_MOBILE_PLACEHOLDER = "01XXXXXXXXX";

export const BD_MOBILE_INVALID = "common.phone_bd_mobile_invalid";

const LOCAL_FORMS = [
  /^(01[3-9]\d{8})$/, // 01712345678
  /^(?:00)?88(01[3-9]\d{8})$/, // 8801712345678, 008801712345678
  /^(?:00)?880(01[3-9]\d{8})$/, // 88001712345678 (extra 0)
  /^(1[3-9]\d{8})$/, // 1712345678 (no leading 0)
];

export function isBdMobile(value: string | null | undefined): value is string {
  return typeof value === "string" && BD_MOBILE_REGEX.test(value);
}

/**
 * The 01XXXXXXXXX form of a number typed as +880 1712-345678, 8801712345678,
 * 88001712345678 or 1712345678. Blank becomes null; anything that is not a
 * Bangladeshi mobile number comes back only trimmed, so validation can reject it.
 */
export function normalizeBdMobile(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  if (trimmed === "") return null;

  let digits = trimmed.replace(/[\s\-.()]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  if (!/^\d+$/.test(digits)) return trimmed;

  for (const form of LOCAL_FORMS) {
    const match = digits.match(form);
    if (match) return match[1].startsWith("0") ? match[1] : `0${match[1]}`;
  }
  return trimmed;
}

/** A required mobile number; a typed country code is removed before the check. */
export function requiredBdMobile(requiredMessage: string, invalidMessage: string = BD_MOBILE_INVALID) {
  return z
    .string({ required_error: requiredMessage, invalid_type_error: requiredMessage })
    .transform((value) => normalizeBdMobile(value) ?? "")
    .pipe(
      z
        .string()
        .min(1, { message: requiredMessage })
        .regex(BD_MOBILE_REGEX, { message: invalidMessage }),
    );
}

/** An optional mobile number: blank is sent as null. */
export function optionalBdMobile(invalidMessage: string = BD_MOBILE_INVALID) {
  return z
    .string()
    .nullable()
    .transform((value) => normalizeBdMobile(value))
    .pipe(z.string().regex(BD_MOBILE_REGEX, { message: invalidMessage }).nullable());
}
