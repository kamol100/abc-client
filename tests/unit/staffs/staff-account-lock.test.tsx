import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StaffColumns } from "@/components/staffs/staff-column";

const permissions = vi.hoisted(() => ({
  allowed: new Set<string>(["staffs.edit"]),
}));

const mutation = vi.hoisted(() => ({
  mutate: vi.fn(),
  isPending: false,
  options: [] as Array<{ url?: string; method?: string }>,
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
  default: (options: { url?: string; method?: string }) => {
    mutation.options.push(options);
    return {
      mutate: mutation.mutate,
      isPending: mutation.isPending,
    };
  },
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

function renderActions(status: string, wrapper?: (node: ReactNode) => ReactNode) {
  const actions = StaffColumns.find((column) => column.id === "actions");
  if (!actions || typeof actions.cell !== "function") {
    throw new Error("Staff actions column is missing");
  }

  const cell = actions.cell({
    row: { original: { id: "staff-1", name: "Ada", status } },
  } as never) as ReactElement;

  return render(wrapper ? wrapper(cell) : cell);
}

describe("staff account lock action", () => {
  beforeEach(() => {
    permissions.allowed.clear();
    permissions.allowed.add("staffs.edit");
    mutation.mutate.mockReset();
    mutation.options.length = 0;
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

  it("places the lock action before the reset password and edit actions", () => {
    const { container } = renderActions("active");
    const controls = container.querySelectorAll("a, button");

    expect(controls[0]).toHaveAttribute("aria-label", "staff.lock_account");
    expect(controls[1]).toHaveAttribute("aria-label", "staff.reset_password.title");
    expect(controls[2]).toHaveAttribute("href", "/staffs/edit/staff-1");
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
    expect(screen.queryByRole("button", { name: "staff.reset_password.title" })).not.toBeInTheDocument();
  });
});

describe("staff reset password action", () => {
  beforeEach(() => {
    permissions.allowed.clear();
    permissions.allowed.add("staffs.reset-password");
    mutation.mutate.mockReset();
    mutation.options.length = 0;
    mutation.isPending = false;
  });

  it("opens a dialog with the staff name and a password field", async () => {
    const user = userEvent.setup();
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    renderActions("active", (node) => (
      <QueryClientProvider client={client}>{node}</QueryClientProvider>
    ));

    expect(screen.queryByRole("button", { name: "staff.lock_account" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "staff.reset_password.title" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Ada")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("staff.reset_password.password.placeholder")
    ).toBeInTheDocument();
  });

  it("submits the new password for that staff member", async () => {
    const user = userEvent.setup();
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    renderActions("active", (node) => (
      <QueryClientProvider client={client}>{node}</QueryClientProvider>
    ));

    await user.click(screen.getByRole("button", { name: "staff.reset_password.title" }));
    await user.type(
      screen.getByPlaceholderText("staff.reset_password.password.placeholder"),
      "new-secret-1"
    );
    await user.click(screen.getByRole("button", { name: "staff.reset_password.submit" }));

    expect(mutation.options).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: "/staffs/staff-1/password",
          method: "PUT",
        }),
      ])
    );
    expect(mutation.mutate).toHaveBeenCalledWith({ password: "new-secret-1" });
  });
});
