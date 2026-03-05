import { z } from "zod";

const optionalNullableNumber = z.preprocess(
  (value) => (value === "" || value === undefined ? null : value),
  z.coerce.number().nullable().optional()
);

export const StaffRefSchema = z
  .object({
    id: z.coerce.number(),
    name: z.string(),
  })
  .passthrough();

export const FundReportSchema = z
  .object({
    total_balance: z.coerce.number().default(0),
  })
  .passthrough();

export const FundRowSchema = z
  .object({
    id: z.coerce.number(),
    name: z.string(),
    short_name: z.string().nullable().optional(),
    balance: z.coerce.number().default(0),
    branch: z.string().nullable().optional(),
    account_number: z.string().nullable().optional(),
    staff_id: optionalNullableNumber,
    deletable: z.coerce.number().default(0),
    staff: StaffRefSchema.nullable().optional(),
  })
  .passthrough();

export const FundFormSchema = z.object({
  name: z
    .string({
      required_error: "fund.name.errors.required",
      invalid_type_error: "fund.name.errors.required",
    })
    .min(2, { message: "fund.name.errors.min" }),
  short_name: z
    .string({
      required_error: "fund.short_name.errors.required",
      invalid_type_error: "fund.short_name.errors.required",
    })
    .min(2, { message: "fund.short_name.errors.min" }),
  account_number: z.preprocess(
    (value) => (value === "" || value === undefined ? null : value),
    z.string().nullable().optional()
  ),
  staff_id: optionalNullableNumber,
});

export type StaffRef = z.infer<typeof StaffRefSchema>;
export type FundReport = z.infer<typeof FundReportSchema>;
export type FundRow = z.infer<typeof FundRowSchema>;

export type FundFormInput = z.input<typeof FundFormSchema>;
export type FundPayload = z.output<typeof FundFormSchema>;
