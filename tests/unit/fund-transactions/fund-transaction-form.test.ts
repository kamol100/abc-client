import { describe, expect, it } from "vitest";
import { fundTransactionAccess } from "@/components/fund-transactions/fund-transaction-access";
import { FundTransactionFormFieldSchema } from "@/components/fund-transactions/fund-transaction-form-schema";
import { FundTransactionFormSchema } from "@/components/fund-transactions/fund-transaction-type";

const assignedFund = {
  id: 4,
  uuid: "assigned-fund",
  name: "cash",
  balance: 300,
};

describe("fundTransactionAccess", () => {
  it("lets an admin choose a fund and keeps a preset without forcing their own account", () => {
    expect(
      fundTransactionAccess({
        roles: ["Admin"],
        staff: { fund: assignedFund },
        presetFund: { uuid: "counter", name: "counter", balance: 80 },
      }),
    ).toMatchObject({
      canChooseFund: true,
      lockFund: false,
      blockSubmit: false,
      showUnassignedWarning: false,
      fundUuid: "counter",
      fundName: "counter",
      fundBalance: 80,
      fundOption: null,
    });

    expect(
      fundTransactionAccess({
        roles: ["Admin"],
        staff: { fund: assignedFund },
      }),
    ).toMatchObject({
      canChooseFund: true,
      fundUuid: null,
      fundOption: null,
    });
  });

  it("lets a super admin choose a fund", () => {
    expect(
      fundTransactionAccess({
        roles: ["Super Admin"],
        staff: null,
      }),
    ).toMatchObject({
      canChooseFund: true,
      lockFund: false,
      blockSubmit: false,
    });
  });

  it("locks a non-admin to the fund on their profile", () => {
    const access = fundTransactionAccess({
      roles: ["Staff"],
      staff: { fund: assignedFund },
      presetFund: { uuid: "counter", name: "counter", balance: 80 },
    });

    expect(access).toMatchObject({
      canChooseFund: false,
      lockFund: true,
      blockSubmit: false,
      showUnassignedWarning: false,
      fundUuid: "assigned-fund",
      fundName: "cash",
      fundBalance: 300,
      fundOption: { value: "assigned-fund", label: "cash" },
    });
  });

  it("blocks a non-admin who has no fund account", () => {
    expect(
      fundTransactionAccess({
        roles: ["Manager"],
        staff: { fund: null },
      }),
    ).toMatchObject({
      fundUuid: null,
      fundOption: null,
      lockFund: true,
      blockSubmit: true,
      showUnassignedWarning: true,
    });
  });

  it("does not warn while the profile is still loading", () => {
    expect(
      fundTransactionAccess({
        roles: undefined,
        staff: { fund: assignedFund },
      }),
    ).toMatchObject({
      blockSubmit: true,
      showUnassignedWarning: false,
      fundUuid: null,
    });
  });
});

describe("FundTransactionFormFieldSchema", () => {
  it("asks for the sender fund first, then amount and note", () => {
    const fields = FundTransactionFormFieldSchema("receiver-fund");
    const sender = fields[0];

    expect(fields.map((field) => field.name)).toEqual(["transfer_by", "amount", "note"]);
    expect(fields.some((field) => field.name === "transaction_type")).toBe(false);
    expect(sender && "label" in sender ? sender.label?.labelText : "").toBe(
      "fund_transaction.transfer_by.label",
    );
    expect(sender && "api" in sender ? sender.api : "").toContain("filter=receiver-fund");
    expect(sender && "populate" in sender ? sender.populate : []).toEqual([
      { field: "sender_name", from: "name" },
      { field: "sender_balance", from: "balance" },
      { field: "sender_uuid", from: "uuid" },
    ]);
  });
});

describe("FundTransactionFormSchema", () => {
  it("defaults the transaction type to transfer", () => {
    const parsed = FundTransactionFormSchema.parse({
      amount: "25",
      transfer_by: 8,
      note: "",
    });

    expect(parsed.transaction_type).toBe("transfer");
    expect(parsed.amount).toBe(25);
    expect(parsed.note).toBeNull();
  });

  it("accepts only a transfer", () => {
    expect(FundTransactionFormSchema.safeParse({ amount: 10, transaction_type: "deposit", transfer_by: 1 }).success).toBe(
      false,
    );
    expect(FundTransactionFormSchema.safeParse({ amount: 10, transaction_type: "withdraw", transfer_by: 1 }).success).toBe(
      false,
    );
    expect(FundTransactionFormSchema.safeParse({ amount: 10, transaction_type: "expense", transfer_by: 1 }).success).toBe(
      false,
    );
  });

  it("requires a sender fund for a transfer", () => {
    const result = FundTransactionFormSchema.safeParse({
      amount: 10,
      transaction_type: "transfer",
    });

    expect(result.success).toBe(false);
  });
});
