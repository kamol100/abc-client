import {
  paymentFundAccess,
  resolveAssignedFundId,
  type PaymentFundAccess,
  type PaymentFundStaff,
} from "@/components/invoices/payment-fund-access";

/** This page still lets these roles choose any fund (invoice payments do not). */
const FUND_ADMIN_ROLES = ["Admin", "Super Admin"] as const;

function roleFundAccess(roles: unknown, staff: PaymentFundStaff | null | undefined): PaymentFundAccess {
  if (!Array.isArray(roles)) {
    return {
      canChooseFund: false,
      assignedFundId: null,
      lockFund: true,
      blockSubmit: true,
      showUnassignedWarning: false,
    };
  }

  const isAdmin = roles.some((role: unknown) => FUND_ADMIN_ROLES.some((admin) => admin === role));
  if (!isAdmin) return paymentFundAccess({ staff });

  const fundFieldKnown = staff == null || Object.hasOwn(staff, "fund");
  return {
    canChooseFund: true,
    assignedFundId: fundFieldKnown ? resolveAssignedFundId(staff?.fund) : null,
    lockFund: false,
    blockSubmit: false,
    showUnassignedWarning: false,
  };
}

export interface FundAccountRef {
  id?: unknown;
  uuid?: unknown;
  name?: unknown;
  balance?: number | string | null;
}

export interface FundTransactionAccess extends PaymentFundAccess {
  fundUuid: string | null;
  fundName: string;
  fundBalance: number | string | null;
  fundOption: { value: string; label: string } | null;
}

type FundStaff = PaymentFundStaff & {
  fund?: FundAccountRef | null;
};

const text = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

export const fundAccountUuid = (
  fund: FundAccountRef | null | undefined,
): string | null => {
  const uuid = text(fund?.uuid);
  return uuid === "" ? null : uuid;
};

const fundAccountName = (fund: FundAccountRef | null | undefined): string =>
  text(fund?.name);

const emptyFund = {
  fundUuid: null,
  fundName: "",
  fundBalance: null,
  fundOption: null,
} as const;

/**
 * Admin and Super Admin choose any fund. Other roles stay on the fund
 * already loaded with their user profile.
 */
export function fundTransactionAccess(input: {
  roles: unknown;
  staff: FundStaff | null | undefined;
  presetFund?: FundAccountRef | null;
}): FundTransactionAccess {
  const access = roleFundAccess(input.roles, input.staff);

  if (access.canChooseFund) {
    const preset = input.presetFund ?? null;
    const presetUuid = fundAccountUuid(preset);

    return {
      ...access,
      fundUuid: presetUuid,
      fundName: presetUuid ? fundAccountName(preset) : "",
      fundBalance: presetUuid ? (preset?.balance ?? null) : null,
      fundOption: null,
    };
  }

  const waiting = access.blockSubmit && !access.showUnassignedWarning;
  if (waiting) {
    return { ...access, ...emptyFund };
  }

  const assigned = input.staff?.fund ?? null;
  const assignedUuid = fundAccountUuid(assigned);
  if (assignedUuid == null) {
    return {
      ...access,
      ...emptyFund,
      blockSubmit: true,
      showUnassignedWarning: true,
    };
  }

  const fundName = fundAccountName(assigned);

  return {
    ...access,
    fundUuid: assignedUuid,
    fundName,
    fundBalance: assigned?.balance ?? null,
    fundOption: { value: assignedUuid, label: fundName || assignedUuid },
    blockSubmit: false,
    showUnassignedWarning: false,
  };
}
