import { z } from "zod";
import {
    resolveAssignedFundId,
    type PaymentFundStaff,
} from "@/components/invoices/payment-fund-access";
import { ExpenseFormSchema } from "@/components/expenses/expense-type";

const FUND_ADMIN_ROLES = ["Admin", "Super Admin"] as const;
const NO_FUND_ACCESS = "expense.fund.errors.no_access";

export interface ExpenseFundAccess {
    canChooseFund: boolean;
    assignedFundId: number | null;
    assignedFundName: string;
    lockFund: boolean;
    blockSubmit: boolean;
    showUnassignedWarning: boolean;
}

const fundName = (staff: PaymentFundStaff | null | undefined): string => {
    const name = staff?.fund?.name;
    return typeof name === "string" ? name.trim() : "";
};

const isFundAdmin = (roles: unknown[] | null): boolean =>
    roles?.some((role: unknown) =>
        FUND_ADMIN_ROLES.some((adminRole) => adminRole === role),
    ) ?? false;

/**
 * Create: Admin and Super Admin, or anyone with expenses.fund.update, may
 * pick any fund. Other users stay on the fund assigned to their staff record.
 * Edit: expenses.edit is enough to change the fund.
 */
export function expenseFundAccess(input: {
    mode: "create" | "edit";
    roles: unknown;
    staff: PaymentFundStaff | null | undefined;
    canUpdateFund: boolean;
    canEditExpense: boolean;
}): ExpenseFundAccess {
    const roles = Array.isArray(input.roles) ? input.roles : null;
    const admin = isFundAdmin(roles);
    const fundFieldKnown = input.staff == null || Object.hasOwn(input.staff, "fund");
    const assignedFundId = fundFieldKnown ? resolveAssignedFundId(input.staff?.fund) : null;
    const assignedFundName = fundFieldKnown ? fundName(input.staff) : "";

    if (input.mode === "edit") {
        if (!input.canEditExpense) {
            return {
                canChooseFund: false,
                assignedFundId: null,
                assignedFundName: "",
                lockFund: true,
                blockSubmit: true,
                showUnassignedWarning: false,
            };
        }

        return {
            canChooseFund: true,
            assignedFundId,
            assignedFundName,
            lockFund: false,
            blockSubmit: false,
            showUnassignedWarning: false,
        };
    }

    const waitingForProfile =
        roles == null || (!admin && input.staff != null && !fundFieldKnown);

    if (waitingForProfile) {
        return {
            canChooseFund: false,
            assignedFundId: null,
            assignedFundName: "",
            lockFund: true,
            blockSubmit: true,
            showUnassignedWarning: false,
        };
    }

    const canChooseFund = admin || input.canUpdateFund;
    const missingFund = !canChooseFund && assignedFundId == null;

    return {
        canChooseFund,
        assignedFundId,
        assignedFundName,
        lockFund: !canChooseFund,
        blockSubmit: missingFund,
        showUnassignedWarning: missingFund,
    };
}

export function expenseSubmitSchema(blockSubmit: boolean) {
    if (!blockSubmit) return ExpenseFormSchema;

    return ExpenseFormSchema.superRefine((_values, ctx) => {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: NO_FUND_ACCESS,
            path: ["_fund_access"],
        });
    });
}
