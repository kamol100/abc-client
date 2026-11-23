export interface PaymentFundStaff {
    fund?: {
        id?: unknown;
        name?: unknown;
    } | null;
}

export interface PaymentFundAccess {
    canChooseFund: boolean;
    assignedFundId: number | null;
    lockFund: boolean;
    blockSubmit: boolean;
    showUnassignedWarning: boolean;
}

/** Funds this user may record an invoice payment in (the API applies the same rules). */
export const INVOICE_PAYMENT_FUNDS_API = "/dropdown-funds?scope=invoice-payment";

export function resolveAssignedFundId(fund: PaymentFundStaff["fund"]): number | null {
    if (fund == null || fund.id == null || fund.id === "" || typeof fund.id === "boolean") {
        return null;
    }

    const id = typeof fund.id === "number" ? fund.id : Number(fund.id);
    if (!Number.isInteger(id) || id < 1) return null;
    return id;
}

/**
 * Invoice payments, permission based only (roles do not widen it):
 * - invoices.change-fund: any fund;
 * - invoices.bkash-fund-access: own fund or the bKash fund;
 * - neither: locked to the fund on their staff record.
 */
export function paymentFundAccess(input: {
    staff: PaymentFundStaff | null | undefined;
    canChangeFund?: boolean;
    canUseBkashFund?: boolean;
}): PaymentFundAccess {
    const canChooseFund = input.canChangeFund === true || input.canUseBkashFund === true;
    const fundFieldKnown = input.staff == null || Object.hasOwn(input.staff, "fund");
    const assignedFundId = fundFieldKnown
        ? resolveAssignedFundId(input.staff?.fund)
        : null;

    if (input.canChangeFund !== true && !fundFieldKnown) {
        return {
            canChooseFund: false,
            assignedFundId: null,
            lockFund: true,
            blockSubmit: true,
            showUnassignedWarning: false,
        };
    }

    const missingFund = !canChooseFund && assignedFundId == null;

    return {
        canChooseFund,
        assignedFundId,
        lockFund: !canChooseFund,
        blockSubmit: missingFund,
        showUnassignedWarning: missingFund,
    };
}
