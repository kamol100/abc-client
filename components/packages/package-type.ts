import { z } from "zod";

export const NetworkRefSchema = z
  .object({
    id: z.coerce.number(),
    name: z.string(),
  })
  .passthrough();

export const ResellerRefSchema = z
  .object({
    id: z.coerce.number().optional(),
    uuid: z.string().optional(),
    name: z.string().nullable().optional(),
  })
  .passthrough();

export const ClientRefSchema = z
  .object({
    id: z.coerce.number().optional(),
    name: z.string().nullable().optional(),
  })
  .passthrough();

export const PackageChildSchema = z
  .object({
    id: z.coerce.number(),
    name: z.string().nullable().optional(),
    mikrotik_profile: z.string().nullable().optional(),
    bandwidth: z.string().nullable().optional(),
    reseller: ResellerRefSchema.nullable().optional(),
    clients: z.array(ClientRefSchema).nullable().optional(),
    is_reseller_package: z.coerce.number().nullable().optional(),
  })
  .passthrough();

export const PackageRowSchema = z
  .object({
    id: z.coerce.number(),
    network_id: z.coerce.number().nullable().optional(),
    package_parent_id: z.coerce.number().nullable().optional(),
    name: z.string(),
    mikrotik_profile: z.string().nullable().optional(),
    bandwidth: z.string().nullable().optional(),
    price: z.coerce.number().nullable().optional(),
    buying_price: z.coerce.number().nullable().optional(),
    note: z.string().nullable().optional(),
    is_reseller_package: z.coerce.number().default(0),
    network: NetworkRefSchema.nullable().optional(),
    reseller: ResellerRefSchema.nullable().optional(),
    clients: z.array(ClientRefSchema).nullable().optional(),
    children: z.array(PackageChildSchema).nullable().optional(),
    active_clients: z.coerce.number().default(0),
    inactive_clients: z.coerce.number().default(0),
    reseller_count: z.coerce.number().default(0),
    reseller_clients: z.coerce.number().default(0),
  })
  .passthrough();

export type PackageRow = z.infer<typeof PackageRowSchema>;
export type PackageChildRow = z.infer<typeof PackageChildSchema>;

export const PackageFormSchema = z.object({
  network_id: z.coerce.number({
    required_error: "package.network.errors.required",
    invalid_type_error: "package.network.errors.required",
  }).min(1, { message: "package.network.errors.required" }),
  name: z
    .string({
      required_error: "package.name.errors.required",
      invalid_type_error: "package.name.errors.invalid",
    })
    .min(2, { message: "package.name.errors.min" }),
  mikrotik_profile: z.string().nullable().optional().default(""),
  bandwidth: z
    .string({
      required_error: "package.bandwidth.errors.required",
      invalid_type_error: "package.bandwidth.errors.invalid",
    })
    .min(2, { message: "package.bandwidth.errors.min" }),
  price: z.coerce
    .number({
      invalid_type_error: "package.price.errors.invalid",
    })
    .min(0, { message: "package.price.errors.min" })
    .default(0),
  buying_price: z.coerce
    .number({
      invalid_type_error: "package.buying_price.errors.invalid",
    })
    .min(0, { message: "package.buying_price.errors.min" })
    .default(0),
  is_reseller_package: z.coerce.number().default(0),
  note: z.string().nullable().optional().default(""),
});

export type PackageFormInput = z.input<typeof PackageFormSchema>;
export type PackagePayload = z.output<typeof PackageFormSchema>;
