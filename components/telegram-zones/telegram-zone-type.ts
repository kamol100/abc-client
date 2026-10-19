import { z } from "zod";

export const TELEGRAM_ZONE_STATUS = ["active", "inactive"] as const;

const TelegramZoneRefSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
});

export const TelegramZoneRowSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    telegram_channel_id: z.string(),
    status: z.enum(TELEGRAM_ZONE_STATUS),
    zones: z.array(TelegramZoneRefSchema).optional(),
  })
  .passthrough();

export type TelegramZoneRow = z.infer<typeof TelegramZoneRowSchema>;

export const TelegramZoneFormSchema = z.object({
  name: z
    .string({
      required_error: "telegram_zone.name.errors.required",
      invalid_type_error: "telegram_zone.name.errors.required",
    })
    .min(2, { message: "telegram_zone.name.errors.min" }),
  telegram_channel_id: z
    .string({
      required_error: "telegram_zone.telegram_channel_id.errors.required",
      invalid_type_error: "telegram_zone.telegram_channel_id.errors.required",
    })
    .min(1, { message: "telegram_zone.telegram_channel_id.errors.required" }),
  status: z.enum(TELEGRAM_ZONE_STATUS, {
    required_error: "telegram_zone.status.errors.required",
    invalid_type_error: "telegram_zone.status.errors.required",
  }),
  zone_ids: z
    .array(
      z.coerce.number({
        required_error: "telegram_zone.zones.errors.required",
        invalid_type_error: "telegram_zone.zones.errors.required",
      }),
    )
    .min(1, { message: "telegram_zone.zones.errors.required" }),
});

export type TelegramZoneFormInput = z.input<typeof TelegramZoneFormSchema>;
export type TelegramZonePayload = z.output<typeof TelegramZoneFormSchema>;
