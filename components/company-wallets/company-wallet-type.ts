import { z } from "zod";

export const CompanyWalletMethodValues = ["cash", "bank"] as const;

export const CompanyWalletMethodSchema = z.enum(CompanyWalletMethodValues, {
  required_error: "company_wallet.recharge_method.errors.required",
});

const CompanyRefSchema = z
  .object({
    id: z.coerce.number().optional(),
    name: z.string().nullable().optional(),
  })
  .passthrough();

export const CompanyWalletRowSchema = z
  .object({
    id: z.coerce.number(),
    balance: z.coerce.number().default(0),
    company: CompanyRefSchema.nullable().optional(),
    created_at: z.string().nullable().optional(),
    updated_at: z.string().nullable().optional(),
  })
  .passthrough();

export const CompanyWalletFormSchema = z.object({
  recharge_method: CompanyWalletMethodSchema,
  balance: z.coerce
    .number({
      required_error: "company_wallet.balance.errors.required",
      invalid_type_error: "company_wallet.balance.errors.required",
    })
    .gt(0, { message: "company_wallet.balance.errors.min" }),
});

export type CompanyWalletMethod = z.infer<typeof CompanyWalletMethodSchema>;
export type CompanyWalletRow = z.infer<typeof CompanyWalletRowSchema>;

export type CompanyWalletFormInput = z.input<typeof CompanyWalletFormSchema>;
export type CompanyWalletPayload = z.output<typeof CompanyWalletFormSchema>;
