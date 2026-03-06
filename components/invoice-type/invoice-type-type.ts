import { z } from "zod";

export const InvoiceTypeRowSchema = z.object({
    id: z.coerce.number(),
    name: z.string(),
    description: z.string().nullable().optional(),
    deletable: z.coerce.number().nullable().optional(),
}).passthrough();

export type InvoiceTypeRow = z.infer<typeof InvoiceTypeRowSchema>;

export const InvoiceTypeFormSchema = z.object({
    name: z.string({
        required_error: "invoice_type.name.errors.required",
        invalid_type_error: "invoice_type.name.errors.required",
    }).min(2, { message: "invoice_type.name.errors.min" }),
    description: z.string().nullable().optional(),
});

export type InvoiceTypeFormInput = z.input<typeof InvoiceTypeFormSchema>;
export type InvoiceTypePayload = z.output<typeof InvoiceTypeFormSchema>;
