import i18n from "@/i18n";
import { z } from "zod";

const DeviceTypeRefSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
});

const NetworkRefSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
});

const ZoneRefSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
});

const DeviceRefSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
});

export const DeviceRowSchema = z
  .object({
    id: z.coerce.number(),
    name: z.string(),
    device_ip: z.string().nullable().optional(),
    input_port: z.coerce.string().nullable().optional(),
    total_port: z.coerce.string().nullable().optional(),
    latitude: z.coerce.number().nullable().optional(),
    longitude: z.coerce.number().nullable().optional(),
    device_order: z.coerce.number().nullable().optional(),
    fiber_code: z.string().nullable().optional(),
    note: z.string().nullable().optional(),
    status: z.union([z.string(), z.coerce.number()]).optional(),
    network_id: z.coerce.number().nullable().optional(),
    network: NetworkRefSchema.nullable().optional(),
    zone_id: z.coerce.number().nullable().optional(),
    zone: ZoneRefSchema.nullable().optional(),
    device_type_id: z.coerce.number().nullable().optional(),
    device_type: DeviceTypeRefSchema.nullable().optional(),
    device_id: z.coerce.number().nullable().optional(),
    device: DeviceRefSchema.nullable().optional(),
  })
  .passthrough();

export type DeviceRow = z.infer<typeof DeviceRowSchema>;

export const DeviceFormSchema = z.object({
  name: z
    .string({
      required_error: i18n.t("device.name.errors.required"),
      invalid_type_error: i18n.t("device.name.errors.invalid"),
    })
    .min(2, { message: i18n.t("device.name.errors.min") }),
  network_id: z.coerce
    .number({
      required_error: i18n.t("device.network.errors.required"),
      invalid_type_error: i18n.t("device.network.errors.required"),
    })
    .min(1, { message: i18n.t("device.network.errors.required") }),
  device_type_id: z.coerce
    .number({
      required_error: i18n.t("device.device_type.errors.required"),
      invalid_type_error: i18n.t("device.device_type.errors.required"),
    })
    .min(1, { message: i18n.t("device.device_type.errors.required") }),
  device_id: z.coerce.number().nullable().optional(),
  zone_id: z.coerce.number().nullable().optional(),
  device_ip: z.string().nullable().optional().default(""),
  input_port: z.coerce.string().nullable().optional().default(""),
  total_port: z.coerce.string().nullable().optional().default(""),
  latitude: z.coerce.number().nullable().optional(),
  longitude: z.coerce.number().nullable().optional(),
  device_order: z.coerce.number().nullable().optional().default(0),
  fiber_code: z.string().nullable().optional().default(""),
  note: z.string().nullable().optional().default(""),
  status: z.union([z.enum(["active", "inactive"]), z.coerce.number()]).optional(),
});

export type DeviceFormInput = z.input<typeof DeviceFormSchema>;
export type DevicePayload = z.output<typeof DeviceFormSchema>;
