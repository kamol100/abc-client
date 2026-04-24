import { z } from "zod";

const TEXT_MAX = 200;
const ADDRESS_MAX = 2000;
const PHONE_MIN = 8;

function isPhoneLike(value: string): boolean {
  const d = value.replace(/[\s-]/g, "");
  return d.length >= PHONE_MIN && /^\+?\d+$/.test(d);
}

/**
 * @param err - returns user-facing or translation key for error messages
 */
export function buildDemoRequestSchema(err: (key: string) => string) {
  return z
    .object({
      full_name: z
        .string()
        .trim()
        .min(1, err("demo_request.fields.full_name.errors.required"))
        .max(TEXT_MAX, err("demo_request.fields.full_name.errors.max")),
      isp_name: z
        .string()
        .trim()
        .min(1, err("demo_request.fields.isp_name.errors.required"))
        .max(TEXT_MAX, err("demo_request.fields.isp_name.errors.max")),
      email: z
        .string()
        .trim()
        .max(320, err("demo_request.fields.email.errors.max"))
        .optional(),
      website: z
        .string()
        .trim()
        .max(2000, err("demo_request.fields.website.errors.max"))
        .refine(
          (s) => s.length === 0 || z.string().url().safeParse(s).success,
          err("demo_request.fields.website.errors.invalid")
        ),
      phone: z
        .string()
        .trim()
        .min(1, err("demo_request.fields.phone.errors.required"))
        .refine(isPhoneLike, err("demo_request.fields.phone.errors.invalid")),
      user_count: z
        .string()
        .trim()
        .max(20, err("demo_request.fields.user_count.errors.max"))
        .refine(
          (s) => s.length === 0 || /^\d{1,12}$/.test(s),
          err("demo_request.fields.user_count.errors.invalid")
        ),
      whatsapp: z
        .string()
        .trim()
        .min(1, err("demo_request.fields.whatsapp.errors.required"))
        .refine(isPhoneLike, err("demo_request.fields.whatsapp.errors.invalid")),
      office_address: z
        .string()
        .trim()
        .max(ADDRESS_MAX, err("demo_request.fields.office_address.errors.max")),
      terms_accepted: z
        .boolean()
        .refine((v) => v === true, err("demo_request.fields.terms.errors.required")),
    })
    .strict();
}

export type DemoRequestFormValues = z.infer<ReturnType<typeof buildDemoRequestSchema>>;

export const demoRequestServerSchema = buildDemoRequestSchema(() => "Invalid");
