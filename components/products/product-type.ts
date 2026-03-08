import { z } from "zod";

export const UnitTypeRefSchema = z.object({
    id: z.coerce.number(),
    name: z.string(),
});

export const ProductCategoryRefSchema = z.object({
    id: z.coerce.number(),
    name: z.string(),
});

export const ProductRowSchema = z.object({
    id: z.coerce.number(),
    name: z.string(),
    has_serial: z.coerce.number().nullable().optional(),
    vat: z.coerce.number().nullable().optional(),
    unit_type_id: z.coerce.number().nullable().optional(),
    product_category_id: z.coerce.number().nullable().optional(),
    description: z.string().nullable().optional(),
    stock_in_quantity: z.coerce.number().nullable().optional(),
    stock_out_quantity: z.coerce.number().nullable().optional(),
    stock_in_remaining: z.coerce.number().nullable().optional(),
    unitType: UnitTypeRefSchema.nullable().optional(),
    category: ProductCategoryRefSchema.nullable().optional(),
    deletable: z.coerce.number().nullable().optional(),
}).passthrough();

export type ProductRow = z.infer<typeof ProductRowSchema>;

export const ProductFormSchema = z.object({
    name: z.string({
        required_error: "product.name.errors.required",
        invalid_type_error: "product.name.errors.invalid",
    }).min(2, { message: "product.name.errors.min" }),
    has_serial: z.coerce.number({
        invalid_type_error: "product.has_serial.errors.invalid",
    }).min(0, { message: "product.has_serial.errors.invalid" }).max(1, { message: "product.has_serial.errors.invalid" }).default(0),
    vat: z.coerce.number({
        invalid_type_error: "product.vat.errors.invalid",
    }).min(0, { message: "product.vat.errors.min" }).default(0),
    unit_type_id: z.coerce.number({
        required_error: "product.unit_type.errors.required",
        invalid_type_error: "product.unit_type.errors.required",
    }).min(1, { message: "product.unit_type.errors.required" }),
    product_category_id: z.coerce.number({
        required_error: "product.product_category.errors.required",
        invalid_type_error: "product.product_category.errors.required",
    }).min(1, { message: "product.product_category.errors.required" }),
    description: z.string().nullable().optional().default(""),
});

export type ProductFormInput = z.input<typeof ProductFormSchema>;
export type ProductPayload = z.output<typeof ProductFormSchema>;
