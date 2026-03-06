import { z } from "zod";

const ClientRefSchema = z.object({
    id: z.coerce.number(),
    name: z.string(),
    phone: z.string().nullable().optional(),
    current_address: z.string().nullable().optional(),
    pppoe_username: z.string().nullable().optional(),
});

const StaffRefSchema = z.object({
    id: z.coerce.number(),
    name: z.string(),
});

const ZoneRefSchema = z.object({
    id: z.coerce.number(),
    name: z.string(),
});

const FundRefSchema = z.object({
    id: z.coerce.number(),
    name: z.string(),
});

const PaymentTypeRefSchema = z.object({
    id: z.coerce.number(),
    name: z.string(),
});

export type ClientRef = z.infer<typeof ClientRefSchema>;
export type StaffRef = z.infer<typeof StaffRefSchema>;
export type FundRef = z.infer<typeof FundRefSchema>;

export const PaymentRowSchema = z.object({
    id: z.coerce.number(),
    pid: z.string().nullable().optional(),
    title: z.string().nullable().optional(),
    amount: z.coerce.number(),
    discount: z.coerce.number().nullable().optional(),
    partial_amount: z.coerce.number().nullable().optional(),
    status: z.string().nullable().optional(),
    note: z.string().nullable().optional(),
    payment_date: z.string().nullable().optional(),
    due_date: z.string().nullable().optional(),
    created_at: z.string().nullable().optional(),
    transaction_id: z.string().nullable().optional(),
    reference: z.string().nullable().optional(),
    client_id: z.coerce.number().nullable().optional(),
    client: ClientRefSchema.nullable().optional(),
    staff: StaffRefSchema.nullable().optional(),
    zone: ZoneRefSchema.nullable().optional(),
    fund: FundRefSchema.nullable().optional(),
    fund_id: z.coerce.number().nullable().optional(),
    payment_type: PaymentTypeRefSchema.nullable().optional(),
    payment_type_id: z.coerce.number().nullable().optional(),
}).passthrough();

export type PaymentRow = z.infer<typeof PaymentRowSchema>;


