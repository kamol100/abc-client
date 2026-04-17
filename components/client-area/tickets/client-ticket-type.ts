import { z } from "zod";

export const ClientTicketCreateSchema = z.object({
  subject_id: z.coerce.number({
    required_error: "ticket.subject.errors.required",
  }),
  message: z
    .string({ required_error: "ticket.message.errors.required" })
    .min(2, { message: "ticket.message.errors.min" }),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});

export type ClientTicketCreateInput = z.input<typeof ClientTicketCreateSchema>;
export type ClientTicketCreatePayload = z.output<typeof ClientTicketCreateSchema>;
