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

const IncomeStatementLineSchema = z.object({
    key: z.string(),
    name: z.string(),
    amount: z.coerce.number(),
    count: z.coerce.number(),
});

const IncomeStatementCheckSchema = z.object({
    count: z.coerce.number(),
    amount: z.coerce.number(),
});

/** GET reports/income-statement: cash basis, checked against the fund deposits. */
export const IncomeStatementSchema = z.object({
    period: z.object({ from: z.string(), to: z.string() }),
    income: z.object({ lines: z.array(IncomeStatementLineSchema), total: z.coerce.number() }),
    expenses: z.object({ lines: z.array(IncomeStatementLineSchema), total: z.coerce.number() }),
    net: z.coerce.number(),
    paid_from_wallet: z.coerce.number(),
    // A reseller's client bills settled from the reseller wallet: income with no fund deposit.
    settled_from_reseller_wallet: z.coerce.number().optional().default(0),
    checks: z.object({
        fund_deposits: z.coerce.number(),
        missing_fund_deposit: IncomeStatementCheckSchema,
        amount_mismatch: IncomeStatementCheckSchema,
        date_mismatch: IncomeStatementCheckSchema,
        // Expense side: an expense or salary debited more than once, or approved
        // and never debited.
        expense_duplicates: IncomeStatementCheckSchema.optional().default({ count: 0, amount: 0 }),
        expense_without_debit: IncomeStatementCheckSchema.optional().default({ count: 0, amount: 0 }),
    }),
});

export type IncomeStatementLine = z.infer<typeof IncomeStatementLineSchema>;
export type IncomeStatement = z.infer<typeof IncomeStatementSchema>;
export type IncomeStatementApiResponse = ApiResponse<IncomeStatement>;

export function parseIncomeStatement(data: unknown): IncomeStatement | null {
    const parsed = IncomeStatementSchema.safeParse(data);
    return parsed.success ? parsed.data : null;
}

/** The filter sends the range as "from,to" (or a single "from"); the API takes from and to. */
export function incomeStatementParams(filter: string | null): Record<string, string> | undefined {
    if (!filter) return undefined;
    const range = new URLSearchParams(filter).get("create_date");
    if (!range) return undefined;
    const [from, to] = range.split(",");
    if (!from) return undefined;
    return { from, to: to || from };
}
