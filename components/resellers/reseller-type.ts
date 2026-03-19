import { z } from "zod";

const UserRefSchema = z.object({
    id: z.coerce.number().optional(),
    uuid: z.string().optional(),
    username: z.string().nullable().optional(),
}).passthrough();

const NamedRefSchema = z.object({
    id: z.coerce.number(),
    name: z.string(),
}).passthrough();

const UpazilaRefSchema = z.object({
    id: z.coerce.number().optional(),
    name: z.string().nullable().optional(),
}).passthrough();

const ResellerPackageRowSchema = z.object({
    id: z.coerce.number(),
    name: z.string().nullable().optional(),
    mikrotik_profile: z.string().nullable().optional(),
    bandwidth: z.string().nullable().optional(),
    is_reseller_package: z.coerce.number().default(0),
    buying_price: z.coerce.number().nullable().optional(),
}).passthrough();

const ResellerClientRowSchema = z.object({
    id: z.coerce.number(),
    name: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    status: z.coerce.number().nullable().optional(),
    package: NamedRefSchema.nullable().optional(),
    network: NamedRefSchema.nullable().optional(),
    zone: NamedRefSchema.nullable().optional(),
}).passthrough();

const InvoiceRefSchema = z.object({
    id: z.coerce.number().optional(),
    after_discount_amount: z.coerce.number().default(0),
    amount_paid: z.coerce.number().default(0),
}).passthrough();

export type UserRef = z.infer<typeof UserRefSchema>;
export type NamedRef = z.infer<typeof NamedRefSchema>;
export type InvoiceRef = z.infer<typeof InvoiceRefSchema>;
export type ResellerPackageRow = z.infer<typeof ResellerPackageRowSchema>;
export type ResellerClientRow = z.infer<typeof ResellerClientRowSchema>;

export const ResellerRowSchema = z.object({
    id: z.coerce.number(),
    reseller_id: z.string().nullable().optional(),
    name: z.string(),
    username: z.string().nullable().optional(),
    password: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    prefix: z.string().nullable().optional(),
    status: z.coerce.number().default(1),
    company: z.string().nullable().optional(),
    company_phone: z.string().nullable().optional(),
    company_address: z.string().nullable().optional(),
    over_due_amount: z.coerce.number().nullable().optional(),
    billing_type: z.string().nullable().optional(),
    auto_recharge: z.coerce.number().nullable().optional(),
    terminate_hour: z.coerce.number().nullable().optional(),
    terminate_minute: z.coerce.number().nullable().optional(),
    serial_start_from: z.coerce.number().nullable().optional(),
    gender: z.string().nullable().optional(),
    father_name: z.string().nullable().optional(),
    mother_name: z.string().nullable().optional(),
    present_address: z.string().nullable().optional(),
    permanent_address: z.string().nullable().optional(),
    social_media_account: z.string().nullable().optional(),
    nid: z.string().nullable().optional(),
    marital_status: z.coerce.number().nullable().optional(),
    blood_group: z.string().nullable().optional(),
    date_of_birth: z.string().nullable().optional(),
    join_date: z.string().nullable().optional(),
    user: UserRefSchema.nullable().optional(),
    network: NamedRefSchema.nullable().optional(),
    zone: NamedRefSchema.nullable().optional(),
    upazilas: z.array(UpazilaRefSchema).nullable().optional(),
    package: z.array(ResellerPackageRowSchema).nullable().optional(),
    clients: z.array(NamedRefSchema).nullable().optional(),
    invoices: z.array(InvoiceRefSchema).nullable().optional(),
    network_id: z.coerce.number().nullable().optional(),
    zone_id: z.coerce.number().nullable().optional(),
    package_id: z.array(z.coerce.number()).nullable().optional(),
}).passthrough();

export type ResellerRow = z.infer<typeof ResellerRowSchema>;

const ResellerFormBaseSchema = z
    .object({
        id: z.coerce.number().nullable().optional(),
        name: z.string({
            required_error: "reseller.name.errors.required",
            invalid_type_error: "reseller.name.errors.required",
        }).min(2, { message: "reseller.name.errors.min" }),
        username: z.string().nullable().optional(),
        password: z.string().nullable().optional(),
        phone: z.string({
            required_error: "reseller.phone.errors.required",
            invalid_type_error: "reseller.phone.errors.required",
        }).min(11, { message: "reseller.phone.errors.min" }),
        network_id: z.coerce.number({
            invalid_type_error: "reseller.network.errors.required",
        }).min(1, { message: "reseller.network.errors.required" }),
        zone_id: z.coerce.number().nullable().optional(),
        package_id: z.array(z.coerce.number()).default([]),
        company: z.string().nullable().optional().default(""),
        company_phone: z.string().nullable().optional().default(""),
        company_address: z.string().nullable().optional().default(""),
        prefix: z.string().nullable().optional().default(""),
        status: z.coerce.number().default(1),
        over_due_amount: z.coerce.number().nullable().optional().default(0),
        billing_type: z.enum(["postpaid", "prepaid"]).default("prepaid"),
        auto_recharge: z.coerce.number().default(1),
        terminate_hour: z.coerce.number().nullable().optional(),
        terminate_minute: z.coerce.number().nullable().optional(),
        serial_start_from: z.coerce.number().nullable().optional(),
        father_name: z.string().nullable().optional().default(""),
        mother_name: z.string().nullable().optional().default(""),
        present_address: z.string().nullable().optional().default(""),
        permanent_address: z.string().nullable().optional().default(""),
        social_media_account: z.string().nullable().optional().default(""),
        email: z.string().nullable().optional().default(""),
        nid: z.string().nullable().optional().default(""),
        gender: z.enum(["male", "female"]).default("male"),
        marital_status: z.coerce.number().default(0),
        blood_group: z.string().nullable().optional().default(""),
        date_of_birth: z.coerce.string().nullable().optional(),
        join_date: z.coerce.string().nullable().optional(),
    });

export const getResellerFormSchema = (mode: "create" | "edit" = "create") =>
    ResellerFormBaseSchema.superRefine((data, ctx) => {
        if (mode === "create") {
            if (!data.username || data.username.trim().length < 1) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["username"],
                    message: "reseller.username.errors.required",
                });
            }
            if (!data.password || data.password.trim().length < 1) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["password"],
                    message: "reseller.password.errors.required",
                });
            }
        }
    });

export const ResellerFormSchema = getResellerFormSchema("create");

export type ResellerFormInput = z.input<typeof ResellerFormSchema>;
export type ResellerPayload = z.output<typeof ResellerFormSchema>;
