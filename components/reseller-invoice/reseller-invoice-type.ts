import { z } from "zod";
import type { ApiResponse } from "@/hooks/use-api-query";
import { InvoiceRowSchema, type InvoiceRow } from "@/components/invoices/invoice-type";

export const ResellerInvoiceDuePayloadSchema = z.object({
    invoiceDue: z.array(InvoiceRowSchema),
});

export type ResellerInvoiceDuePayload = z.infer<typeof ResellerInvoiceDuePayloadSchema>;
export type ResellerInvoiceDueApiResponse = ApiResponse<ResellerInvoiceDuePayload>;
export type { InvoiceRow };
