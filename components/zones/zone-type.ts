import { z } from "zod";

const SubZoneSchema = z.object({
    id: z.coerce.number(),
    name: z.string(),
});

export type SubZone = z.infer<typeof SubZoneSchema>;

export const ZoneRowSchema = z.object({
    id: z.coerce.number(),
    name: z.string(),
    name_bn: z.string().nullable().optional(),
    lat: z.coerce.number().nullable().optional(),
    lon: z.coerce.number().nullable().optional(),
    subZone: z.array(SubZoneSchema).optional(),
}).passthrough();

export type ZoneRow = z.infer<typeof ZoneRowSchema>;

export const ZoneFormSchema = z.object({
    name: z.string({
        required_error: "zone.name.errors.required",
        invalid_type_error: "zone.name.errors.invalid",
    }).min(2, { message: "zone.name.errors.min" }),
    name_bn: z.string().optional().default(""),
    lat: z.coerce.number().nullable().optional(),
    lon: z.coerce.number().nullable().optional(),
});

export type ZoneFormInput = z.input<typeof ZoneFormSchema>;
export type ZonePayload = z.output<typeof ZoneFormSchema>;
