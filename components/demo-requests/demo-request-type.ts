import { isBangladeshMobile } from "@/lib/helper/helper";
import { z } from "zod";

const TEXT_MAX = 200;
const WEBSITE_MAX = 2000;
const ADDRESS_MAX = 2000;
const USERNAME_MAX = 100;
const PASSWORD_MAX = 255;

const optionalText = (max: number, maxMessage: string) =>
    z.string().trim().max(max, maxMessage);

const optionalEmail = z
    .string()
    .trim()
    .max(320, "demo_request.fields.email.errors.max")
    .refine(
        (value) => value.length === 0 || z.string().email().safeParse(value).success,
        "demo_request.fields.email.errors.invalid",
    );

const optionalUserCount = z
    .string()
    .trim()
    .max(20, "demo_request.fields.user_count.errors.max")
    .refine(
        (value) => value.length === 0 || /^\d{1,12}$/.test(value),
        "demo_request.fields.user_count.errors.invalid",
    );

const requiredPhone = (requiredMessage: string, invalidMessage: string) =>
    z.string().trim().min(1, requiredMessage).refine(isBangladeshMobile, invalidMessage);

export const DEMO_REQUEST_STATUSES = ["pending", "approved", "rejected"] as const;

export type DemoRequestStatus = (typeof DEMO_REQUEST_STATUSES)[number];

export const DemoRequestStatusOptions = DEMO_REQUEST_STATUSES.map((value) => ({
    value,
    label: `admin_demo_request.status.${value}`,
}));

export const DemoRequestRowSchema = z
    .object({
        id: z.coerce.number(),
        full_name: z.string(),
        isp_name: z.string(),
        email: z.string().nullable().optional(),
        website: z.string().nullable().optional(),
        phone: z.string(),
        user_count: z.string().nullable().optional(),
        whatsapp: z.string(),
        office_address: z.string().nullable().optional(),
        terms_accepted: z.boolean().optional(),
        status: z.enum(DEMO_REQUEST_STATUSES),
        username: z.string().nullable().optional(),
        password: z.string().nullable().optional(),
        created_at: z.string().nullable().optional(),
        updated_at: z.string().nullable().optional(),
    })
    .passthrough();

export type DemoRequestRow = z.infer<typeof DemoRequestRowSchema>;

export const DemoRequestAdminEditFormSchema = z.object({
    full_name: z
        .string()
        .trim()
        .min(1, "demo_request.fields.full_name.errors.required")
        .max(TEXT_MAX, "demo_request.fields.full_name.errors.max"),
    isp_name: z
        .string()
        .trim()
        .min(1, "demo_request.fields.isp_name.errors.required")
        .max(TEXT_MAX, "demo_request.fields.isp_name.errors.max"),
    email: optionalEmail,
    website: optionalText(WEBSITE_MAX, "demo_request.fields.website.errors.max"),
    phone: requiredPhone(
        "demo_request.fields.phone.errors.required",
        "demo_request.fields.phone.errors.invalid",
    ),
    user_count: optionalUserCount,
    whatsapp: requiredPhone(
        "demo_request.fields.whatsapp.errors.required",
        "demo_request.fields.whatsapp.errors.invalid",
    ),
    office_address: optionalText(ADDRESS_MAX, "demo_request.fields.office_address.errors.max"),
    terms_accepted: z.boolean({
        required_error: "demo_request.fields.terms.errors.required",
        invalid_type_error: "demo_request.fields.terms.errors.required",
    }),
    status: z.enum(DEMO_REQUEST_STATUSES, {
        required_error: "admin_demo_request.status.errors.required",
        invalid_type_error: "admin_demo_request.status.errors.required",
    }),
    username: optionalText(USERNAME_MAX, "admin_demo_request.fields.username.errors.max"),
    password: optionalText(PASSWORD_MAX, "admin_demo_request.fields.password.errors.max"),
});

export type DemoRequestAdminEditFormInput = z.input<typeof DemoRequestAdminEditFormSchema>;
export type DemoRequestAdminEditPayload = z.output<typeof DemoRequestAdminEditFormSchema>;
