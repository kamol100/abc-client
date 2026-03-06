import { z } from "zod";
import type { ApiResponse } from "@/hooks/use-api-query";
import { toNumber } from "@/lib/helper/helper";

const toDate = (value: unknown): Date | undefined => {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    if (typeof value === "string" || typeof value === "number") {
        const parsed = new Date(value);
        if (!Number.isNaN(parsed.getTime())) return parsed;
    }
    return undefined;
};

const createDateValueSchema = (requiredKey: string) =>
    z.preprocess(
        (value) => toDate(value),
        z.date({
            required_error: requiredKey,
            invalid_type_error: requiredKey,
        }),
    );

const OptionalDateValueSchema = z.preprocess(
    (value) => {
        if (value === null || value === undefined || value === "") return undefined;
        return toDate(value);
    },
    z.date().optional(),
);

const ClientRefSchema = z.object({
    id: z.coerce.number(),
    uuid: z.string().nullable().optional(),
    name: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    current_address: z.string().nullable().optional(),
});

const ZoneRefSchema = z.object({
    id: z.coerce.number(),
    name: z.string().nullable().optional(),
});

const InvoiceTypeRefSchema = z.object({
    id: z.coerce.number(),
    name: z.string().nullable().optional(),
});

const FundRefSchema = z.object({
    id: z.coerce.number(),
    name: z.string().nullable().optional(),
});

export type ClientRef = z.infer<typeof ClientRefSchema>;
export type ZoneRef = z.infer<typeof ZoneRefSchema>;
export type InvoiceTypeRef = z.infer<typeof InvoiceTypeRefSchema>;
export type FundRef = z.infer<typeof FundRefSchema>;
export const InvoiceStatusSchema = z.enum(["due", "paid", "partial_paid"]);
export const InvoiceRowStatusSchema = z.enum(["due", "paid", "partial", "partial_paid"]);
export const InvoicePayStatusSchema = z.enum(["paid", "partial_paid"]);

export const InvoiceReportsSchema = z.object({
    total_amount: z.coerce.number().nullable().optional(),
    discount: z.coerce.number().nullable().optional(),
    after_discount_amount: z.coerce.number().nullable().optional(),
    amount_paid: z.coerce.number().nullable().optional(),
});

export const InvoiceRowSchema = z.object({
    id: z.coerce.number(),
    uuid: z.string().optional(),
    trackID: z.string().nullable().optional(),
    create_date: z.string().nullable().optional(),
    due_date: z.string().nullable().optional(),
    amount: z.coerce.number().nullable().optional(),
    total_amount: z.coerce.number().nullable().optional(),
    after_discount_amount: z.coerce.number().nullable().optional(),
    amount_paid: z.coerce.number().nullable().optional(),
    discount: z.coerce.number().nullable().optional(),
    line_total_discount: z.coerce.number().nullable().optional(),
    partial_amount: z.coerce.number().nullable().optional(),
    fund_id: z.coerce.number().nullable().optional(),
    payment_date: z.string().nullable().optional(),
    status: InvoiceRowStatusSchema.nullable().optional(),
    confirmation_sms: z.coerce.number().nullable().optional(),
    note: z.string().nullable().optional(),
    client: ClientRefSchema.nullable().optional(),
    zone: ZoneRefSchema.nullable().optional(),
    invoice_type: InvoiceTypeRefSchema.nullable().optional(),
    fund: FundRefSchema.nullable().optional(),
}).passthrough();

export type InvoiceReports = z.infer<typeof InvoiceReportsSchema>;
export type InvoiceRow = z.infer<typeof InvoiceRowSchema>;

export const InvoiceLineSchema = z.object({
    description: z.string().trim().min(1, {
        message: "invoice.line.description.errors.required",
    }),
    amount: z.coerce.number().gt(0, {
        message: "invoice.line.amount.errors.min",
    }),
    quantity: z.coerce.number().int().gt(0, {
        message: "invoice.line.quantity.errors.min",
    }),
    total_amount: z.coerce.number().nullable().optional(),
    discount: z.coerce.number().min(0, {
        message: "invoice.line.discount.errors.min",
    }).default(0),
    order: z.coerce.number().optional(),
    uuid: z.string().nullable().optional(),
}).passthrough();

export const InvoiceFormSchema = z.object({
    create_date: createDateValueSchema("invoice.create_date.errors.required"),
    due_date: createDateValueSchema("invoice.due_date.errors.required"),
    invoice_type_id: z.coerce.number({
        required_error: "invoice.invoice_type.errors.required",
        invalid_type_error: "invoice.invoice_type.errors.required",
    }).min(1, { message: "invoice.invoice_type.errors.required" }),
    client_id: z.coerce.number({
        required_error: "invoice.client.errors.required",
        invalid_type_error: "invoice.client.errors.required",
    }).min(1, { message: "invoice.client.errors.required" }),
    discount: z.coerce.number().min(0).default(0),
    status: InvoiceStatusSchema.default("due"),
    partial_amount: z.coerce.number().min(0).optional().default(0),
    fund_id: z.coerce.number().nullable().optional(),
    payment_date: OptionalDateValueSchema,
    confirmation_sms: z.coerce.number().int().min(0).max(1).default(0),
    note: z.string().nullable().optional().default(""),
    lines: z.array(InvoiceLineSchema).min(1, {
        message: "invoice.lines.errors.required",
    }),
}).superRefine((values, ctx) => {
    if ((values.status === "paid" || values.status === "partial_paid") && !values.fund_id) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["fund_id"],
            message: "invoice.fund.errors.required",
        });
    }

    if (values.status === "partial_paid" && toNumber(values.partial_amount) <= 0) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["partial_amount"],
            message: "invoice.partial_amount.errors.min",
        });
    }
});

