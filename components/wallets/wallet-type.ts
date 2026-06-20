import { z } from "zod";

export const ClientRefSchema = z
  .object({
    id: z.coerce.string(),
    name: z.string(),
  })
  .passthrough();

export const WalletTransactionRowSchema = z
  .object({
    id: z.string(),
    transaction_id: z.coerce.number(),
    amount: z.coerce.number().default(0),
    transaction_type: z.string(),
    recharge_method: z.string().nullable().optional(),
    currency: z.string().nullable().optional(),
    reference: z.string().nullable().optional(),
    note: z.string().nullable().optional(),
    created_at: z.string().nullable().optional(),
  })
  .passthrough();

export const ClientWalletRowSchema = z
  .object({
    id: z.coerce.string().optional(),
    balance: z.coerce.number().default(0),
    note: z.string().nullable().optional(),
    created_at: z.string().nullable().optional(),
    client: ClientRefSchema.nullable().optional(),
  })
  .passthrough();

export const MyWalletBalanceSchema = z
  .object({
    id: z.coerce.string().optional(),
    balance: z.coerce.number().default(0),
  })
  .passthrough();

export const WalletRechargeFormSchema = z.object({
  balance: z.coerce
    .number({
      required_error: "wallet.amount.errors.required",
      invalid_type_error: "wallet.amount.errors.required",
    })
    .gt(0, { message: "wallet.amount.errors.min" }),
});

export const ClientWalletRechargeFormSchema = z
  .object({
    client_id: z.coerce
      .number({
        required_error: "wallet.client.errors.required",
        invalid_type_error: "wallet.client.errors.required",
      })
      .min(1, { message: "wallet.client.errors.required" })
      .optional(),
    balance: z.coerce
      .number({
        required_error: "wallet.amount.errors.required",
        invalid_type_error: "wallet.amount.errors.required",
      })
      .gt(0, { message: "wallet.amount.errors.min" }),
    note: z.string().nullable().optional(),
  })
  .refine(
    (data) => data.client_id != null && data.client_id >= 1,
    { message: "wallet.client.errors.required", path: ["client_id"] }
  );

export type WalletTransactionRow = z.infer<typeof WalletTransactionRowSchema>;
export type ClientWalletRow = z.infer<typeof ClientWalletRowSchema>;
export type MyWalletBalance = z.infer<typeof MyWalletBalanceSchema>;

export type WalletRechargeFormInput = z.input<typeof WalletRechargeFormSchema>;
export type WalletRechargePayload = z.output<typeof WalletRechargeFormSchema>;

export type ClientWalletRechargeFormInput = z.input<
  typeof ClientWalletRechargeFormSchema
>;
export type ClientWalletRechargePayload = z.output<
  typeof ClientWalletRechargeFormSchema
>;
