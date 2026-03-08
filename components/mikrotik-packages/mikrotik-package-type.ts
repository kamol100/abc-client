import { z } from "zod";

export const NetworkRefSchema = z
  .object({
    id: z.coerce.number(),
    name: z.string(),
  })
  .passthrough();

export const MikrotikPackageRowSchema = z
  .object({
    id: z.coerce.number(),
    network_id: z.coerce.number().nullable().optional(),
    name: z.string(),
    network: NetworkRefSchema.nullable().optional(),
  })
  .passthrough();

export type MikrotikPackageRow = z.infer<typeof MikrotikPackageRowSchema>;

export const MikrotikPackageFormSchema = z.object({
  network_id: z.coerce
    .number({
      required_error: "mikrotik_package.network.errors.required",
      invalid_type_error: "mikrotik_package.network.errors.required",
    })
    .min(1, { message: "mikrotik_package.network.errors.required" }),
  name: z
    .string({
      required_error: "mikrotik_package.name.errors.required",
      invalid_type_error: "mikrotik_package.name.errors.invalid",
    })
    .min(2, { message: "mikrotik_package.name.errors.min" }),
});

export type MikrotikPackageFormInput = z.input<typeof MikrotikPackageFormSchema>;
export type MikrotikPackagePayload = z.output<typeof MikrotikPackageFormSchema>;
