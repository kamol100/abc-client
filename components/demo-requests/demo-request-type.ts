import { z } from "zod";

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

export const DemoRequestStatusFormSchema = z.object({
    status: z.enum(DEMO_REQUEST_STATUSES, {
        required_error: "admin_demo_request.status.errors.required",
        invalid_type_error: "admin_demo_request.status.errors.required",
    }),
});

export type DemoRequestStatusFormInput = z.input<typeof DemoRequestStatusFormSchema>;
export type DemoRequestStatusPayload = z.output<typeof DemoRequestStatusFormSchema>;
