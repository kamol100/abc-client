import { isBangladeshMobile, isValidHttpDomainUrl } from "@/lib/helper/helper";
import { z } from "zod";

const TEXT_MAX = 200;
const WEBSITE_MAX = 2000;

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
        created_at: z.string().nullable().optional(),
        updated_at: z.string().nullable().optional(),
    })
    .passthrough();

export type DemoRequestRow = z.infer<typeof DemoRequestRowSchema>;

export const DemoRequestAdminEditFormSchema = z.object({
    status: z.enum(DEMO_REQUEST_STATUSES, {
        required_error: "admin_demo_request.status.errors.required",
        invalid_type_error: "admin_demo_request.status.errors.required",
    }),
    website: z
        .string()
        .trim()
        .max(WEBSITE_MAX, "demo_request.fields.website.errors.max")
        .refine(
            (s) => s.length === 0 || isValidHttpDomainUrl(s),
            "demo_request.fields.website.errors.invalid",
        ),
    phone: z
        .string()
        .trim()
        .min(1, "demo_request.fields.phone.errors.required")
        .refine(isBangladeshMobile, "demo_request.fields.phone.errors.invalid"),
    isp_name: z
        .string()
        .trim()
        .min(1, "demo_request.fields.isp_name.errors.required")
        .max(TEXT_MAX, "demo_request.fields.isp_name.errors.max"),
});

export type DemoRequestAdminEditFormInput = z.input<typeof DemoRequestAdminEditFormSchema>;
export type DemoRequestAdminEditPayload = z.output<typeof DemoRequestAdminEditFormSchema>;
