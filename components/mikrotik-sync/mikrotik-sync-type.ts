import { z } from "zod";

export const MikrotikSyncResellerSchema = z
  .object({
    name: z.string().nullable().optional(),
  })
  .passthrough();

export const MikrotikSyncRowSchema = z
  .object({
    id: z.string(),
    name: z.string().nullable().optional(),
    service: z.string().nullable().optional(),
    caller_id: z.string().nullable().optional(),
    password: z.string().nullable().optional(),
    profile: z.string().nullable().optional(),
    disabled: z.string().nullable().optional(),
    syncd_status: z.string().nullable().optional(),
    network_id: z.coerce.number().nullable().optional(),
    reseller: MikrotikSyncResellerSchema.nullable().optional(),
    client_in_mikrotik: z.string().nullable().optional(),
    client_in_app: z.string().nullable().optional(),
    mikrotik_profile: z.string().nullable().optional(),
    app_profile: z.string().nullable().optional(),
    profile_match: z.string().nullable().optional(),
    client_status_mikrotik: z.string().nullable().optional(),
    client_status_app: z.string().nullable().optional(),
    mikrotik_match: z.coerce.number().optional(),
    syncable: z.coerce.number().optional(),
  })
  .passthrough();

export const MikrotikSyncListSchema = z
  .object({
    data: z.array(MikrotikSyncRowSchema).default([]),
    pagination: z.custom<Pagination>().optional(),
    match_count: z.coerce.number().default(0),
    not_match_count: z.coerce.number().default(0),
    summary: z.string().nullable().optional(),
  })
  .passthrough();

export const MikrotikSyncNetworkSchema = z.object({
  network_id: z.coerce
    .number({
      required_error: "mikrotik_sync.sync.network.errors.required",
    })
    .min(1, {
      message: "mikrotik_sync.sync.network.errors.required",
    }),
});

export const MikrotikSyncImportSchema = z.object({
  name: z
    .string({
      required_error: "client.name.errors.required",
    })
    .min(2, { message: "client.name.errors.min" }),
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
  network_id: z.coerce.number().min(1, {
    message: "mikrotik_sync.network_id.errors.required",
  }),
  package_id: z.coerce.number().min(1, {
    message: "mikrotik_sync.package_id.errors.required",
  }),
  device_id: z.coerce.number().nullable().optional(),
  upazila_id: z.coerce.number().optional(),
  payment_term: z.coerce.number().min(1, {
    message: "mikrotik_sync.payment_term.errors.required",
  }),
  payment_deadline: z.coerce.string().nullable().optional(),
  discount: z.string().nullable().optional(),
  billing_term: z.enum(["prepaid", "postpaid"]).optional(),
  billing_type: z.string().optional(),
  connection_type: z.string().optional(),
  connection_mode: z.string().optional(),
  connection_date: z.coerce.string().nullable().optional(),
  termination_date: z.coerce.string().optional(),
  current_address: z.string().nullable().optional(),
  permanent_address: z.string().nullable().optional(),
  father_name: z.string().nullable().optional(),
  occupation: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  status: z.coerce.number().optional(),
  welcome_notification: z.coerce.number().optional(),
  cable_type: z.string().nullable().optional(),
  cable_length: z.coerce.string().optional().default("0"),
  invoice_day: z.string().default("01"),
  fund: z.string().optional(),
  type: z.coerce.string().optional(),
  mikrotik_profile: z.string().nullable().optional(),
});

export type MikrotikSyncRow = z.infer<typeof MikrotikSyncRowSchema>;
export type MikrotikSyncList = z.infer<typeof MikrotikSyncListSchema>;
export type MikrotikSyncNetworkInput = z.input<typeof MikrotikSyncNetworkSchema>;
export type MikrotikSyncNetworkPayload = z.output<typeof MikrotikSyncNetworkSchema>;
export type MikrotikSyncImportInput = z.input<typeof MikrotikSyncImportSchema>;
export type MikrotikSyncImportPayload = z.output<typeof MikrotikSyncImportSchema>;
