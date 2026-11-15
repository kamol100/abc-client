import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useDashboardData } from "@/components/dashboard/use-dashboard-data";

const session = vi.hoisted(() => ({
  hasStaff: true,
  thisMonthAmount: 6200,
}));

const requested = vi.hoisted(() => ({
  staffCollectionEnabled: undefined as boolean | undefined,
}));

vi.mock("@/context/app-provider", () => ({
  usePermissions: () => ({
    hasPermission: () => false,
  }),
  useProfile: () => ({
    profile: session.hasStaff ? { staff: { name: "vps" } } : {},
  }),
  useSettings: () => ({ settings: {} }),
}));

vi.mock("@/hooks/use-api-query", () => ({
  default: (options: { url: string; enabled?: boolean }) => {
    if (options.url === "dashboard-staff-invoice-collection") {
      requested.staffCollectionEnabled = options.enabled;
      if (!options.enabled) {
        return { data: undefined, isLoading: false, isFetching: false, isError: false };
      }
      return {
        data: {
          success: true,
          data: {
            staff_name: "vps",
            today_amount: 0,
            this_month_amount: session.thisMonthAmount,
            last_month_amount: 0,
          },
        },
        isLoading: false,
        isFetching: false,
        isError: false,
      };
    }

    return { data: undefined, isLoading: false, isFetching: false, isError: false };
  },
}));

describe("staff invoice collection visibility", () => {
  it("loads and shows the card for a staff collector without the invoice dashboard permission", () => {
    session.hasStaff = true;
    session.thisMonthAmount = 6200;

    const { result } = renderHook(() => useDashboardData());

    expect(requested.staffCollectionEnabled).toBe(true);
    expect(result.current.showStaffCollection).toBe(true);
    expect(result.current.staffName).toBe("vps");
    expect(result.current.staffCollection.this_month_amount).toBe(6200);
  });

  it("hides the card when every collection period is zero", () => {
    session.hasStaff = true;
    session.thisMonthAmount = 0;

    const { result } = renderHook(() => useDashboardData());

    expect(requested.staffCollectionEnabled).toBe(true);
    expect(result.current.showStaffCollection).toBe(false);
  });

  it("does not request collections for a user without a staff profile", () => {
    session.hasStaff = false;
    session.thisMonthAmount = 6200;

    const { result } = renderHook(() => useDashboardData());

    expect(requested.staffCollectionEnabled).toBe(false);
    expect(result.current.showStaffCollection).toBe(false);
  });
});
