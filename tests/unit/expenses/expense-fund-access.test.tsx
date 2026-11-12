import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
    expenseFundAccess,
    expenseSubmitSchema,
    type ExpenseFundAccess,
} from "@/components/expenses/expense-fund-access";
import ExpenseFormFieldSchema from "@/components/expenses/expense-form-schema";
import { applyFormFieldDefaults } from "@/components/form-wrapper/form-field-defaults";
import type { DropdownFieldConfig } from "@/components/form-wrapper/form-builder-type";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock("@/context/app-provider", () => ({
    usePermissions: () => ({
        hasPermission: (name: string) => name === "expenses.approval",
    }),
}));

const staffFund = { fund: { id: 4, name: "cash" } };

const fundField = (mode: "create" | "edit", fundAccess: ExpenseFundAccess) => {
    const { result } = renderHook(() => ExpenseFormFieldSchema({ mode, fundAccess }));
    const field = result.current.find((item) => item.name === "fund_id");
    if (field?.type !== "dropdown") throw new Error("fund field missing");
    return field;
};

describe("expenseFundAccess", () => {
    it("lets an admin choose any fund while creating, and defaults their own fund", () => {
        expect(expenseFundAccess({
            mode: "create",
            roles: ["Admin"],
            staff: staffFund,
            canUpdateFund: false,
            canEditExpense: false,
        })).toMatchObject({
            canChooseFund: true,
            assignedFundId: 4,
            assignedFundName: "cash",
            lockFund: false,
            blockSubmit: false,
            showUnassignedWarning: false,
        });

        expect(expenseFundAccess({
            mode: "create",
            roles: ["Super Admin"],
            staff: null,
            canUpdateFund: false,
            canEditExpense: false,
        })).toMatchObject({
            canChooseFund: true,
            assignedFundId: null,
            lockFund: false,
            blockSubmit: false,
            showUnassignedWarning: false,
        });
    });

    it("lets a staff member with expenses.fund.update choose any fund", () => {
        expect(expenseFundAccess({
            mode: "create",
            roles: ["Staff"],
            staff: { fund: null },
            canUpdateFund: true,
            canEditExpense: false,
        })).toMatchObject({
            canChooseFund: true,
            assignedFundId: null,
            lockFund: false,
            blockSubmit: false,
            showUnassignedWarning: false,
        });
    });

    it("locks a staff member to their own fund when they cannot update it", () => {
        expect(expenseFundAccess({
            mode: "create",
            roles: ["Staff"],
            staff: staffFund,
            canUpdateFund: false,
            canEditExpense: false,
        })).toEqual({
            canChooseFund: false,
            assignedFundId: 4,
            assignedFundName: "cash",
            lockFund: true,
            blockSubmit: false,
            showUnassignedWarning: false,
        });
    });

    it("blocks create when a staff member has no fund and cannot update it", () => {
        expect(expenseFundAccess({
            mode: "create",
            roles: ["Manager"],
            staff: { fund: null },
            canUpdateFund: false,
            canEditExpense: true,
        })).toMatchObject({
            assignedFundId: null,
            lockFund: true,
            blockSubmit: true,
            showUnassignedWarning: true,
        });
    });

    it("lets expenses.edit change the fund while editing, without expenses.fund.update", () => {
        expect(expenseFundAccess({
            mode: "edit",
            roles: ["Staff"],
            staff: staffFund,
            canUpdateFund: false,
            canEditExpense: true,
        })).toMatchObject({
            canChooseFund: true,
            lockFund: false,
            blockSubmit: false,
            showUnassignedWarning: false,
        });
    });

    it("blocks editing without expenses.edit", () => {
        expect(expenseFundAccess({
            mode: "edit",
            roles: ["Admin"],
            staff: staffFund,
            canUpdateFund: true,
            canEditExpense: false,
        })).toMatchObject({
            canChooseFund: false,
            lockFund: true,
            blockSubmit: true,
            showUnassignedWarning: false,
        });
    });

    it("does not warn while the profile is still incomplete", () => {
        expect(expenseFundAccess({
            mode: "create",
            roles: undefined,
            staff: staffFund,
            canUpdateFund: false,
            canEditExpense: false,
        })).toMatchObject({
            assignedFundId: null,
            blockSubmit: true,
            showUnassignedWarning: false,
        });
    });
});

describe("expense fund field", () => {
    it("selects and disables the assigned fund on create", () => {
        const access = expenseFundAccess({
            mode: "create",
            roles: ["Staff"],
            staff: staffFund,
            canUpdateFund: false,
            canEditExpense: false,
        });
        const field: DropdownFieldConfig = fundField("create", access);

        expect(field.isDisabled).toBe(true);
        expect(field.api).toBeUndefined();
        expect(field.defaultValue).toBe(4);
        expect(field.options).toEqual([{ value: 4, label: "cash" }]);
        expect(applyFormFieldDefaults({}, [field]).fund_id).toBe(4);
    });

    it("keeps the fund list open on edit and does not replace the saved fund", () => {
        const access = expenseFundAccess({
            mode: "edit",
            roles: ["Staff"],
            staff: staffFund,
            canUpdateFund: false,
            canEditExpense: true,
        });
        const field = fundField("edit", access);

        expect(field.isDisabled).toBe(false);
        expect(field.api).toBe("/dropdown-funds");
        expect(field.defaultValue).toBeUndefined();
        expect(applyFormFieldDefaults({ fund_id: 9 }, [field]).fund_id).toBe(9);
    });
});

describe("expenseSubmitSchema", () => {
    const payload = {
        amount: 25,
        staff_id: 3,
        expense_type_id: 2,
        fund_id: 4,
    };

    it("accepts a fund when the user is allowed to submit", () => {
        expect(expenseSubmitSchema(false).parse(payload)).toMatchObject({ fund_id: 4 });
    });

    it("rejects submission when the user has no fund access", () => {
        const parsed = expenseSubmitSchema(true).safeParse(payload);

        expect(parsed.success).toBe(false);
        if (!parsed.success) {
            expect(parsed.error.issues[0]?.message).toBe("expense.fund.errors.no_access");
        }
    });
});
