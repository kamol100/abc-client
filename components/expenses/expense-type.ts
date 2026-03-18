import { toApiDateString } from "@/lib/helper/helper";
import { z } from "zod";

const StaffRefSchema = z.object({
    id: z.coerce.number(),
    name: z.string(),
});

const FundRefSchema = z.object({
    id: z.coerce.number(),
    name: z.string(),
});

const ZoneRefSchema = z.object({
    id: z.coerce.number(),
    name: z.string(),
});

const ExpenseTypeRefSchema = z.object({
    id: z.coerce.number(),
    name: z.string(),
});

const ExpenseCategoryRefSchema = z.object({
    id: z.coerce.number(),
    name: z.string(),
});

const VendorRefSchema = z.object({
    id: z.coerce.number(),
    name: z.string(),
});

export type StaffRef = z.infer<typeof StaffRefSchema>;
export type FundRef = z.infer<typeof FundRefSchema>;

export const ExpenseRowSchema = z.object({
    id: z.coerce.number(),
    voucher: z.string().nullable().optional(),
    expense_date: z.string().nullable().optional(),
    amount: z.coerce.number(),
    note: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
    staff_id: z.coerce.number().nullable().optional(),
    staff: StaffRefSchema.nullable().optional(),
    fund_id: z.coerce.number().nullable().optional(),
    fund: FundRefSchema.nullable().optional(),
    zone_id: z.coerce.number().nullable().optional(),
    zone: ZoneRefSchema.nullable().optional(),
    expense_type_id: z.coerce.number().nullable().optional(),
    expenseType: ExpenseTypeRefSchema.nullable().optional(),
    expense_category_id: z.coerce.number().nullable().optional(),
    expense_category: ExpenseCategoryRefSchema.nullable().optional(),
    vendor_id: z.coerce.number().nullable().optional(),
    vendor: VendorRefSchema.nullable().optional(),
}).passthrough();

export type ExpenseRow = z.infer<typeof ExpenseRowSchema>;

export const ExpenseFormSchema = z.object({
    amount: z.coerce.number({
        required_error: "expense.amount.errors.required",
        invalid_type_error: "expense.amount.errors.required",
    }).min(1, { message: "expense.amount.errors.min" }),
    staff_id: z.coerce.number({
        required_error: "expense.staff.errors.required",
        invalid_type_error: "expense.staff.errors.required",
    }).min(1, { message: "expense.staff.errors.required" }),
    fund_id: z.coerce.number().nullable().optional(),
    expense_type_id: z.coerce.number({
        required_error: "expense.expense_type.errors.required",
        invalid_type_error: "expense.expense_type.errors.required",
    }).min(1, { message: "expense.expense_type.errors.required" }),
    zone_id: z.coerce.number().nullable().optional(),
    voucher: z.string().nullable().optional().default(""),
    expense_date: z.preprocess(
        (value) => (value instanceof Date ? toApiDateString(value, "dmy") : value),
        z.string().nullable().optional().default(toApiDateString(new Date(), "dmy") ?? ""),
    ),
    status: z.string().optional().default("pending"),
    note: z.string().nullable().optional().default(""),
});

export type ExpenseFormInput = z.input<typeof ExpenseFormSchema>;
export type ExpensePayload = z.output<typeof ExpenseFormSchema>;
