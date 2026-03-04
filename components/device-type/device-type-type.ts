import { z } from "zod";

export const DeviceTypeRowSchema = z
  .object({
    id: z.coerce.number(),
    name: z.string(),
    note: z.string().nullable().optional(),
    deletable: z.number().optional(),
  })
  .passthrough();

export type DeviceTypeRow = z.infer<typeof DeviceTypeRowSchema>;

export const DeviceTypeFormSchema = z.object({
  name: z
    .string({
      required_error: "device_type.name.errors.required",
      invalid_type_error: "device_type.name.errors.invalid",
    })
    .min(2, { message: "device_type.name.errors.min" }),
  note: z.string().nullable().optional().default(""),
});

export type DeviceTypeFormInput = z.input<typeof DeviceTypeFormSchema>;
export type DeviceTypePayload = z.output<typeof DeviceTypeFormSchema>;
