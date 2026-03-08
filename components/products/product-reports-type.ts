import { z } from "zod";
import type { ApiResponse } from "@/hooks/use-api-query";
import { ProductMovementRowSchema } from "@/components/products/product-movement-type";

export const ProductReportRowSchema = ProductMovementRowSchema.extend({}).passthrough();

export const ProductReportSummarySchema = z.object({
    actual_quantity: z.coerce.number().nullable().optional(),
    actual_total_price: z.coerce.number().nullable().optional(),
    product_in_current_quantity: z.coerce.number().nullable().optional(),
    product_in_current_total_price: z.coerce.number().nullable().optional(),
    product_out_current_quantity: z.coerce.number().nullable().optional(),
    product_out_current_total_price: z.coerce.number().nullable().optional(),
}).passthrough();

export type ProductReportRow = z.infer<typeof ProductReportRowSchema>;
export type ProductReportSummary = z.infer<typeof ProductReportSummarySchema>;

export type ProductReportsPayload = {
    data: ProductReportRow[];
    pagination: Pagination;
    reports?: ProductReportSummary | null;
};

export type ProductReportsApiResponse = ApiResponse<ProductReportsPayload>;
