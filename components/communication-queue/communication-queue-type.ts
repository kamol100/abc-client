import { z } from "zod";

/** Row from API list (communication queue table) */
export const CommunicationQueueRowSchema = z
  .object({
    id: z.union([z.string(), z.coerce.number()]),
    sms_to: z.string().nullable().optional(),
    sms_from: z.string().nullable().optional(),
    sms_type: z.string().nullable().optional(),
    sms_count: z.number().nullable().optional(),
    message: z.string().nullable().optional(),
    status: z.string().optional(),
    comment: z.string().nullable().optional(),
    send_at: z.string().nullable().optional(),
    expire_at: z.string().nullable().optional(),
  })
  .passthrough();

export type CommunicationQueueRow = z.infer<typeof CommunicationQueueRowSchema>;
