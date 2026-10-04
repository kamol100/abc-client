import { describe, expect, it } from "vitest";
import { AgentTransactionFormFieldSchema } from "@/components/agent-transactions/agent-transaction-form-schema";
import { createAgentTransactionFormSchema } from "@/components/agent-transactions/agent-transaction-type";

describe("AgentTransactionFormFieldSchema", () => {
  it("includes type, amount, and description", () => {
    const names = AgentTransactionFormFieldSchema().map((field) => field.name);

    expect(names).toEqual(["transaction_type", "amount", "description"]);
  });
});

describe("createAgentTransactionFormSchema", () => {
  const schema = createAgentTransactionFormSchema(() => 20);

  it("accepts an add commission payload", () => {
    const parsed = schema.parse({
      amount: "12.5",
      description: "Manual",
      transaction_type: "commission",
    });

    expect(parsed).toMatchObject({
      amount: 12.5,
      description: "Manual",
      transaction_type: "commission",
    });
  });

  it("rejects a withdrawal above the available balance", () => {
    const result = schema.safeParse({
      amount: 20.01,
      transaction_type: "withdrawal",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "agent_transaction.amount.errors.exceeds_balance"
      );
    }
  });

  it("accepts a withdrawal equal to the available balance", () => {
    const parsed = schema.parse({
      amount: 20,
      transaction_type: "withdrawal",
      description: "",
    });

    expect(parsed.amount).toBe(20);
    expect(parsed.description).toBeNull();
  });

  it("rejects zero and negative amounts", () => {
    expect(schema.safeParse({ amount: 0, transaction_type: "commission" }).success).toBe(false);
    expect(schema.safeParse({ amount: -3, transaction_type: "commission" }).success).toBe(false);
  });
});
