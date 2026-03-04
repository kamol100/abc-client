import { z } from "zod";

export const ExpenseTypeRowSchema = z.object({
    id: z.coerce.number(),
    name: z.string(),
    description: z.string().nullable().optional(),
}).passthrough();

export type ExpenseTypeRow = z.infer<typeof ExpenseTypeRowSchema>;

export const ExpenseTypeFormSchema = z.object({
    name: z.string({
        required_error: "expense_type.name.errors.required",
        invalid_type_error: "expense_type.name.errors.invalid",
    }).min(2, { message: "expense_type.name.errors.min" }),
    description: z.string().nullable().optional().default(""),
});

export type ExpenseTypeFormInput = z.input<typeof ExpenseTypeFormSchema>;
export type ExpenseTypePayload = z.output<typeof ExpenseTypeFormSchema>;
