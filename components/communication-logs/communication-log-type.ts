import { z } from "zod";

export const CHANNEL_VALUES = ["sms", "voice", "email"] as const;
export type CommunicationChannel = (typeof CHANNEL_VALUES)[number];

/** Row from API list (table) */
export const CommunicationLogRowSchema = z
  .object({
    id: z.union([z.string(), z.coerce.number()]),
    channel: z.enum(CHANNEL_VALUES).optional(),
    body: z.string().nullable().optional(),
    sms_from: z.string().nullable().optional(),
    sms_count: z.number().nullable().optional(),
    rates: z.string().nullable().optional(),
    unit_price: z.string().nullable().optional(),
    total_units: z.number().nullable().optional(),
    total_price: z.string().nullable().optional(),
    cost: z.string().optional(),
    sms_type: z.string().nullable().optional(),
    sms_to: z.string().nullable().optional(),
    status: z.string().optional(),
    provider_status: z.string().nullable().optional(),
    sent_at: z.string().nullable().optional(),
    send_at: z.string().optional(),
  })
  .passthrough();

export type CommunicationLogRow = z.infer<typeof CommunicationLogRowSchema>;
