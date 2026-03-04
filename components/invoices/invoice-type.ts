import { z } from "zod";

export const InvoiceRowSchema = z.object({
    id: z.coerce.number(),
    uuid: z.string().optional(),
    trackID: z.string().nullable().optional(),
    create_date: z.string().nullable().optional(),
    due_date: z.string().nullable().optional(),
    amount: z.coerce.number().nullable().optional(),
    after_discount_amount: z.coerce.number().nullable().optional(),
    status: z.string().nullable().optional(),
}).passthrough();

export type InvoiceRow = z.infer<typeof InvoiceRowSchema>;

export const BulkInvoicePaySchema = z.object({
    invoice_ids: z.array(z.string()).min(1),
    fund_id: z.coerce.number().min(1),
    payment_date: z.string().min(1),
    status: z.enum(["paid", "partial"]).default("paid"),
    partial_amount: z.coerce.number().default(0),
    confirmation_sms: z.coerce.number().default(0),
    note: z.string().nullable().optional(),
});

export type BulkInvoicePayInput = z.infer<typeof BulkInvoicePaySchema>;
