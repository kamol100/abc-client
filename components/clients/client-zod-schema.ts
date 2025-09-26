

import { z } from "zod";

import i18n from "i18next";

export const ClientSchema = z.object({
    id: z.nullable(z.coerce.string()).optional(),
    name: z
        .string({
            required_error: i18n.t("name_required"),
        })
        .min(2, { message: i18n.t("Client must have at least 2 character(s)") }),
    zone_id: z.nullable(z.coerce.number()).optional(),
    device_id: z.nullable(z.coerce.number()).optional(),
    device: z.nullable(z.record(z.coerce.string())).optional(),
    package_id: z.coerce.number().min(1),
    client_id: z.string().optional(),
    zone: z.nullable(z.record(z.coerce.string())).optional(),
    sub_zone_id: z.coerce.string().optional(),
    sub_zone: z.nullable(z.record(z.coerce.string())).optional(),
    network: z.nullable(z.record(z.coerce.string())).optional(),
    network_id: z.coerce.number().min(1),
    ip_address: z.nullable(z.string()).optional(),
    mac_address: z.nullable(z.string()).optional(),
    email: z.nullable(z.string()),
    payment_id: z.nullable(z.string()).optional(),
    payment_deadline: z.nullable(z.coerce.string().optional()),
    fund: z.string().optional(),
    payment_term: z.coerce.number(),
    payments: z.nullable(z.array(z.coerce.string())).optional(),
    invoiceDue: z.nullable(z.array(z.coerce.string())).optional(),
    // phone: z.string().min(11, {
    //   message: "11 digits phone number must be required",
    // }),
    phone: z.nullable(z.string()).optional(),
    alternate_phone1: z.nullable(z.string().optional()),
    father_name: z.nullable(z.string().optional()),
    photo: z.nullable(z.string().optional()),
    current_address: z.nullable(z.string().optional()),
    permanent_address: z.nullable(z.string().optional()),
    upazila_id: z.coerce.number().optional(),
    package: z.nullable(z.record(z.coerce.string()).optional()),
    upazila: z.nullable(z.record(z.coerce.string())).optional(),
    adr_latitude: z.nullable(z.coerce.string().optional()),
    adr_longitude: z.nullable(z.coerce.string().optional()),
    occupation: z.nullable(z.string().optional()),
    nid: z.nullable(z.string().optional()),
    nid_front: z.nullable(z.string().optional()),
    nid_back: z.nullable(z.string().optional()),
    billing_term: z.string().optional(),
    discount: z.nullable(z.string().optional()),
    connection_date: z.nullable(z.string().optional()),
    connection_type: z.string().optional(),
    connection_mode: z.string().optional(),
    pppoe_username: z.string().min(1, {
        message: "PPPoE ID must have at least 1  character(s)",
    }),
    pppoe_password: z.string().min(1, {
        message: "Password field is required",
    }),
    status: z.coerce.number().optional(),
    note: z.nullable(z.string().optional()),
    created_by: z.coerce.string().optional(),
    reseller_id: z.coerce.string().optional(),
    type: z.coerce.string().optional(),
    cable_type: z.nullable(z.string()).optional(),
    cable_length: z
        .coerce.string()
        .optional()
        .default("0"),
    cable_id: z.nullable(z.coerce.string()).optional(),
    login_sms_notification: z.nullable(z.coerce.number()).optional(),
    cable_invoice: z.coerce.number().optional().default(0),
    termination_date: z.coerce.string().optional(),
    billing_type: z.string().optional(),
    welcome_notification: z.coerce.number().optional(),
    invoice_day: z.string().default("01"),
});

export type Client = z.infer<typeof ClientSchema>;