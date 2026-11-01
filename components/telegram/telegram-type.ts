import { z } from "zod";

export const TELEGRAM_STATUS = ["active", "inactive"] as const;

export const TELEGRAM_EVENT_KEYS = [
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
  "telegram_onu_low_power",
] as const;

export type TelegramEventKey = (typeof TELEGRAM_EVENT_KEYS)[number];

const ZoneRefSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
});

export const TelegramRowSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    telegram_channel_id: z.string(),
    status: z.enum(TELEGRAM_STATUS),
    zones: z.array(ZoneRefSchema).optional(),
    events: z.array(z.string()).optional(),
  })
  .passthrough();

export type TelegramRow = z.infer<typeof TelegramRowSchema>;

export const TelegramFormSchema = z.object({
  name: z
    .string({
      required_error: "telegram.name.errors.required",
      invalid_type_error: "telegram.name.errors.required",
    })
    .min(2, { message: "telegram.name.errors.min" }),
  telegram_channel_id: z
    .string({
      required_error: "telegram.telegram_channel_id.errors.required",
      invalid_type_error: "telegram.telegram_channel_id.errors.required",
    })
    .min(1, { message: "telegram.telegram_channel_id.errors.required" }),
  status: z.enum(TELEGRAM_STATUS, {
    required_error: "telegram.status.errors.required",
    invalid_type_error: "telegram.status.errors.required",
  }),
  zone_ids: z.array(z.coerce.number()).optional().default([]),
  events: z.array(z.enum(TELEGRAM_EVENT_KEYS)).default([]),
});

export type TelegramFormInput = z.input<typeof TelegramFormSchema>;
export type TelegramPayload = z.output<typeof TelegramFormSchema>;
