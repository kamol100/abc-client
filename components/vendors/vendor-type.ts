import { z } from "zod";
import i18n from "@/i18n";

export const VendorRowSchema = z.object({
    id: z.coerce.number(),
    name: z.string(),
    phone: z.string(),
    email: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
}).passthrough();

export type VendorRow = z.infer<typeof VendorRowSchema>;

export const VendorFormSchema = z.object({
    name: z.string({
        required_error: i18n.t("vendor.name.errors.required"),
        invalid_type_error: i18n.t("vendor.name.errors.required"),
    }).min(2, { message: i18n.t("vendor.name.errors.min") }),
    phone: z.string({
        required_error: i18n.t("vendor.phone.errors.required"),
        invalid_type_error: i18n.t("vendor.phone.errors.required"),
    }).min(11, { message: i18n.t("vendor.phone.errors.min") }),
    email: z.string().email({ message: i18n.t("vendor.email.errors.invalid") }).nullable().optional().default(""),
    address: z.string().nullable().optional().default(""),
});

export type VendorFormInput = z.input<typeof VendorFormSchema>;
export type VendorPayload = z.output<typeof VendorFormSchema>;
