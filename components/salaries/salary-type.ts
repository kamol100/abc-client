import { z } from "zod";
import i18n from "i18next";

// --- Ref schemas ---

const StaffRefSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
});

const FundRefSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
});

export type StaffRef = z.infer<typeof StaffRefSchema>;
export type FundRef = z.infer<typeof FundRefSchema>;

// --- Salary item sub-schemas ---

export const SalaryItemSchema = z.object({
  items_label: z.string().min(1, { message: i18n.t("item_label_required") }),
  items_value: z.coerce
    .number()
    .min(1, { message: i18n.t("item_value_required") }),
});

export const SalaryDeductionSchema = z.object({
  deductions_label: z
    .string()
    .min(1, { message: i18n.t("item_label_required") }),
  deductions_value: z.coerce
    .number()
    .min(1, { message: i18n.t("item_value_required") }),
});

export type SalaryItem = z.infer<typeof SalaryItemSchema>;
export type SalaryDeduction = z.infer<typeof SalaryDeductionSchema>;

// --- Row schema (API list/table response) ---

export const SalaryRowSchema = z
  .object({
    id: z.coerce.number(),
    staff_id: z.coerce.number(),
    staff: StaffRefSchema.nullable().optional(),
    date: z.string().nullable().optional(),
    amount: z.coerce.number(),
    salary_items: z.array(SalaryItemSchema).nullable().optional(),
    salary_deductions: z.array(SalaryDeductionSchema).nullable().optional(),
    salary_type: z.string(),
    fund_id: z.coerce.number().nullable().optional(),
    fund: FundRefSchema.nullable().optional(),
    note: z.string().nullable().optional(),
    status: z.string(),
  })
  .passthrough();

export type SalaryRow = z.infer<typeof SalaryRowSchema>;

// --- Form schema (validation for create/edit) ---

export const SalaryFormSchema = z.object({
  staff_id: z.coerce
    .number({
      required_error: i18n.t("staff_required"),
      invalid_type_error: i18n.t("staff_required"),
    })
    .min(1, { message: i18n.t("staff_required") }),
  date: z.coerce.string().nullable().optional(),
  amount: z.coerce
    .number({
      required_error: i18n.t("amount_required"),
      invalid_type_error: i18n.t("amount_required"),
    })
    .min(0),
  salary_items: z.array(SalaryItemSchema).optional().default([]),
  salary_deductions: z.array(SalaryDeductionSchema).optional().default([]),
  salary_type: z
    .string()
    .min(1, { message: i18n.t("salary_type_required") })
    .default("monthly"),
  fund_id: z.coerce
    .number({
      required_error: i18n.t("fund_required"),
      invalid_type_error: i18n.t("fund_required"),
    })
    .min(1, { message: i18n.t("fund_required") }),
  note: z.string().nullable().optional().default(""),
  status: z
    .string()
    .min(1, { message: i18n.t("status_required") })
    .default("pending"),
});

export type SalaryFormInput = z.input<typeof SalaryFormSchema>;
export type SalaryPayload = z.output<typeof SalaryFormSchema>;

// --- Salary structure response (from staff salary fetch) ---

export interface SalaryStructure {
  salary_items: SalaryItem[];
  salary_deductions: SalaryDeduction[];
  total_salary: number;
  advance: number;
}
