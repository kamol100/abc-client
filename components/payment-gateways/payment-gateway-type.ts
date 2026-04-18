import { z } from "zod";

export const PAYMENT_PROVIDERS = [
  "bkash",
  "nagad",
  "rocket",
  "sslcommerz",
  "card",
  "bank",
  "manual",
] as const;
export type PaymentProvider = (typeof PAYMENT_PROVIDERS)[number];

export const PAYMENT_MODES = ["sandbox", "live"] as const;
export type PaymentMode = (typeof PAYMENT_MODES)[number];

export const PAYMENT_STATUSES = ["active", "inactive"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

/**
 * Fields mandated per provider. Mirrors backend enum
 * App\Enums\PaymentGatewayProvider::requiredFields().
 */
export const PROVIDER_REQUIRED_FIELDS: Record<PaymentProvider, string[]> = {
  bkash: ["app_key", "app_secret", "username", "password"],
  nagad: ["merchant_number", "api_key", "api_secret"],
  rocket: ["merchant_number", "api_key"],
  sslcommerz: ["api_key", "api_secret"],
  card: [],
  bank: [],
  manual: [],
};

/** API row shape (list + edit hydration). `id` is a UUID string. */
export const PaymentGatewayRowSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    slug: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    logo: z.string().nullable().optional(),

    provider: z.enum(PAYMENT_PROVIDERS),
    integration_type: z.string().nullable().optional(),
    mode: z.enum(PAYMENT_MODES).nullable().optional(),
    base_url: z.string().nullable().optional(),

    app_key: z.string().nullable().optional(),
    username: z.string().nullable().optional(),
    merchant_number: z.string().nullable().optional(),
    api_key: z.string().nullable().optional(),
    api_url: z.string().nullable().optional(),

    has_app_secret: z.boolean().optional(),
    has_password: z.boolean().optional(),
    has_api_secret: z.boolean().optional(),

    success_url: z.string().nullable().optional(),
    fail_url: z.string().nullable().optional(),
    cancel_url: z.string().nullable().optional(),
    ipn_url: z.string().nullable().optional(),

    currency: z.string().nullable().optional(),
    transaction_fee_percent: z.coerce.number().nullable().optional(),
    transaction_fee_fixed: z.coerce.number().nullable().optional(),

    config: z.record(z.unknown()).nullable().optional(),
    is_default: z.boolean().optional(),
    status: z.enum(PAYMENT_STATUSES).optional(),

    company: z.record(z.unknown()).nullable().optional(),
    reseller: z.record(z.unknown()).nullable().optional(),
  })
  .passthrough();

export type PaymentGatewayRow = z.infer<typeof PaymentGatewayRowSchema>;

/**
 * Form schema — credentials are optional at the zod layer. Per-provider
 * requirement is enforced by a single `.superRefine` driven by
 * PROVIDER_REQUIRED_FIELDS so adding a new provider requires zero
 * changes to this file beyond the table above.
 */
export const PaymentGatewayFormSchema = z
  .object({
    name: z
      .string({
        required_error: "payment_gateway.name.errors.required",
        invalid_type_error: "payment_gateway.name.errors.required",
      })
      .min(2, { message: "payment_gateway.name.errors.min" }),
    description: z.string().nullable().optional(),
    logo: z.string().nullable().optional(),

    provider: z.enum(PAYMENT_PROVIDERS, {
      required_error: "payment_gateway.provider.errors.required",
    }),
    integration_type: z.string().nullable().optional(),
    mode: z.enum(PAYMENT_MODES).default("sandbox"),
    base_url: z
      .string()
      .url({ message: "payment_gateway.base_url.errors.url" })
      .or(z.literal(""))
      .nullable()
      .optional(),

    app_key: z.string().nullable().optional(),
    app_secret: z.string().nullable().optional(),
    username: z.string().nullable().optional(),
    password: z.string().nullable().optional(),
    merchant_number: z.string().nullable().optional(),

    api_key: z.string().nullable().optional(),
    api_secret: z.string().nullable().optional(),
    api_url: z
      .string()
      .url({ message: "payment_gateway.api_url.errors.url" })
      .or(z.literal(""))
      .nullable()
      .optional(),

    success_url: z.string().url().or(z.literal("")).nullable().optional(),
    fail_url: z.string().url().or(z.literal("")).nullable().optional(),
    cancel_url: z.string().url().or(z.literal("")).nullable().optional(),
    ipn_url: z.string().url().or(z.literal("")).nullable().optional(),

    currency: z.string().default("BDT"),
    transaction_fee_percent: z.coerce.number().min(0).max(100).nullable().optional(),
    transaction_fee_fixed: z.coerce.number().min(0).nullable().optional(),

    is_default: z.boolean().optional().default(false),
    status: z.enum(PAYMENT_STATUSES).default("active"),

    company_id: z.coerce.number().nullable().optional(),
    reseller_id: z.coerce.number().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    const required = PROVIDER_REQUIRED_FIELDS[data.provider] ?? [];
    for (const field of required) {
      const value = (data as Record<string, unknown>)[field];
      if (value == null || String(value).trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [field],
          message: `payment_gateway.${field}.errors.required`,
        });
      }
    }
  });

export type PaymentGatewayFormInput = z.input<typeof PaymentGatewayFormSchema>;
export type PaymentGatewayPayload = z.output<typeof PaymentGatewayFormSchema>;
