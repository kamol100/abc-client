import { z } from "zod";

const WalletRefSchema = z.object({
    id: z.coerce.number().optional(),
    balance: z.coerce.number().nullable().optional(),
}).passthrough();

const UserRowSchema = z.object({
    id: z.coerce.string(),
    name: z.string(),
}).passthrough();

export const CompanyRowSchema = z.object({
    id: z.coerce.number(),
    name: z.string(),
    domain: z.string(),
    email: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
    username: z.string().nullable().optional(),
    client_count: z.coerce.number().nullable().optional(),
    clients: z.array(z.unknown()).optional(),
    wallet: WalletRefSchema.nullable().optional(),
    users: z.array(UserRowSchema).nullable().optional(),
}).passthrough();

export type CompanyRow = z.infer<typeof CompanyRowSchema>;

export const CompanyExportFileRowSchema = z.object({
  path: z.string(),
  name: z.string(),
  size: z.number(),
  last_modified: z.number(),
});
export type CompanyExportFileRow = z.infer<typeof CompanyExportFileRowSchema>;

const baseCompanyFormSchema = {
    name: z.string({
        required_error: "company.name.errors.required",
        invalid_type_error: "company.name.errors.invalid",
    }).min(2, { message: "company.name.errors.min" }),
    domain: z.string({
        required_error: "company.domain.errors.required",
        invalid_type_error: "company.domain.errors.required",
    }).min(2, { message: "company.domain.errors.min" }),
    phone: z.string({
        required_error: "company.phone.errors.required",
        invalid_type_error: "company.phone.errors.required",
    }).min(11, { message: "company.phone.errors.min" }),
    email: z.string().email({ message: "company.email.errors.invalid" }).nullable().optional().or(z.literal("")),
    address: z.string().nullable().optional().default(""),
    status: z.string({
        required_error: "company.status.errors.required",
    }).min(1, { message: "company.status.errors.required" }),
};

const passwordRefine = (data: { password?: string | null; confirm?: string | null }) => {
    if (data.password != null && data.password !== "") {
        return data.password.length >= 6 && data.password === data.confirm;
    }
    return true;
};

export const CompanyFormSchema = z.object({
    ...baseCompanyFormSchema,
    username: z.string().nullable().optional(),
    password: z.string().nullable().optional(),
    confirm: z.string().nullable().optional(),
}).refine(passwordRefine, {
    message: "company.password.errors.mismatch",
    path: ["confirm"],
});

export const CompanyCreateFormSchema = z.object({
    ...baseCompanyFormSchema,
    username: z.string({
        required_error: "company.username.errors.required",
    }).min(1, { message: "company.username.errors.required" }),
    password: z.string({
        required_error: "company.password.errors.required",
    }).min(6, { message: "company.password.errors.min" }),
    confirm: z.string({
        required_error: "company.password.errors.confirm_required",
    }),
}).refine((data) => data.password === data.confirm, {
    message: "company.password.errors.mismatch",
    path: ["confirm"],
});

export type CompanyFormInput = z.input<typeof CompanyFormSchema>;
export type CompanyPayload = z.output<typeof CompanyFormSchema>;
export type CompanyCreateFormInput = z.input<typeof CompanyCreateFormSchema>;
export type CompanyCreatePayload = z.output<typeof CompanyCreateFormSchema>;
