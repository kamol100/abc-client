import { z } from "zod";
import type { ClientPaymentData } from "@/types/pay-types";

const NumberLikeSchema = z.preprocess(
  (value) => (value === null || value === undefined || value === "" ? 0 : value),
  z.coerce.number(),
);

export const ClientDashboardInvoiceSummarySchema = z.object({
  total_due_amount: NumberLikeSchema.optional().default(0),
  total_paid_amount: NumberLikeSchema.optional().default(0),
});

export type ClientDashboardInvoiceSummary = z.infer<typeof ClientDashboardInvoiceSummarySchema>;

const money = z.union([z.number(), z.string()]);

const optionalText = z
  .union([z.string(), z.number(), z.null()])
  .optional()
  .transform((value) => {
    if (value === null || value === undefined) return null;
    const text = String(value).trim();
    return text === "" ? null : text;
  });

export const ClientDashboardPaymentSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.union([z.string(), z.number(), z.null()]).optional().transform((value) =>
    value === null || value === undefined ? "" : String(value),
  ),
  status: z.enum(["Active", "Inactive"]),
  billing_terms: optionalText,
  payment_terms: optionalText,
  package: z
    .object({
      name: z.string(),
      bandwidth: optionalText,
      mikrotik_profile: optionalText,
      price: money.nullable().optional().transform((value) => value ?? null),
    })
    .nullable()
    .optional()
    .transform((value) => value ?? null),
  invoice: z
    .array(
      z.object({
        id: z.string(),
        invoice_id: z.union([z.string(), z.number()]).transform(String),
        invoice_type: optionalText,
        month: z.string().optional().default(""),
        due_date: optionalText,
        after_discount_amount: money,
        discount: money.optional().default(0),
        line_total_discount: money.optional().default(0),
      }),
    )
    .optional()
    .default([]),
  total_due: money,
  total_discount: money.optional().default(0),
});

export type ClientDashboardPayment = ClientPaymentData;

export const ClientDashboardInfoSchema = z.object({
  customer_id: optionalText,
  name: optionalText,
  username: optionalText,
  phone: optionalText,
  alternate_phone: optionalText,
  email: optionalText,
  status: z
    .union([z.number(), z.string(), z.null()])
    .optional()
    .transform((value) => {
      if (value === null || value === undefined || value === "") return null;
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    }),
  termination_date: optionalText,
  package: optionalText,
  connection: z
    .object({
      is_online: z.boolean().optional().default(false),
      ip_address: optionalText,
    })
    .optional()
    .transform((value) => value ?? { is_online: false, ip_address: null }),
  onu_status: optionalText,
});

export type ClientDashboardInfo = z.infer<typeof ClientDashboardInfoSchema>;

const UsageAmountSchema = z.object({
  total_bytes: z.coerce.number().optional().default(0),
  available: z.boolean().optional().default(false),
});

export const ClientDashboardUsageSchema = z.object({
  today: UsageAmountSchema,
  this_month: UsageAmountSchema,
  last_month: UsageAmountSchema,
});

export type ClientDashboardUsage = z.infer<typeof ClientDashboardUsageSchema>;
