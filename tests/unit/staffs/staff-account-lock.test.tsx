import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StaffColumns } from "@/components/staffs/staff-column";

const permissions = vi.hoisted(() => ({
  allowed: new Set<string>(["staffs.edit"]),
}));

const mutation = vi.hoisted(() => ({
  mutate: vi.fn(),
  isPending: false,
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
}));

vi.mock("@/hooks/use-api-mutation", () => ({
  default: () => ({
    mutate: mutation.mutate,
    isPending: mutation.isPending,
  }),
}));

function renderActions(status: string) {
  const actions = StaffColumns.find((column) => column.id === "actions");
  if (!actions || typeof actions.cell !== "function") {
    throw new Error("Staff actions column is missing");
  }

  return render(
    actions.cell({
      row: { original: { id: "staff-1", name: "Ada", status } },
    } as never) as ReactElement
  );
}

describe("staff account lock action", () => {
  beforeEach(() => {
    permissions.allowed.clear();
    permissions.allowed.add("staffs.edit");
    mutation.mutate.mockReset();
    mutation.isPending = false;
  });

  it("shows an open lock for an active staff account", () => {
    const { container } = renderActions("active");

    expect(screen.getByRole("button", { name: "staff.lock_account" })).toBeInTheDocument();
    expect(container.querySelector(".lucide-lock-open")).toBeInTheDocument();
    expect(container.querySelector(".lucide-lock")).not.toBeInTheDocument();
  });

  it("shows a closed lock for an inactive staff account", () => {
    const { container } = renderActions("inactive");

    expect(screen.getByRole("button", { name: "staff.unlock_account" })).toBeInTheDocument();
    expect(container.querySelector(".lucide-lock")).toBeInTheDocument();
    expect(container.querySelector(".lucide-lock-open")).not.toBeInTheDocument();
  });

  it("places the lock action before the edit action", () => {
    const { container } = renderActions("active");
    const controls = container.querySelectorAll("a, button");

    expect(controls[0]).toHaveAttribute("aria-label", "staff.lock_account");
    expect(controls[1]).toHaveAttribute("href", "/staffs/edit/staff-1");
  });

  it("locks an active account when the open lock is clicked", async () => {
    const user = userEvent.setup();
    renderActions("active");

    await user.click(screen.getByRole("button", { name: "staff.lock_account" }));

    expect(mutation.mutate).toHaveBeenCalledWith({ status: "inactive" });
  });

  it("unlocks an inactive account when the closed lock is clicked", async () => {
    const user = userEvent.setup();
    renderActions("inactive");

    await user.click(screen.getByRole("button", { name: "staff.unlock_account" }));

    expect(mutation.mutate).toHaveBeenCalledWith({ status: "active" });
  });

  it("disables the action while the status update is in progress", () => {
    mutation.isPending = true;
    renderActions("active");

    expect(screen.getByRole("button", { name: "staff.lock_account" })).toBeDisabled();
  });

  it("hides the action when the user cannot edit staff", () => {
    permissions.allowed.clear();
    renderActions("active");

    expect(screen.queryByRole("button", { name: "staff.lock_account" })).not.toBeInTheDocument();
  });
});
