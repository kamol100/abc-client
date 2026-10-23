const FUND_ADMIN_ROLES = ["Admin", "Super Admin"] as const;

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

export function resolveAssignedFundId(
    fund: PaymentFundStaff["fund"],
): number | null {
    if (
        fund == null ||
        fund.id == null ||
        fund.id === "" ||
        typeof fund.id === "boolean"
    ) {
        return null;
    }

    const id = typeof fund.id === "number" ? fund.id : Number(fund.id);
    if (!Number.isInteger(id) || id < 1) return null;
    return id;
}

/**
 * Admin and Super Admin may choose any fund. Everyone else is limited to the
 * fund assigned to their staff record in the current user profile.
 */
export function paymentFundAccess(input: {
    roles: unknown;
    staff: PaymentFundStaff | null | undefined;
}): PaymentFundAccess {
    const roles = Array.isArray(input.roles) ? input.roles : null;
    const canChooseFund =
        roles?.some((role: unknown) =>
            FUND_ADMIN_ROLES.some((adminRole) => adminRole === role),
        ) ?? false;
    const fundFieldKnown = input.staff == null || Object.hasOwn(input.staff, "fund");
    const assignedFundId = fundFieldKnown
        ? resolveAssignedFundId(input.staff?.fund)
        : null;
    const waitingForProfile =
        roles == null || (!canChooseFund && input.staff != null && !fundFieldKnown);

    if (waitingForProfile) {
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
