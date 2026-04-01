import { z } from "zod";

export const CompanyProfileRowSchema = z
  .object({
    id: z.coerce.number().optional(),
    uuid: z.string().optional(),
    name: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
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
  phone: z.string().trim().optional().or(z.literal("")),
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
