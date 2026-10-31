import { z } from "zod";

export const TELEGRAM_STATUS = ["active", "inactive"] as const;

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
  zone_ids: z
    .array(
      z.coerce.number({
        required_error: "telegram.zones.errors.required",
        invalid_type_error: "telegram.zones.errors.required",
      }),
    )
    .min(1, { message: "telegram.zones.errors.required" }),
});

export type TelegramFormInput = z.input<typeof TelegramFormSchema>;
export type TelegramPayload = z.output<typeof TelegramFormSchema>;
