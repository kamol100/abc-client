import { z } from "zod";

export const AgentRowSchema = z
    .object({
        id: z.string(),
        name: z.string(),
        phone: z.string().nullable().optional(),
        commission: z.coerce.number(),
        note: z.string().nullable().optional(),
        status: z.enum(["active", "inactive"]),
    })
    .passthrough();

export type AgentRow = z.infer<typeof AgentRowSchema>;

export const AgentFormSchema = z.object({
    name: z
        .string({
            required_error: "agent.name.errors.required",
            invalid_type_error: "agent.name.errors.invalid",
        })
        .min(2, { message: "agent.name.errors.min" })
        .max(255, { message: "agent.name.errors.max" }),
    phone: z
        .string({ invalid_type_error: "agent.phone.errors.invalid" })
        .max(255, { message: "agent.phone.errors.max" })
        .nullable()
        .optional(),
    commission: z.coerce
        .number({
            required_error: "agent.commission.errors.required",
            invalid_type_error: "agent.commission.errors.invalid",
        })
        .int({ message: "agent.commission.errors.integer" })
        .min(0, { message: "agent.commission.errors.min" }),
    note: z.string().nullable().optional(),
    status: z.enum(["active", "inactive"], {
        required_error: "agent.status.errors.required",
        invalid_type_error: "agent.status.errors.invalid",
    }).default("active"),
});

export type AgentFormInput = z.input<typeof AgentFormSchema>;
export type AgentPayload = z.output<typeof AgentFormSchema>;
