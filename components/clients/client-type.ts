import { z } from "zod";
import { InvoiceTypeRefSchema } from "@/components/invoices/invoice-type";
import { normalizeDateOnlyInput } from "@/lib/helper/helper";

const isBlankClientValue = (value: unknown): boolean =>
    value === undefined ||
    value === null ||
    value === "" ||
    value === "$undefined" ||
    value === "undefined";

const nullableText = z.preprocess(
    (value) => (isBlankClientValue(value) ? null : value),
    z.string().nullable(),
);

const nullableCoercedText = z.preprocess(
    (value) => (isBlankClientValue(value) || value === "null" ? null : value),
    z.coerce.string().nullable(),
);

const nullableInt = z.preprocess(
    (value) => (isBlankClientValue(value) || value === "null" ? null : value),
    z.coerce.number().int().nullable(),
);

const requiredSelection = (message: string) =>
    z.preprocess((value) => {
        if (isBlankClientValue(value) || value === "null") return undefined;
        const parsed = typeof value === "number" ? value : Number(value);
        return Number.isFinite(parsed) ? parsed : undefined;
    }, z.number({
        required_error: message,
        invalid_type_error: message,
    }).int().min(1, { message }));

const dateOnlyField = z.preprocess((value) => {
    if (isBlankClientValue(value)) return null;
    const normalized = normalizeDateOnlyInput(value);
    return normalized === undefined ? null : normalized;
}, z.string().nullable());

const RefSchema = z.object({
    id: z.coerce.number(),
    name: z.string(),
}).passthrough();

export const ClientPackageRefSchema = RefSchema.extend({
    bandwidth: z.string().nullable().optional(),
    price: z.union([z.number(), z.string(), z.null()]).optional(),
    buying_price: z.union([z.number(), z.string(), z.null()]).optional(),
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
    id: z.coerce.string().optional(),
    uuid: z.string().optional(),
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
    termination_date: z.string().nullable().optional(),
    note: z.string().nullable().optional(),
    zone: RefSchema.nullable().optional(),
    sub_zone: RefSchema.nullable().optional(),
    network: RefSchema.nullable().optional(),
    package: ClientPackageRefSchema.nullable().optional(),
    device: RefSchema.nullable().optional(),
    upazila: RefSchema.nullable().optional(),
    zone_id: z.coerce.number().nullable().optional(),
    sub_zone_id: z.coerce.number().nullable().optional(),
    network_id: z.coerce.number().nullable().optional(),
    package_id: z.coerce.number().nullable().optional(),
    device_id: z.coerce.number().nullable().optional(),
    invoiceDue: z.array(InvoiceDueItemSchema).nullable().optional(),
    /** Bound ONUs (OnuSummary in components/onu/onu-type.ts); only read for display. */
    onus: z.array(z.object({ id: z.string() }).passthrough()).nullable().optional(),
    router_info: z.object({
        ip_address: z.string().nullable().optional(),
        user_mac_address: z.string().nullable().optional(),
        uptime: z.string().nullable().optional(),
        last_logout: z.string().nullable().optional(),
        is_online: z.boolean().nullable().optional(),
    }).nullable().optional(),
}).passthrough();

export type ClientRow = z.infer<typeof ClientRowSchema>;

export function getClientId(client: Pick<ClientRow, "id" | "uuid">): string | undefined {
    return client.id ?? client.uuid;
}

export const ClientFormSchema = z.object({
    name: z.string({
        required_error: "client.name.errors.required",
    }).min(2, { message: "client.name.errors.min" }),
    phone: nullableText,
    email: nullableText,
    pppoe_username: z.string({
        required_error: "client.pppoe_username.errors.required",
        invalid_type_error: "client.pppoe_username.errors.required",
    }).min(1, {
        message: "client.pppoe_username.errors.required",
    }),
    pppoe_password: z.string({
        required_error: "client.pppoe_password.errors.required",
        invalid_type_error: "client.pppoe_password.errors.required",
    }).min(1, {
        message: "client.pppoe_password.errors.required",
    }),
    ip_address: nullableText,
    mac_address: nullableText,
    zone_id: nullableInt,
    sub_zone_id: nullableInt,
    network_id: requiredSelection("client.network.errors.required"),
    package_id: requiredSelection("client.package.errors.required"),
    device_id: nullableInt,
    upazila_id: z.preprocess((value) => {
        if (isBlankClientValue(value) || value === "null") return undefined;
        return value;
    }, z.coerce.number().int().optional()),
    payment_term: z.preprocess(
        (value) => (isBlankClientValue(value) ? 1 : value),
        z.coerce.number().int().min(1),
    ),
    payment_deadline: nullableInt,
    discount: nullableText,
    billing_term: z.preprocess(
        (value) => (isBlankClientValue(value) ? null : value),
        z.enum(["prepaid", "postpaid"]).nullable(),
    ),
    connection_type: nullableText,
    connection_mode: nullableText,
    connection_date: dateOnlyField,
    termination_date: dateOnlyField,
    current_address: nullableText,
    permanent_address: nullableText,
    adr_latitude: nullableCoercedText,
    adr_longitude: nullableCoercedText,
    father_name: nullableText,
    occupation: nullableText,
    nid: nullableText,
    nid_front: nullableText,
    nid_back: nullableText,
    photo: nullableText,
    note: nullableText,
    status: z.preprocess(
        (value) => (isBlankClientValue(value) ? 1 : value),
        z.coerce.number().int(),
    ),
    welcome_notification: z.preprocess(
        (value) => (isBlankClientValue(value) ? null : value),
        z.coerce.number().int().nullable(),
    ),
    login_sms_notification: z.preprocess(
        (value) => (value === undefined ? undefined : isBlankClientValue(value) || value === "null" ? null : value),
        z.coerce.number().int().nullable().optional(),
    ),
    cable_type: nullableText,
    cable_length: z.preprocess(
        (value) => (isBlankClientValue(value) ? 0 : value),
        z.coerce.number().int(),
    ),
    cable_id: z.preprocess(
        (value) => (value === undefined ? undefined : isBlankClientValue(value) || value === "null" ? null : value),
        z.string().nullable().optional(),
    ),
    cable_invoice: z.preprocess(
        (value) => (isBlankClientValue(value) ? 0 : value),
        z.coerce.number().int(),
    ),
    billing_type: nullableText,
    invoice_day: z.preprocess(
        (value) => (isBlankClientValue(value) ? "01" : value),
        z.string(),
    ),
    fund: nullableText,
    reseller_id: nullableInt,
    type: nullableText,
    created_by: z.preprocess((value) => {
        if (isBlankClientValue(value) || value === "null" || (typeof value === "object" && value !== null)) {
            return undefined;
        }
        return value;
    }, z.coerce.number().int().optional()),
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

export const ClientActivitySchema = z.object({
    total: z.coerce.number(),
    online: z.coerce.number(),
    offline: z.coerce.number(),
    disabled: z.coerce.number(),
}).passthrough();

export type ClientActivity = z.infer<typeof ClientActivitySchema>;

/** Router/session info from API (e.g. client detail with router_info). */
export interface RouterInfo {
    ip_address?: string | null;
    user_mac_address?: string | null;
    uptime?: string | null;
    last_logout?: string | null;
    is_online?: boolean;
}
