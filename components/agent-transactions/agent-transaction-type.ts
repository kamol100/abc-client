import { z } from "zod";

export const AgentTransactionRowSchema = z
  .object({
    id: z.coerce.number(),
    amount: z.coerce.number().default(0),
    transaction_type: z.string(),
    description: z.string().nullable().optional(),
    created_at: z.string().nullable().optional(),
  })
  .passthrough();

export type AgentTransactionRow = z.infer<typeof AgentTransactionRowSchema>;
