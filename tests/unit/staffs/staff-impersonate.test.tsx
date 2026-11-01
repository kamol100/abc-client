import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StaffColumns } from "@/components/staffs/staff-column";
import type { StaffRow } from "@/components/staffs/staff-type";

const permissions = vi.hoisted(() => ({
  allowed: new Set<string>(["impersonate.staff"]),
}));

const impersonation = vi.hoisted(() => ({
  impersonate: vi.fn(async () => true),
  switching: false,
}));

const currentUser = vi.hoisted(() => ({
  id: "current-user",
  staffId: "current-staff",
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@/context/app-provider", () => ({
  usePermissions: () => ({
    hasPermission: (name: string) => permissions.allowed.has(name),
  }),
  useProfile: () => ({
    profile: { id: currentUser.id, staff: { id: currentUser.staffId } },
  }),
}));

vi.mock("@/hooks/use-start-impersonation", () => ({
  useStartImpersonation: () => impersonation,
}));

vi.mock("@/hooks/use-api-mutation", () => ({
  default: () => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

vi.mock("@/hooks/use-api-query", () => ({
  default: () => ({
    data: undefined,
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    setCurrentPage: vi.fn(),
  }),
}));

function renderActions(staff: Partial<Omit<StaffRow, "id">> & { id?: string | number } = {}) {
  const actions = StaffColumns.find((column) => column.id === "actions");
  if (!actions || typeof actions.cell !== "function") {
    throw new Error("Staff actions column is missing");
  }

  const cell = actions.cell({
    row: {
      original: {
        id: "staff-1",
        name: "Ada",
        status: "active",
        user: { uuid: "user-1" },
        ...staff,
      },
    },
  } as never) as ReactElement;

  return render(cell);
}

describe("staff impersonation action", () => {
  beforeEach(() => {
    permissions.allowed.clear();
    permissions.allowed.add("impersonate.staff");
    currentUser.id = "current-user";
    currentUser.staffId = "current-staff";
    impersonation.impersonate.mockReset();
    impersonation.impersonate.mockResolvedValue(true);
    impersonation.switching = false;
  });

  it("places the account switcher immediately before delete", () => {
    const { container } = renderActions();
    const controls = Array.from(container.querySelectorAll("button, a"));
    const switcher = container.querySelector(".lucide-arrow-left-right")?.closest("button");
    const trash = container.querySelector(".lucide-trash-2")?.closest("button");

    expect(switcher).toBeInstanceOf(HTMLButtonElement);
    expect(trash).toBeInstanceOf(HTMLButtonElement);
    expect(controls.indexOf(trash as HTMLButtonElement)).toBe(
      controls.indexOf(switcher as HTMLButtonElement) + 1,
    );
  });

  it("asks for confirmation and impersonates that staff record", async () => {
    const user = userEvent.setup();
    renderActions();

    await user.click(screen.getByRole("button", { name: "staff.impersonate.tooltip" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("staff.impersonate.confirm")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "staff.impersonate.confirm_action" }));

    expect(impersonation.impersonate).toHaveBeenCalledWith({ id: "staff-1" }, "staff");
  });

  it("hides the switcher on the signed-in staff member's own account", () => {
    const { unmount } = renderActions({ user: { uuid: "current-user" } });
    expect(screen.queryByRole("button", { name: "staff.impersonate.tooltip" })).not.toBeInTheDocument();
    unmount();

    renderActions({ id: "current-staff" });
    expect(screen.queryByRole("button", { name: "staff.impersonate.tooltip" })).not.toBeInTheDocument();
  });

  it("hides the switcher without the staff impersonation permission", () => {
    permissions.allowed.clear();
    renderActions();

    expect(screen.queryByRole("button", { name: "staff.impersonate.tooltip" })).not.toBeInTheDocument();
  });

  it("disables the switcher when the staff account cannot be impersonated", () => {
    const { unmount } = renderActions({ status: "inactive" });
    expect(screen.getByRole("button", { name: "staff.impersonate.tooltip" })).toBeDisabled();
    unmount();

    renderActions({ user: null });
    expect(screen.getByRole("button", { name: "staff.impersonate.tooltip" })).toBeDisabled();
  });

  it("does not send a second request while impersonation is in progress", async () => {
    impersonation.switching = true;
    const user = userEvent.setup();
    renderActions();

    expect(screen.getByRole("button", { name: "staff.impersonate.tooltip" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "staff.impersonate.tooltip" }));
    expect(impersonation.impersonate).not.toHaveBeenCalled();
  });
});
