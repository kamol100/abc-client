import { z } from "zod";
import type { ApiResponse } from "@/hooks/use-api-query";

const NullableTextSchema = z.string().nullable().optional();

export const ProductSerialItemSchema = z.object({
    id: z.coerce.number(),
    serial_number: NullableTextSchema,
    purchase_date: NullableTextSchema,
    out_date: NullableTextSchema,
}).passthrough();

export const ProductRefSchema = z.object({
    id: z.coerce.number(),
    name: NullableTextSchema,
}).passthrough();

export const StaffRefSchema = z.object({
    id: z.coerce.number(),
    name: NullableTextSchema,
}).passthrough();

export const VendorRefSchema = z.object({
    id: z.coerce.number(),
    name: NullableTextSchema,
}).passthrough();

export const PurchaseByRefSchema = z.object({
    id: z.coerce.number(),
    name: NullableTextSchema,
}).passthrough();

export const ReceivedByRefSchema = z.object({
    id: z.coerce.number(),
    name: NullableTextSchema,
}).passthrough();

export const ClientRefSchema = z.object({
    id: z.coerce.number(),
    name: NullableTextSchema,
}).passthrough();

const SerialListSchema = z.preprocess(
    (value) => (Array.isArray(value) ? value : []),
    z.array(ProductSerialItemSchema),
);

export const ProductMovementRowSchema = z.object({
    id: z.coerce.number(),
    status: NullableTextSchema,
    quantity: z.coerce.number().nullable().optional(),
    quantity_remaining: z.coerce.number().nullable().optional(),
    unit_price: z.coerce.number().nullable().optional(),
    total_price: z.coerce.number().nullable().optional(),
    unit_sell_price: z.coerce.number().nullable().optional(),
    note: NullableTextSchema,
    purchase_date: NullableTextSchema,
    out_date: NullableTextSchema,
    product: ProductRefSchema.nullable().optional(),
    vendor: VendorRefSchema.nullable().optional(),
    purchaseBy: PurchaseByRefSchema.nullable().optional(),
    receivedBy: ReceivedByRefSchema.nullable().optional(),
    staff: StaffRefSchema.nullable().optional(),
    client: ClientRefSchema.nullable().optional(),
    serial: SerialListSchema.default([]),
}).passthrough();

export const ProductMovementReportsSchema = z.object({
    product_in_current_total_price: z.coerce.number().nullable().optional(),
    product_in_current_quantity: z.coerce.number().nullable().optional(),
    product_out_current_total_price: z.coerce.number().nullable().optional(),
    product_out_current_quantity: z.coerce.number().nullable().optional(),
}).passthrough();

export type ProductSerialItem = z.infer<typeof ProductSerialItemSchema>;
export type ProductMovementRow = z.infer<typeof ProductMovementRowSchema>;
export type ProductMovementReports = z.infer<typeof ProductMovementReportsSchema>;

export type ProductMovementListPayload = {
    data: ProductMovementRow[];
    pagination: Pagination;
    reports?: ProductMovementReports | null;
};

export type ProductMovementListApiResponse = ApiResponse<ProductMovementListPayload>;
