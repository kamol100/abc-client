import { z } from "zod";

export const CoordinateSchema = z.preprocess((val) => {
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (trimmed === "") return null;
    if (trimmed.includes(",")) {
      return trimmed.split(",").map((v) => v.trim());
    }
  }
  if (Array.isArray(val) && val.length === 0) return null;
  return val;
}, z.tuple([z.coerce.number(), z.coerce.number()]).nullable());

const StatusSchema = z.union([z.coerce.string(), z.coerce.number()]).optional();

const ClientInfoSchema = z
  .object({
    name: z.coerce.string().nullable().optional(),
    status: StatusSchema,
    address: z.coerce.string().nullable().optional(),
    phone: z.coerce.string().nullable().optional(),
  })
  .passthrough();

const OltInfoSchema = z
  .object({
    name: z.coerce.string().nullable().optional(),
    status: StatusSchema,
    type: z.coerce.string().nullable().optional(),
  })
  .passthrough();

export const ClientMapClientSchema = z
  .object({
    id: z.union([z.coerce.number(), z.string()]).optional(),
    status: StatusSchema,
    location: CoordinateSchema.nullable().optional(),
    info: ClientInfoSchema.nullable().optional(),
  })
  .passthrough();

export const ClientMapRowSchema = z
  .object({
    id: z.union([z.coerce.number(), z.string()]).optional(),
    status: StatusSchema,
    location: CoordinateSchema.nullable().optional(),
    color: z.coerce.string().nullable().optional(),
    client: z.array(ClientMapClientSchema).optional().default([]),
    info: OltInfoSchema.nullable().optional(),
  })
  .passthrough();

export const ClientMapListSchema = z.array(ClientMapRowSchema);

export type ClientMapRow = z.infer<typeof ClientMapRowSchema>;

const TjBoxInfoSchema = z
  .object({
    name: z.coerce.string().nullable().optional(),
    status: StatusSchema,
  })
  .passthrough();

const TjBoxDeviceSchema = z
  .object({
    id: z.union([z.coerce.number(), z.string()]).optional(),
    geocode: CoordinateSchema.optional(),
    name: z.coerce.string().nullable().optional(),
    status: StatusSchema,
  })
  .passthrough();

export const TjBoxMapRowSchema = z
  .object({
    id: z.union([z.coerce.number(), z.string()]).optional(),
    geocode: CoordinateSchema.optional(),
    status: StatusSchema,
    info: TjBoxInfoSchema.nullable().optional(),
    device: TjBoxDeviceSchema.nullable().optional(),
  })
  .passthrough();

export const TjBoxMapListSchema = z.array(TjBoxMapRowSchema);

export type TjBoxMapRow = z.infer<typeof TjBoxMapRowSchema>;

export const ClientMapFilterSchema = z.object({
  device_id: z.union([z.coerce.number(), z.string()]).optional(),
  network_id: z.union([z.coerce.number(), z.string()]).optional(),
  zone_id: z.union([z.coerce.number(), z.string()]).optional(),
  status: z.union([z.coerce.number(), z.string()]).optional(),
});

export type ClientMapFilterInput = z.input<typeof ClientMapFilterSchema>;
export type ClientMapFilterPayload = z.output<typeof ClientMapFilterSchema>;

export const TjBoxMapFilterSchema = z.object({
  name: z.string().optional(),
  address: z.string().optional(),
  device_id: z.union([z.coerce.number(), z.string()]).optional(),
  zone_id: z.union([z.coerce.number(), z.string()]).optional(),
  status: z.string().optional(),
});

export type TjBoxMapFilterInput = z.input<typeof TjBoxMapFilterSchema>;
export type TjBoxMapFilterPayload = z.output<typeof TjBoxMapFilterSchema>;