const InvoicePayloadLineSchema = z.object({
    description: z.string().trim().min(1),
    amount: z.coerce.number().gt(0),
    quantity: z.coerce.number().int().gt(0),
    discount: z.coerce.number().min(0).default(0),
    order: z.coerce.number().optional(),
    uuid: z.string().nullable().optional(),
});

export const InvoicePayloadSchema = z.object({
    create_date: z.string().min(1),
    due_date: z.string().min(1),
    invoice_type_id: z.coerce.number().min(1),
    client_id: z.coerce.number().min(1),
    discount: z.coerce.number().min(0).default(0),
    status: InvoiceStatusSchema,
    partial_amount: z.coerce.number().min(0).default(0),
    fund_id: z.coerce.number().nullable().optional(),
    payment_date: z.string().nullable().optional(),
    confirmation_sms: z.coerce.number().int().min(0).max(1).default(0),
    note: z.string().nullable().optional(),
    lines: z.array(InvoicePayloadLineSchema).min(1),
    total_amount: z.coerce.number().min(0),
    line_total_discount: z.coerce.number().min(0),
    after_discount_amount: z.coerce.number(),
}).superRefine((values, ctx) => {
    if ((values.status === "paid" || values.status === "partial_paid") && !values.fund_id) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["fund_id"],
            message: "invoice.fund.errors.required",
        });
    }

    if (values.status === "partial_paid" && toNumber(values.partial_amount) <= 0) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["partial_amount"],
            message: "invoice.partial_amount.errors.min",
        });
    }
});

export const InvoiceDetailSchema = InvoiceRowSchema.extend({
    client_id: z.coerce.number().nullable().optional(),
    invoice_type_id: z.coerce.number().nullable().optional(),
    fund_id: z.coerce.number().nullable().optional(),
    payment_date: z.string().nullable().optional(),
    partial_amount: z.coerce.number().nullable().optional(),
    confirmation_sms: z.coerce.number().nullable().optional(),
    transaction_id: z.string().nullable().optional(),
    reference: z.string().nullable().optional(),
    amount_due: z.coerce.number().nullable().optional(),
    total_discount: z.coerce.number().nullable().optional(),
    lines: z.array(InvoiceLineSchema).default([]),
}).passthrough();

export const InvoicePaySchema = z.object({
    fund_id: z.coerce.number({
        required_error: "invoice.pay.fund.errors.required",
        invalid_type_error: "invoice.pay.fund.errors.required",
    }).min(1, { message: "invoice.pay.fund.errors.required" }),
    payment_date: z.string({
        required_error: "invoice.pay.payment_date.errors.required",
        invalid_type_error: "invoice.pay.payment_date.errors.required",
    }).min(1, { message: "invoice.pay.payment_date.errors.required" }),
    status: InvoicePayStatusSchema.default("paid"),
    partial_amount: z.coerce.number().optional(),
    transaction_id: z.string().trim().nullable().optional(),
    reference: z.string().trim().nullable().optional(),
    confirmation_sms: z.coerce.number().int().min(0).max(1).default(0),
    note: z.string().trim().nullable().optional(),
}).superRefine((values, ctx) => {
    if (values.status === "partial_paid" && toNumber(values.partial_amount) <= 0) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["partial_amount"],
            message: "invoice.pay.partial_amount.errors.min",
        });
    }
});

export const InvoiceDiscountSchema = z.object({
    discount_amount: z.coerce.number({
        required_error: "invoice.discount_dialog.discount_amount.errors.required",
        invalid_type_error: "invoice.discount_dialog.discount_amount.errors.required",
    }).gt(0, {
        message: "invoice.discount_dialog.discount_amount.errors.min",
    }),
});

export type InvoiceLine = z.infer<typeof InvoiceLineSchema>;
export type InvoiceFormInput = z.input<typeof InvoiceFormSchema>;
export type InvoiceFormValues = z.output<typeof InvoiceFormSchema>;
export type InvoicePayload = z.output<typeof InvoicePayloadSchema>;
export type InvoiceDetail = z.infer<typeof InvoiceDetailSchema>;
export type InvoicePayInput = z.infer<typeof InvoicePaySchema>;
export type InvoiceDiscountInput = z.infer<typeof InvoiceDiscountSchema>;

export type InvoiceListPayload = {
    data: InvoiceRow[];
    pagination: Pagination;
    reports?: InvoiceReports | null;
};

export type InvoiceListApiResponse = ApiResponse<InvoiceListPayload>;

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
