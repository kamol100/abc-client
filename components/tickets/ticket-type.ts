import { z } from "zod";
import i18n from "@/i18n";

const RefSchema = z.object({
    id: z.coerce.number(),
    name: z.string(),
}).passthrough();

export const TicketRowSchema = z.object({
    id: z.coerce.number(),
    ticketId: z.coerce.number(),
    message: z.string(),
    priority: z.enum(["low", "medium", "high"]),
    status: z.enum(["open", "in_progress", "resolved", "closed"]),
    client: RefSchema.extend({
        phone: z.string().nullable().optional(),
        current_address: z.string().nullable().optional(),
    }).nullable().optional(),
    subject: RefSchema.nullable().optional(),
    tag: z.array(RefSchema).nullable().optional(),
    staff: RefSchema.nullable().optional(),
    messages_count: z.coerce.number().optional(),
    created_at: z.string().nullable().optional(),
    updated_at: z.string().nullable().optional(),
}).passthrough();

export type TicketRow = z.infer<typeof TicketRowSchema>;

export const TicketMessageSchema = z.object({
    id: z.coerce.number(),
    message: z.string(),
    staff: RefSchema.nullable().optional(),
    client: RefSchema.nullable().optional(),
    created_at: z.string().nullable().optional(),
    updated_at: z.string().nullable().optional(),
}).passthrough();

export type TicketMessage = z.infer<typeof TicketMessageSchema>;

export const TicketCreateSchema = z.object({
    client_id: z.coerce.number({
        required_error: i18n.t("ticket.client.errors.required"),
    }),
    subject_id: z.coerce.number({
        required_error: i18n.t("ticket.subject.errors.required"),
    }),
    tag_id: z.array(z.coerce.number()).optional(),
    assigned_to: z.coerce.number().nullable().optional(),
    message: z.string({
        required_error: i18n.t("ticket.message.errors.required"),
    }).min(2, { message: i18n.t("ticket.message.errors.min") }),
    priority: z.enum(["low", "medium", "high"]).default("medium"),
    status: z.enum(["open", "in_progress", "resolved", "closed"]).default("open"),
});

export type TicketCreateInput = z.input<typeof TicketCreateSchema>;
export type TicketCreatePayload = z.output<typeof TicketCreateSchema>;

export const TicketReplySchema = z.object({
    message: z.string({
        required_error: i18n.t("ticket.reply.errors.required"),
    }).min(1, { message: i18n.t("ticket.reply.errors.required") }),
});

export type TicketReplyInput = z.input<typeof TicketReplySchema>;

export const PRIORITY_OPTIONS = [
    { value: "low", label: "ticket.priority.low" },
    { value: "medium", label: "ticket.priority.medium" },
    { value: "high", label: "ticket.priority.high" },
] as const;

export const STATUS_OPTIONS = [
    { value: "open", label: "ticket.status.open" },
    { value: "in_progress", label: "ticket.status.in_progress" },
    { value: "resolved", label: "ticket.status.resolved" },
    { value: "closed", label: "ticket.status.closed" },
] as const;
