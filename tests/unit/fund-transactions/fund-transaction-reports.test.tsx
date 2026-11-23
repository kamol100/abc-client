import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import FundTransactionReports, {
  positiveTypeTotals,
} from "@/components/fund-transactions/fund-transaction-reports";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en" } }),
}));

describe("positiveTypeTotals", () => {
  it("keeps only types above zero, in type order", () => {
    expect(
      positiveTypeTotals({ salary: "40", deposit: 150.5, transfer: 0, withdraw: null, expense: "-3" }),
    ).toEqual([
      { type: "deposit", amount: 150.5 },
      { type: "salary", amount: 40 },
    ]);
  });

  it("returns nothing for missing totals", () => {
    expect(positiveTypeTotals(undefined)).toEqual([]);
  });
});

describe("FundTransactionReports", () => {
  it("shows a chip only for types with an amount", () => {
    render(<FundTransactionReports totals={{ deposit: 100, withdraw: 0, expense: 25 }} />);

    expect(screen.getByText("fund_transaction.transaction_type.options.deposit")).toBeInTheDocument();
    expect(screen.getByText("fund_transaction.transaction_type.options.expense")).toBeInTheDocument();
    expect(screen.queryByText("fund_transaction.transaction_type.options.withdraw")).not.toBeInTheDocument();
    expect(screen.queryByText("fund_transaction.transaction_type.options.transfer")).not.toBeInTheDocument();
  });

  it("renders nothing when every total is zero", () => {
    const { container } = render(<FundTransactionReports totals={{ deposit: 0 }} />);
    expect(container).toBeEmptyDOMElement();
  });
});
