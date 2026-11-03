import { z } from "zod";

const mobileSearchMode = z.preprocess(
  (value) => (value === "default" ? "default" : "simple"),
  z.enum(["simple", "default"]),
);

const mobileSearchOpen = z.preprocess((value) => {
  if (value === true || value === 1 || value === "1" || value === "true") return true;
  return false;
}, z.boolean());

export const MobileSearchSettingSchema = z.object({
  mode: mobileSearchMode,
  always_open: mobileSearchOpen,
});

export type MobileSearchSetting = z.infer<typeof MobileSearchSettingSchema>;

export const UserAccountSettingsSchema = z.object({
  mobile_search: z.preprocess(
    (value) => (value && typeof value === "object" ? value : {}),
    MobileSearchSettingSchema,
  ),
});

export type UserAccountSettings = z.infer<typeof UserAccountSettingsSchema>;

const optionalText = z
  .union([z.string(), z.number(), z.null()])
  .optional()
  .transform((value) => {
    if (value === null || value === undefined) return null;
    const text = String(value).trim();
    return text === "" ? null : text;
  });

export const StaffAccountSchema = z.object({
  id: z.string(),
  staff_id: optionalText,
  name: optionalText,
  designation: optionalText,
  phone: optionalText,
  email: optionalText,
  gender: optionalText,
  marital_status: optionalText,
  blood_group: optionalText,
  date_of_birth: optionalText,
  join_date: optionalText,
  father_name: optionalText,
  mother_name: optionalText,
  present_address: optionalText,
  permanent_address: optionalText,
  job_experience: optionalText,
  social_media_address: optionalText,
  status: optionalText,
  photo: optionalText,
  username: optionalText,
  roles: z
    .array(z.string())
    .nullable()
    .optional()
    .transform((value) => (value ?? []).map((role) => role.trim()).filter((role) => role !== "")),
  settings: z.preprocess(
    (value) => (value && typeof value === "object" ? value : {}),
    UserAccountSettingsSchema,
  ),
});

export type StaffAccount = z.infer<typeof StaffAccountSchema>;

export function parseStaffAccount(value: unknown): StaffAccount | null {
  const parsed = StaffAccountSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
