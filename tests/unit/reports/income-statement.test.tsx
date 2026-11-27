import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import IncomeExpenseTable from "@/components/reports/income-expense-table";
import { incomeStatementParams, parseIncomeStatement } from "@/components/reports/income-expense-type";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string, options?: { defaultValue?: string }) => options?.defaultValue ?? key,
        i18n: { language: "en" },
    }),
}));

vi.mock("@/components/form-wrapper/form-filter", () => ({
    default: () => null,
}));

const apiQuery = vi.fn();
vi.mock("@/hooks/use-api-query", () => ({
    default: (options: unknown) => apiQuery(options),
}));

type CheckName = "missing_fund_deposit" | "amount_mismatch" | "date_mismatch" | "expense_duplicates" | "expense_without_debit";

const statement = (checks: Partial<Record<CheckName, { count: number; amount: number }>> = {}, extra: Record<string, number> = {}) => ({
    period: { from: "2026-11-01", to: "2026-11-30" },
    income: {
        lines: [
            { key: "internet_bill", name: "Internet bill", amount: 1200, count: 2 },
            { key: "wallet_recharge", name: "Wallet recharge", amount: 800, count: 1 },
        ],
        total: 2000,
    },
    expenses: { lines: [{ key: "salary", name: "Salary", amount: 500, count: 1 }], total: 500 },
    net: 1500,
    paid_from_wallet: 300,
    checks: {
        fund_deposits: 2000,
        missing_fund_deposit: { count: 0, amount: 0 },
        amount_mismatch: { count: 0, amount: 0 },
        date_mismatch: { count: 0, amount: 0 },
        expense_duplicates: { count: 0, amount: 0 },
        expense_without_debit: { count: 0, amount: 0 },
        ...checks,
    },
    ...extra,
});

beforeEach(() => {
    apiQuery.mockReset();
});

describe("income statement helpers", () => {
    // ইনকাম স্টেটমেন্টের তারিখ ফিল্টার যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «sends the picked range as from and to»।
    it("Income statement period: send the picked range as from and to", () => {
        expect(incomeStatementParams("create_date=2026-11-01,2026-11-15")).toEqual({ from: "2026-11-01", to: "2026-11-15" });
        expect(incomeStatementParams("create_date=2026-11-01")).toEqual({ from: "2026-11-01", to: "2026-11-01" });
        expect(incomeStatementParams(null)).toBeUndefined();
        expect(incomeStatementParams("other=1")).toBeUndefined();
    });

    // ইনকাম স্টেটমেন্টের API উত্তর যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «reads the statement and refuses a broken one»।
    it("Income statement response: read the statement and refuse a broken one", () => {
        expect(parseIncomeStatement(statement())?.net).toBe(1500);
        expect(parseIncomeStatement({ income: {} })).toBeNull();
    });
});

describe("IncomeExpenseTable", () => {
    // ইনকাম স্টেটমেন্ট পেজ যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «asks one statement endpoint and shows the cash book match»।
    it("Income statement page: ask the statement endpoint once and show that it matches the cash book", () => {
        apiQuery.mockReturnValue({ data: { success: true, data: statement() }, isLoading: false, error: null });

        render(<IncomeExpenseTable />);

        expect(apiQuery).toHaveBeenCalledWith(expect.objectContaining({ url: "reports/income-statement" }));
        expect(screen.getByText("Internet bill")).toBeInTheDocument();
        expect(screen.getByText("Salary")).toBeInTheDocument();
        expect(screen.getByText("income_expense.checks.ok")).toBeInTheDocument();
        expect(screen.getByText("income_expense.checks.paid_from_wallet")).toBeInTheDocument();
    });

    // ইনকাম স্টেটমেন্ট পেজ যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «warns about payments without a fund deposit»।
    it("Income statement page: warn about payments that have no fund deposit", () => {
        apiQuery.mockReturnValue({
            data: { success: true, data: statement({ missing_fund_deposit: { count: 2, amount: 900 } }) },
            isLoading: false,
            error: null,
        });

        render(<IncomeExpenseTable />);

        expect(screen.getByText("income_expense.checks.missing_fund_deposit")).toBeInTheDocument();
        expect(screen.queryByText("income_expense.checks.ok")).not.toBeInTheDocument();
    });

    // ইনকাম স্টেটমেন্ট পেজ যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «warns about an expense taken from the fund more than once, and one never taken»।
    it("Income statement page: warn about an expense debited more than once and one never debited", () => {
        apiQuery.mockReturnValue({
            data: {
                success: true,
                data: statement({ expense_duplicates: { count: 1, amount: 300 }, expense_without_debit: { count: 2, amount: 1250 } }),
            },
            isLoading: false,
            error: null,
        });

        render(<IncomeExpenseTable />);

        expect(screen.getByText("income_expense.checks.expense_duplicates")).toBeInTheDocument();
        expect(screen.getByText("income_expense.checks.expense_without_debit")).toBeInTheDocument();
        expect(screen.queryByText("income_expense.checks.ok")).not.toBeInTheDocument();
    });

    // ইনকাম স্টেটমেন্ট পেজ যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «tells a reseller which income was settled from its wallet, with no warning»।
    it("Income statement page: tell a reseller what was settled from its wallet without a warning", () => {
        apiQuery.mockReturnValue({
            data: { success: true, data: statement({}, { settled_from_reseller_wallet: 700 }) },
            isLoading: false,
            error: null,
        });

        render(<IncomeExpenseTable />);

        expect(screen.getByText("income_expense.checks.settled_from_reseller_wallet")).toBeInTheDocument();
        expect(screen.getByText("income_expense.checks.ok")).toBeInTheDocument();
    });

    // পুরনো API উত্তর যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «reads a statement that has no expense checks yet»।
    it("Income statement response: read a statement from an API without the expense checks", () => {
        const old = statement();
        const { expense_duplicates: _a, expense_without_debit: _b, ...checks } = old.checks;

        expect(parseIncomeStatement({ ...old, checks })?.checks.expense_duplicates).toEqual({ count: 0, amount: 0 });
    });
});
