import { z } from "zod";

const NamedRefSchema = z.object({
    id: z.coerce.number(),
    name: z.string(),
}).passthrough();

export const TjBoxRowSchema = z.object({
    id: z.coerce.number(),
    name: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    zone_id: z.coerce.number().nullable().optional(),
    device_id: z.coerce.number().nullable().optional(),
    latitude: z.coerce.number(),
    longitude: z.coerce.number(),
    status: z.enum(["active", "inactive"]),
    zone: NamedRefSchema.nullable().optional(),
    device: NamedRefSchema.nullable().optional(),
}).passthrough();

export type TjBoxRow = z.infer<typeof TjBoxRowSchema>;

export const TjBoxFormSchema = z.object({
    name: z.string().optional(),
    address: z.string().optional(),
    zone_id: z.coerce.number().nullable().optional(),
    device_id: z.coerce.number().nullable().optional(),
    latitude: z.coerce.number()
        .min(-90, { message: "tj_box.latitude.errors.range" })
        .max(90, { message: "tj_box.latitude.errors.range" }),
    longitude: z.coerce.number()
        .min(-180, { message: "tj_box.longitude.errors.range" })
        .max(180, { message: "tj_box.longitude.errors.range" }),
    status: z.enum(["active", "inactive"]).default("active"),
});

export type TjBoxFormInput = z.input<typeof TjBoxFormSchema>;
export type TjBoxPayload = z.output<typeof TjBoxFormSchema>;
