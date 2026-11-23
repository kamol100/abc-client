import { z } from "zod";

const optionalNullableNumber = z.preprocess(
  (value) => (value === "" || value === undefined ? null : value),
  z.coerce.number().nullable().optional()
);

export const FundTransactionTypeValues = [
  "deposit",
  "transfer",
  "withdraw",
  "expense",
  "salary",
] as const;

export const FundTransactionTypeSchema = z.enum(FundTransactionTypeValues);

export const FundRefSchema = z
  .object({
    id: z.coerce.number(),
    name: z.string(),
  })
  .passthrough();

export const FundTransactionRowSchema = z
  .object({
    id: z.coerce.number(),
    amount: z.coerce.number().default(0),
    note: z.string().nullable().optional(),
    transfer_by: optionalNullableNumber,
    transaction_type: FundTransactionTypeSchema,
    created_at: z.string().nullable().optional(),
    fund: FundRefSchema.nullable().optional(),
    /** Staff who made the transaction; can differ from the fund's owner. */
    transaction_by: z
      .object({ id: z.coerce.number(), name: z.string() })
      .nullable()
      .optional(),
  })
  .passthrough();

export const FundTransactionFormSchema = z
  .object({
    amount: z.coerce
      .number({
        required_error: "fund_transaction.amount.errors.required",
        invalid_type_error: "fund_transaction.amount.errors.required",
      })
      .gt(0, { message: "fund_transaction.amount.errors.min" }),
    note: z.preprocess(
      (value) => (value === "" || value === undefined ? null : value),
      z.string().nullable().optional()
    ),
    transfer_by: optionalNullableNumber,
    transaction_type: z.literal("transfer").default("transfer"),
  })
  .superRefine((values, ctx) => {
    if (!values.transfer_by) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["transfer_by"],
        message: "fund_transaction.transfer_by.errors.required",
      });
    }
  });

export type FundRef = z.infer<typeof FundRefSchema>;
export type FundTransactionType = z.infer<typeof FundTransactionTypeSchema>;
export type FundTransactionRow = z.infer<typeof FundTransactionRowSchema>;

/** Sum of `amount` per transaction type across every page of the filtered list. */
export type FundTransactionTypeTotals = Partial<Record<FundTransactionType, number | string | null>>;

export type FundTransactionReports = {
  type_totals?: FundTransactionTypeTotals | null;
};

export type FundTransactionListPayload = {
  data: FundTransactionRow[];
  pagination: Pagination;
  reports?: FundTransactionReports | null;
};

export type FundTransactionFormInput = z.input<typeof FundTransactionFormSchema>;
export type FundTransactionPayload = z.output<typeof FundTransactionFormSchema>;
