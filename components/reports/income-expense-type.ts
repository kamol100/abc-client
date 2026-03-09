import { z } from "zod";
import type { ApiResponse } from "@/hooks/use-api-query";

const toDate = (value: unknown): Date | undefined => {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    if (typeof value === "string" || typeof value === "number") {
        const parsed = new Date(value);
        if (!Number.isNaN(parsed.getTime())) return parsed;
    }
    return undefined;
};

export const IncomeExpenseDateRangeSchema = z.object({
    from: z.preprocess((value) => toDate(value), z.date()),
    to: z.preprocess((value) => (value ? toDate(value) : undefined), z.date().optional()),
});

export const IncomeExpenseFormSchema = z.object({
    create_date: IncomeExpenseDateRangeSchema.optional(),
});

export const IncomeExpensePayloadSchema = z.object({
    create_date: z.string().optional(),
});

export const IncomeExpenseRowSchema = z.object({
    total: z.coerce.number().optional().default(0),
}).catchall(z.coerce.number());

export type IncomeExpenseRow = z.infer<typeof IncomeExpenseRowSchema>;
export type IncomeExpenseFormInput = z.input<typeof IncomeExpenseFormSchema>;
export type IncomeExpensePayload = z.output<typeof IncomeExpensePayloadSchema>;
export type IncomeExpenseApiResponse = ApiResponse<IncomeExpenseRow>;

export function normalizeIncomeExpenseRow(data: unknown): IncomeExpenseRow {
    const parsed = IncomeExpenseRowSchema.safeParse(data ?? {});
    if (parsed.success) return parsed.data;
    return { total: 0 };
}
