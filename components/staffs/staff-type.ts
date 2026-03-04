import { z } from "zod";

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

const SalaryItemSchema = z.object({
  items_label: z.string().min(1, { message: "salary.items_label.errors.required" }),
  items_value: z.coerce.number().min(1, { message: "salary.items_value.errors.required" }),
});

const SalaryDeductionSchema = z.object({
  deductions_label: z.string().min(1, { message: "salary.items_label.errors.required" }),
  deductions_value: z.coerce.number().min(1, { message: "salary.items_value.errors.required" }),
});

export type SalaryItem = z.infer<typeof SalaryItemSchema>;
export type SalaryDeduction = z.infer<typeof SalaryDeductionSchema>;

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

export const StaffFormSchema = z.object({
  name: z.string({
    required_error: "staff.name.errors.required",
    invalid_type_error: "staff.name.errors.required",
  }).min(2, { message: "staff.name.errors.min" }),
  username: z.string().nullable().optional(),
  password: z.string().nullable().optional(),
  roles_id: z.array(z.coerce.number()).default([]),
  designation: z.string().nullable().optional().default(""),
  phone: z.string().min(11, {
    message: "staff.phone.errors.min",
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
  gender: z.string().min(1, { message: "staff.gender.errors.required" }),
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
