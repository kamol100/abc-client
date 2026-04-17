import { z } from "zod";
import type { ApiResponse } from "@/hooks/use-api-query";
import { PaymentRowSchema } from "@/components/payments/payment-type";

const InvoiceRefSchema = z.object({
  id: z.coerce.number(),
  trackID: z.string().nullable().optional(),
});

export const ClientPaymentRowSchema = PaymentRowSchema.extend({
  invoice: InvoiceRefSchema.nullable().optional(),
}).passthrough();

export type ClientPaymentRow = z.infer<typeof ClientPaymentRowSchema>;

export type ClientPaymentReports = {
  amount?: number | string | null;
};

export type ClientPaymentListPayload = {
  data: ClientPaymentRow[];
  pagination: Pagination;
  reports?: ClientPaymentReports | null;
};

export type ClientPaymentListApiResponse = ApiResponse<ClientPaymentListPayload>;
