import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ExpenseFormFieldSchema from "@/components/expenses/expense-form-schema";
import { ExpenseFormSchema } from "@/components/expenses/expense-type";
import type { ExpenseFundAccess } from "@/components/expenses/expense-fund-access";

const permissions = vi.hoisted(() => ({ names: [] as string[] }));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock("@/context/app-provider", () => ({
    usePermissions: () => ({
        hasPermission: (name: string) => permissions.names.includes(name),
    }),
}));

const fundAccess: ExpenseFundAccess = {
    canChooseFund: true,
    assignedFundId: null,
    assignedFundName: "",
    lockFund: false,
    blockSubmit: false,
    showUnassignedWarning: false,
};

const field = (name: string) => {
    const { result } = renderHook(() => ExpenseFormFieldSchema({ mode: "create", fundAccess }));
    const found = result.current.find((item) => item.name === name);
    if (!found) throw new Error(`${name} field missing`);
    return found;
};

const validExpense = { amount: 100, fund_id: 3, expense_type_id: 2 };

describe("expense form fields", () => {
    beforeEach(() => {
        permissions.names = [];
    });

    // expenses.expense-by-update অনুমতি না থাকলে "Expense By" ফিল্ড লুকানো থাকে কি না যাচাই করি।
    it("Expense By field: hidden without the expenses.expense-by-update permission", () => {
        expect(field("staff_id").permission).toBe(false);
    });

    // expenses.expense-by-update অনুমতি থাকলে "Expense By" ড্রপডাউন দেখা যায় কি না যাচাই করি।
    it("Expense By field: shown as a staff dropdown with the expenses.expense-by-update permission", () => {
        permissions.names = ["expenses.expense-by-update"];

        const staff = field("staff_id");
        expect(staff.permission).toBe(true);
        expect(staff.type).toBe("dropdown");
    });

    // ফান্ড ফিল্ডের লেবেল "Fund" কী ব্যবহার করে এবং আবশ্যক চিহ্ন দেখায় কি না যাচাই করি।
    it("Fund field: uses the fund label and is marked mandatory", () => {
        expect(field("fund_id").label).toEqual({
            labelText: "expense.fund.label",
            mandatory: true,
        });
    });

    // ফান্ড ছাড়া ফর্ম জমা দিলে "ফান্ড আবশ্যক" ত্রুটি আসে কি না যাচাই করি (খালি ও null দুই ক্ষেত্রেই)।
    it.each([
        ["left out", undefined],
        ["cleared", null],
    ])("Expense form: refuses to submit when the fund is %s", (_label, fund) => {
        const result = ExpenseFormSchema.safeParse({ ...validExpense, fund_id: fund });

        expect(result.success).toBe(false);
        expect(result.error?.issues.map((issue) => [issue.path[0], issue.message])).toContainEqual([
            "fund_id",
            "expense.fund.errors.required",
        ]);
    });

    // "Expense By" ছাড়াই ফর্ম জমা হয় কি না যাচাই করি; তখন API লগইন করা স্টাফকে বসায়।
    it("Expense form: submits without Expense By, leaving the staff to the API", () => {
        const result = ExpenseFormSchema.safeParse(validExpense);

        expect(result.success).toBe(true);
        expect(result.data?.staff_id).toBeUndefined();
    });
});
