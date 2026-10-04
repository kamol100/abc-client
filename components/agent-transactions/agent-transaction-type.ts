import { z } from "zod";

export const AgentTransactionTypeValues = ["commission", "withdrawal"] as const;

export const AgentTransactionTypeSchema = z.enum(AgentTransactionTypeValues);

export const AgentRefSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    balance: z.coerce.number().default(0),
  })
  .passthrough();

export const AgentTransactionRowSchema = z
  .object({
    id: z.coerce.number(),
    amount: z.coerce.number().default(0),
    transaction_type: z.string(),
    description: z.string().nullable().optional(),
    created_at: z.string().nullable().optional(),
    agent: AgentRefSchema.nullable().optional(),
  })
  .passthrough();

export function createAgentTransactionFormSchema(getAvailableBalance: () => number) {
  return z
    .object({
      amount: z.coerce
        .number({
          required_error: "agent_transaction.amount.errors.required",
          invalid_type_error: "agent_transaction.amount.errors.required",
        })
        .gt(0, { message: "agent_transaction.amount.errors.min" }),
      description: z.preprocess(
        (value) => (value === "" || value === undefined ? null : value),
        z.string().max(255, { message: "agent_transaction.description.errors.max" }).nullable().optional()
      ),
      transaction_type: AgentTransactionTypeSchema.default("commission"),
    })
    .superRefine((values, ctx) => {
      if (
        values.transaction_type === "withdrawal" &&
        values.amount > getAvailableBalance()
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["amount"],
          message: "agent_transaction.amount.errors.exceeds_balance",
        });
      }
    });
}

export type AgentRef = z.infer<typeof AgentRefSchema>;
export type AgentTransactionRow = z.infer<typeof AgentTransactionRowSchema>;
export type AgentTransactionType = z.infer<typeof AgentTransactionTypeSchema>;
export type AgentTransactionFormInput = z.input<
  ReturnType<typeof createAgentTransactionFormSchema>
>;
export type AgentTransactionPayload = z.output<
  ReturnType<typeof createAgentTransactionFormSchema>
>;
