import { z } from "zod";
import i18n from "i18next";

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
        required_error: i18n.t("vendor_name_required"),
        invalid_type_error: i18n.t("vendor_name_required"),
    }).min(2, { message: i18n.t("vendor_name_min_2") }),
    phone: z.string({
        required_error: i18n.t("phone_required"),
        invalid_type_error: i18n.t("phone_required"),
    }).min(11, { message: i18n.t("phone_min_11") }),
    email: z.string().email({ message: i18n.t("email_invalid") }).nullable().optional().default(""),
    address: z.string().nullable().optional().default(""),
});

export type VendorFormInput = z.input<typeof VendorFormSchema>;
export type VendorPayload = z.output<typeof VendorFormSchema>;
