import { describe, expect, it } from "vitest";
import { getAgentTransactionColumns } from "@/components/agent-transactions/agent-transaction-column";

const columnIds = (showAgentColumn: boolean) =>
  getAgentTransactionColumns(() => undefined, showAgentColumn).map((column) =>
    "accessorKey" in column && column.accessorKey
      ? String(column.accessorKey)
      : column.id
  );

describe("getAgentTransactionColumns", () => {
  it("shows agent and balance on the company ledger", () => {
    expect(columnIds(true)).toEqual([
      "sl",
      "created_at",
      "agent.name",
      "transaction_type",
      "amount",
      "agent.balance",
      "description",
    ]);
  });

  it("hides agent columns on a single agent ledger", () => {
    expect(columnIds(false)).toEqual([
      "sl",
      "created_at",
      "transaction_type",
      "amount",
      "description",
    ]);
  });
});
