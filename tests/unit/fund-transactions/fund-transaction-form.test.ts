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
  it("orders transfer before amount and omits expense and salary", () => {
    const fields = FundTransactionFormFieldSchema("source-fund");
    const typeField = fields.find((field) => field.name === "transaction_type");

    expect(fields.map((field) => field.name)).toEqual([
      "transaction_type",
      "transfer_by",
      "amount",
      "note",
    ]);
    expect(typeField && "options" in typeField ? typeField.options?.map((option) => option.value) : []).toEqual([
      "deposit",
      "transfer",
      "withdraw",
    ]);
    expect(typeField && "defaultValue" in typeField ? typeField.defaultValue : null).toBe("transfer");
    expect(fields.find((field) => field.name === "transfer_by") && "api" in fields[1] ? fields[1].api : "").toContain(
      "filter=source-fund",
    );
  });

  it("hides the transaction type for non-admin users", () => {
    expect(
      FundTransactionFormFieldSchema("source-fund", { showTransactionType: false }).map((field) => field.name),
    ).toEqual(["transfer_by", "amount", "note"]);
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

  it("rejects expense and salary", () => {
    expect(FundTransactionFormSchema.safeParse({ amount: 10, transaction_type: "expense", transfer_by: 1 }).success).toBe(
      false,
    );
    expect(FundTransactionFormSchema.safeParse({ amount: 10, transaction_type: "salary", transfer_by: 1 }).success).toBe(
      false,
    );
  });

  it("requires a destination fund for a transfer", () => {
    const result = FundTransactionFormSchema.safeParse({
      amount: 10,
      transaction_type: "transfer",
    });

    expect(result.success).toBe(false);
  });
});
