import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import FundTransactionReports, {
  positiveTypeTotals,
} from "@/components/fund-transactions/fund-transaction-reports";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en" } }),
}));

describe("positiveTypeTotals", () => {
  // ফান্ডের লেনদেন যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «keeps only types above zero, in type order»।
  it("Fund transaction reports: keeps only types above zero, in type order", () => {
    expect(
      positiveTypeTotals({ salary: "40", deposit: 150.5, transfer: 0, withdraw: null, expense: "-3" }),
    ).toEqual([
      { type: "deposit", amount: 150.5 },
      { type: "salary", amount: 40 },
    ]);
  });

  // ফান্ডের লেনদেন যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «returns nothing for missing totals»।
  it("Fund transaction reports: returns nothing for missing totals", () => {
    expect(positiveTypeTotals(undefined)).toEqual([]);
  });
});

describe("FundTransactionReports", () => {
  // ফান্ডের লেনদেন যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «shows a chip only for types with an amount»।
  it("Fund transaction reports: shows a chip only for types with an amount", () => {
    render(<FundTransactionReports totals={{ deposit: 100, withdraw: 0, expense: 25 }} />);

    expect(screen.getByText("fund_transaction.transaction_type.options.deposit")).toBeInTheDocument();
    expect(screen.getByText("fund_transaction.transaction_type.options.expense")).toBeInTheDocument();
    expect(screen.queryByText("fund_transaction.transaction_type.options.withdraw")).not.toBeInTheDocument();
    expect(screen.queryByText("fund_transaction.transaction_type.options.transfer")).not.toBeInTheDocument();
  });

  // ফান্ডের লেনদেন যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «renders nothing when every total is zero»।
  it("Fund transaction reports: renders nothing when every total is zero", () => {
    const { container } = render(<FundTransactionReports totals={{ deposit: 0 }} />);
    expect(container).toBeEmptyDOMElement();
  });
});
