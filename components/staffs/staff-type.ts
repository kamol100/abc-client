import { z } from "zod";
import i18n from "i18next";

// --- Ref schemas (nested/related objects) ---

const RoleRefSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
});

const UserRefSchema = z.object({
  uuid: z.string().optional(),
  username: z.string().optional(),
});

export type RoleRef = z.infer<typeof RoleRefSchema>;
export type UserRef = z.infer<typeof UserRefSchema>;

// --- Salary sub-schemas ---

const SalaryItemSchema = z.object({
  items_label: z.string().min(1, { message: i18n.t("item_label_required") }),
  items_value: z.coerce.number().min(1, { message: i18n.t("item_value_required") }),
});

const SalaryDeductionSchema = z.object({
  deductions_label: z.string().min(1, { message: i18n.t("item_label_required") }),
  deductions_value: z.coerce.number().min(1, { message: i18n.t("item_value_required") }),
});

export type SalaryItem = z.infer<typeof SalaryItemSchema>;
export type SalaryDeduction = z.infer<typeof SalaryDeductionSchema>;

// --- Row schema (API response for table/list) ---

export const StaffRowSchema = z.object({
  id: z.coerce.number(),
  staffId: z.string().nullable().optional(),
  name: z.string(),
  designation: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  date_of_birth: z.string().nullable().optional(),
  join_date: z.string().nullable().optional(),
  gender: z.string().nullable().optional(),
  marital_status: z.string().nullable().optional(),
  blood_group: z.string().nullable().optional(),
  nid: z.string().nullable().optional(),
  father_name: z.string().nullable().optional(),
  mother_name: z.string().nullable().optional(),
  present_address: z.string().nullable().optional(),
  permanent_address: z.string().nullable().optional(),
  job_experience: z.string().nullable().optional(),
  social_media_address: z.string().nullable().optional(),
  status: z.coerce.string().default("active"),
  salary_day: z.string().nullable().optional(),
  salary_generation_type: z.string().nullable().optional(),
  roles: z.array(RoleRefSchema).nullable().optional(),
  user: UserRefSchema.nullable().optional(),
  salary_items: z.array(SalaryItemSchema).nullable().optional(),
  salary_deductions: z.array(SalaryDeductionSchema).nullable().optional(),
}).passthrough();

export type StaffRow = z.infer<typeof StaffRowSchema>;

// --- Form schema (validation for create/edit) ---

export const StaffFormSchema = z.object({
  name: z
    .string({
      required_error: i18n.t("name_required"),
      invalid_type_error: i18n.t("name_required"),
    })
    .min(2, { message: i18n.t("name_must_have_at_least_two_character") }),
  username: z.string().nullable().optional(),
  password: z.string().nullable().optional(),
  roles_id: z.array(z.coerce.number()).default([]),
  designation: z.string().nullable().optional().default(""),
  phone: z.string().min(11, {
    message: i18n.t("phone_number_must_be_at_least_11_digits"),
  }),
  email: z.string().nullable().optional().default(""),
  date_of_birth: z.coerce.string().nullable().optional(),
  join_date: z.coerce.string().nullable().optional(),
  salary_day: z.string().default("07"),
  salary_generation_type: z.string().default("auto"),
  father_name: z.string().nullable().optional().default(""),
  mother_name: z.string().nullable().optional().default(""),
  nid: z.string().nullable().optional().default(""),
  marital_status: z.string().nullable().optional().default("unmarred"),
  gender: z.string().min(1, { message: i18n.t("gender_required") }),
  status: z.coerce.string().default("active"),
  present_address: z.string().nullable().optional().default(""),
  permanent_address: z.string().nullable().optional().default(""),
  job_experience: z.string().nullable().optional().default(""),
  social_media_address: z.string().nullable().optional().default(""),
  salary_items: z.array(SalaryItemSchema).nullable().optional(),
  salary_deductions: z.array(SalaryDeductionSchema).nullable().optional(),
});

export type StaffFormInput = z.input<typeof StaffFormSchema>;
export type StaffPayload = z.output<typeof StaffFormSchema>;
