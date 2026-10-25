import { z } from "zod";

const NumberLikeSchema = z.preprocess(
  (value) => (value === null || value === undefined || value === "" ? 0 : value),
  z.coerce.number(),
);

export const ClientDashboardInvoiceSummarySchema = z.object({
  total_due_amount: NumberLikeSchema.optional().default(0),
  total_paid_amount: NumberLikeSchema.optional().default(0),
});

export type ClientDashboardInvoiceSummary = z.infer<typeof ClientDashboardInvoiceSummarySchema>;

const optionalText = z
  .union([z.string(), z.number(), z.null()])
  .optional()
  .transform((value) => {
    if (value === null || value === undefined) return null;
    const text = String(value).trim();
    return text === "" ? null : text;
  });

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
