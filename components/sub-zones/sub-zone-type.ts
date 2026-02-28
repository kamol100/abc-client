import { z } from "zod";
import i18n from "i18next";

const ZoneRefSchema = z.object({
    id: z.coerce.number(),
    name: z.string(),
});

const NetworkRefSchema = z.object({
    id: z.coerce.number(),
    name: z.string(),
});

export type ZoneRef = z.infer<typeof ZoneRefSchema>;
export type NetworkRef = z.infer<typeof NetworkRefSchema>;

export const SubZoneRowSchema = z.object({
    id: z.coerce.number(),
    name: z.string(),
    name_bn: z.string().nullable().optional(),
    location: z.string().nullable().optional(),
    ports: z.coerce.string().nullable().optional(),
    note: z.string().nullable().optional(),
    zone_id: z.coerce.number().optional(),
    zone: ZoneRefSchema.nullable().optional(),
    network_id: z.coerce.number().nullable().optional(),
    network: NetworkRefSchema.nullable().optional(),
}).passthrough();

export type SubZoneRow = z.infer<typeof SubZoneRowSchema>;

export const SubZoneFormSchema = z.object({
    name: z.string({
        required_error: i18n.t("sub_zone_name_required"),
        invalid_type_error: i18n.t("sub_zone_name_required"),
    }).min(2, { message: i18n.t("sub_zone_name_min_2") }),
    name_bn: z.string().nullable().optional().default(""),
    zone_id: z.coerce.number({
        required_error: i18n.t("zone_required"),
        invalid_type_error: i18n.t("zone_required"),
    }).min(1, { message: i18n.t("zone_required") }),
    network_id: z.coerce.number().nullable().optional(),
    location: z.string().nullable().optional().default(""),
    ports: z.coerce.string().nullable().optional().default(""),
    note: z.string().nullable().optional().default(""),
});

export type SubZoneFormInput = z.input<typeof SubZoneFormSchema>;
export type SubZonePayload = z.output<typeof SubZoneFormSchema>;
