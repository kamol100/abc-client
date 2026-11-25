import { z } from "zod";
import { normalizeBdMobile, requiredBdMobile } from "@/lib/phone";

export const CompanyProfileRowSchema = z
  .object({
    id: z.coerce.number().optional(),
    uuid: z.string().optional(),
    name: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    support_phone: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    status: z.union([z.string(), z.number()]).nullable().optional(),
    logo: z.string().nullable().optional(),
    favicon: z.string().nullable().optional(),
  })
  .passthrough();

export const CompanyProfileFormSchema = z.object({
  name: z
    .string({
      required_error: "company_profile.name.errors.required",
      invalid_type_error: "company_profile.name.errors.required",
    })
    .trim()
    .min(2, { message: "company_profile.name.errors.min" }),
  phone: requiredBdMobile("common.phone_required"),
  // Often a 096… hotline, so any number is accepted; a mobile number still loses its +88.
  support_phone: z.preprocess(
    (value) => (typeof value === "string" ? normalizeBdMobile(value) ?? "" : value),
    z
      .string()
      .max(255, { message: "company_profile.support_phone.errors.max" })
      .optional()
      .or(z.literal("")),
  ),
  email: z
    .string()
    .trim()
    .email({ message: "company_profile.email.errors.invalid" })
    .optional()
    .or(z.literal("")),
  address: z.string().trim().optional().or(z.literal("")),
});

export type CompanyProfileRow = z.infer<typeof CompanyProfileRowSchema>;
export type CompanyProfileFormInput = z.input<typeof CompanyProfileFormSchema>;
export type CompanyProfilePayload = z.output<typeof CompanyProfileFormSchema>;
