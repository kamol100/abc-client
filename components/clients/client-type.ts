import { z } from "zod";
import { InvoiceTypeRefSchema } from "@/components/invoices/invoice-type";

const padDatePart = (value: number): string => value.toString().padStart(2, "0");

const toLocalDateString = (value: Date): string => {
    const year = value.getFullYear();
    const month = padDatePart(value.getMonth() + 1);
    const day = padDatePart(value.getDate());
    return `${year}-${month}-${day}`;
};

const normalizeDateOnlyInput = (value: unknown): unknown => {
    if (value === null || value === undefined || value === "") return undefined;
    if (value instanceof Date) return toLocalDateString(value);
    if (typeof value === "string") {
        const trimmed = value.trim();
        if (!trimmed) return undefined;
        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

        const parsed = new Date(trimmed);
        if (!Number.isNaN(parsed.getTime())) return toLocalDateString(parsed);
        return trimmed;
    }
    return value;
};

const dateOnlyField = z.preprocess(normalizeDateOnlyInput, z.string().optional());

const RefSchema = z.object({
    id: z.coerce.number(),
    name: z.string(),
}).passthrough();

export const InvoiceDueItemSchema = z.object({
    uuid: z.string(),
    trackID: z.string().optional(),
    invoice_type: InvoiceTypeRefSchema.nullable().optional(),
    amount: z.coerce.number().optional(),
    after_discount_amount: z.coerce.number().default(0),
    discount: z.coerce.number().default(0),
    line_total_discount: z.coerce.number().default(0),
    amount_paid: z.coerce.number().default(0),
    total_amount: z.coerce.number().default(0),
}).passthrough();

export type InvoiceDueItem = z.infer<typeof InvoiceDueItemSchema>;

export const ClientRowSchema = z.object({
    id: z.coerce.number(),
    sid: z.string().nullable().optional(),
    name: z.string(),
    client_id: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    pppoe_username: z.string().nullable().optional(),
    ip_address: z.string().nullable().optional(),
    mac_address: z.string().nullable().optional(),
    status: z.coerce.number().optional(),
    connection_type: z.string().nullable().optional(),
    connection_mode: z.string().nullable().optional(),
    billing_term: z.enum(["prepaid", "postpaid"]).nullable().optional(),
    discount: z.string().nullable().optional(),
    payment_term: z.coerce.number().nullable().optional(),
    payment_deadline: z.string().nullable().optional(),
    current_address: z.string().nullable().optional(),
    permanent_address: z.string().nullable().optional(),
    note: z.string().nullable().optional(),
    zone: RefSchema.nullable().optional(),
    sub_zone: RefSchema.nullable().optional(),
    network: RefSchema.nullable().optional(),
    package: RefSchema.nullable().optional(),
    device: RefSchema.nullable().optional(),
    upazila: RefSchema.nullable().optional(),
    zone_id: z.coerce.number().nullable().optional(),
    sub_zone_id: z.coerce.number().nullable().optional(),
    network_id: z.coerce.number().nullable().optional(),
    package_id: z.coerce.number().nullable().optional(),
    device_id: z.coerce.number().nullable().optional(),
    invoiceDue: z.array(InvoiceDueItemSchema).nullable().optional(),
    router_info: z.object({
        ip_address: z.string().nullable().optional(),
        user_mac_address: z.string().nullable().optional(),
        uptime: z.string().nullable().optional(),
        last_logout: z.string().nullable().optional(),
        is_online: z.boolean().nullable().optional(),
    }).nullable().optional(),
}).passthrough();

export type ClientRow = z.infer<typeof ClientRowSchema>;

export const ClientFormSchema = z.object({
    name: z.string({
        required_error: "client.name.errors.required",
    }).min(2, { message: "client.name.errors.min" }),
    phone: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    pppoe_username: z.string().min(1, {
        message: "client.pppoe_username.errors.required",
    }),
    pppoe_password: z.string().min(1, {
        message: "client.pppoe_password.errors.required",
    }),
    ip_address: z.string().nullable().optional(),
    mac_address: z.string().nullable().optional(),
    zone_id: z.coerce.number().nullable().optional(),
    sub_zone_id: z.coerce.number().nullable().optional(),
    network_id: z.coerce.number().min(1),
    package_id: z.coerce.number().min(1),
    device_id: z.coerce.number().nullable().optional(),
    upazila_id: z.coerce.number().optional(),
    payment_term: z.coerce.number(),
    payment_deadline: z.coerce.string().nullable().optional(),
    discount: z.string().nullable().optional(),
    billing_term: z.enum(["prepaid", "postpaid"]).optional(),
    connection_type: z.string().optional(),
    connection_mode: z.string().optional(),
    connection_date: dateOnlyField.nullable().optional(),
    termination_date: dateOnlyField.nullable().optional(),
    current_address: z.string().nullable().optional(),
    permanent_address: z.string().nullable().optional(),
    adr_latitude: z.coerce.string().nullable().optional(),
    adr_longitude: z.coerce.string().nullable().optional(),
    father_name: z.string().nullable().optional(),
    occupation: z.string().nullable().optional(),
    nid: z.string().nullable().optional(),
    nid_front: z.string().nullable().optional(),
    nid_back: z.string().nullable().optional(),
    photo: z.string().nullable().optional(),
    note: z.string().nullable().optional(),
    status: z.coerce.number().optional(),
    welcome_notification: z.coerce.number().optional(),
    login_sms_notification: z.coerce.number().nullable().optional(),
    cable_type: z.string().nullable().optional(),
    cable_length: z.coerce.string().optional().default("0"),
    cable_id: z.coerce.string().nullable().optional(),
    cable_invoice: z.coerce.number().optional().default(0),
    billing_type: z.string().optional(),
    invoice_day: z.string().default("01"),
    fund: z.string().optional(),
    reseller_id: z.coerce.string().optional(),
    type: z.coerce.string().optional(),
    created_by: z.coerce.string().optional(),
});

export type ClientFormInput = z.input<typeof ClientFormSchema>;
export type ClientPayload = z.output<typeof ClientFormSchema>;

export const ClientHistoryRowSchema = z.object({
    id: z.coerce.number(),
    description: z.string().nullable().optional(),
    staff: z.string().nullable().optional(),
    old_data: z.record(z.unknown()).nullable().optional(),
    new_data: z.record(z.unknown()).nullable().optional(),
    created_at: z.string().nullable().optional(),
}).passthrough();

export type ClientHistoryRow = z.infer<typeof ClientHistoryRowSchema>;

export const ClientSpeedSchema = z.object({
    upload_speed: z.string().nullable().optional(),
    download_speed: z.string().nullable().optional(),
});

export type ClientSpeed = z.infer<typeof ClientSpeedSchema>;

/** Router/session info from API (e.g. client detail with router_info). */
export interface RouterInfo {
    ip_address?: string | null;
    user_mac_address?: string | null;
    uptime?: string | null;
    last_logout?: string | null;
    is_online?: boolean;
}
