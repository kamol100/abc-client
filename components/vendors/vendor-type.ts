import { z } from "zod";

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
        required_error: "vendor.name.errors.required",
        invalid_type_error: "vendor.name.errors.required",
    }).min(2, { message: "vendor.name.errors.min" }),
    phone: z.string({
        required_error: "vendor.phone.errors.required",
        invalid_type_error: "vendor.phone.errors.required",
    }).min(11, { message: "vendor.phone.errors.min" }),
    email: z.string().email({ message: "vendor.email.errors.invalid" }).nullable().optional().default(""),
    address: z.string().nullable().optional().default(""),
});

export type VendorFormInput = z.input<typeof VendorFormSchema>;
export type VendorPayload = z.output<typeof VendorFormSchema>;
