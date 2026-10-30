import { z } from "zod";

const optionalText = z
  .union([z.string(), z.number(), z.null()])
  .optional()
  .transform((value) => {
    if (value === null || value === undefined) return null;
    const text = String(value).trim();
    return text === "" ? null : text;
  });

export const ClientAccountSchema = z.object({
  id: z.string(),
  customer_id: optionalText,
  name: optionalText,
  father_name: optionalText,
  occupation: optionalText,
  nid: optionalText,
  phone: optionalText,
  alternate_phone: optionalText,
  email: optionalText,
  photo: optionalText,
  current_address: optionalText,
  permanent_address: optionalText,
  latitude: optionalText,
  longitude: optionalText,
  upazila: optionalText,
  status: z
    .union([z.number(), z.string(), z.null()])
    .optional()
    .transform((value) => {
      if (value === null || value === undefined || value === "") return null;
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    }),
  type: optionalText,
  connection_type: optionalText,
  connection_date: optionalText,
  termination_date: optionalText,
  billing_term: optionalText,
  billing_type: optionalText,
  payment_term: optionalText,
  username: optionalText,
  mac_address: optionalText,
  ip_address: optionalText,
  cable_type: optionalText,
  cable_length: optionalText,
  package: z
    .object({
      name: optionalText,
      bandwidth: optionalText,
    })
    .nullable()
    .optional()
    .transform((value) => value ?? null),
  zone: optionalText,
  sub_zone: optionalText,
});

export type ClientAccount = z.infer<typeof ClientAccountSchema>;

export function parseClientAccount(value: unknown): ClientAccount | null {
  const parsed = ClientAccountSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
