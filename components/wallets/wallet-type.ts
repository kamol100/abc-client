import { z } from "zod";

export const WalletClientRefSchema = z
  .object({
    uuid: z.string(),
    name: z.string(),
    pppoe_username: z.string().nullable().optional(),
    termination_date: z.string().nullable().optional(),
  })
  .passthrough();

export const WalletRefSchema = z
  .object({
    uuid: z.string(),
    balance: z.coerce.number().default(0),
    credit_balance: z.coerce.number().default(0),
  })
  .passthrough();

export const WalletResellerRefSchema = z
  .object({
    id: z.string(),
    name: z.string().nullable().optional(),
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
    wallet: WalletRefSchema.nullable().optional(),
  })
  .passthrough();

export const WalletResourceRowSchema = z
  .object({
    id: z.string(),
    balance: z.coerce.number().default(0),
    credit_balance: z.coerce.number().default(0),
    client: WalletClientRefSchema.nullable().optional(),
    reseller: WalletResellerRefSchema.nullable().optional(),
    transactions: z.array(WalletTransactionRowSchema).nullable().optional(),
    created_at: z.string().nullable().optional(),
    note: z.string().nullable().optional(),
  })
  .passthrough();

export const ClientRefSchema = z
  .object({
    id: z.coerce.string(),
    name: z.string(),
  })
  .passthrough();

export const ClientWalletRowSchema = z
  .object({
    id: z.coerce.string().optional(),
    balance: z.coerce.number().default(0),
    note: z.string().nullable().optional(),
    created_at: z.string().nullable().optional(),
    termination_date: z.string().nullable().optional(),
    client: ClientRefSchema.extend({
      termination_date: z.string().nullable().optional(),
    }).passthrough().nullable().optional(),
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
    clientUuid: z.string({
      required_error: "wallet.client.errors.required",
      invalid_type_error: "wallet.client.errors.required",
    }),
    balance: z.coerce
      .number({
        required_error: "wallet.amount.errors.required",
        invalid_type_error: "wallet.amount.errors.required",
      })
      .gt(0, { message: "wallet.amount.errors.min" }),
    note: z.string().nullable().optional(),
  })
  .refine(
    (data) => data.clientUuid != null && data.clientUuid.length > 0,
    { message: "wallet.client.errors.required", path: ["clientUuid"] }
  );

export type WalletClientRef = z.infer<typeof WalletClientRefSchema>;
export type WalletRef = z.infer<typeof WalletRefSchema>;
export type WalletResellerRef = z.infer<typeof WalletResellerRefSchema>;
export type WalletResourceRow = z.infer<typeof WalletResourceRowSchema>;
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
