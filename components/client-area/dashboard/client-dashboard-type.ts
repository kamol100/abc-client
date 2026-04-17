import { z } from "zod";

const NumberLikeSchema = z.preprocess(
  (value) => (value === null || value === undefined || value === "" ? 0 : value),
  z.coerce.number(),
);

export const ClientDashboardInvoiceSummarySchema = z
  .object({
    total_due_amount: NumberLikeSchema.optional().default(0),
    total_paid_amount: NumberLikeSchema.optional().default(0),
  })
  .passthrough();

export type ClientDashboardInvoiceSummary = z.infer<typeof ClientDashboardInvoiceSummarySchema>;
