import { z } from "zod";
import i18n from "@/i18n";

export const ProductCategoryRowSchema = z.object({
    id: z.coerce.number(),
    name: z.string(),
    description: z.string().nullable().optional(),
    deletable: z.number().optional(),
}).passthrough();

export type ProductCategoryRow = z.infer<typeof ProductCategoryRowSchema>;

export const ProductCategoryFormSchema = z.object({
    name: z.string({
        required_error: i18n.t("product_category.name.errors.required"),
        invalid_type_error: i18n.t("product_category.name.errors.invalid"),
    }).min(2, { message: i18n.t("product_category.name.errors.min") }),
    description: z.string().nullable().optional().default(""),
});

export type ProductCategoryFormInput = z.input<typeof ProductCategoryFormSchema>;
export type ProductCategoryPayload = z.output<typeof ProductCategoryFormSchema>;
