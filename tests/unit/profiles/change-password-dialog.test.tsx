import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ChangePasswordDialog from "@/components/profiles/change-password-dialog";

const { updateProfile, useFetchMock } = vi.hoisted(() => ({
  updateProfile: vi.fn(),
  useFetchMock: vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en" },
  }),
}));

vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/app/actions", () => ({
  useFetch: useFetchMock,
}));

vi.mock("@/context/app-provider", () => ({
  useProfile: () => ({
    profile: { id: "1", name: "Kamol", status: 1, username: "kamol" },
    updateProfile,
  }),
}));

function renderDialog(open = true) {
  const onOpenChange = vi.fn();
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const view = render(
    <QueryClientProvider client={queryClient}>
      <ChangePasswordDialog open={open} onOpenChange={onOpenChange} variant="tenant" />
    </QueryClientProvider>
  );
  return { ...view, onOpenChange, queryClient };
}

describe("ChangePasswordDialog", () => {
  beforeEach(() => {
    updateProfile.mockClear();
    useFetchMock.mockReset();
  });

  it("opens on the reset password tab and keeps that tab after close and reopen", async () => {
    const user = userEvent.setup();
    const { rerender, queryClient } = renderDialog();

    expect(screen.getByRole("tab", { name: "user_profile.account_security.tabs.password" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByRole("tab", { name: "user_profile.account_security.tabs.username" })).toHaveAttribute(
      "aria-selected",
      "false"
    );
    expect(document.getElementById("current_password")).toBeVisible();
    const panels = screen.getAllByRole("tabpanel", { hidden: true });
    expect(panels[0]).not.toHaveAttribute("hidden");
    expect(panels[1]).toHaveAttribute("hidden");

    await user.click(screen.getByRole("tab", { name: "user_profile.account_security.tabs.username" }));
    expect(panels[0]).toHaveAttribute("hidden");
    expect(panels[1]).not.toHaveAttribute("hidden");
    expect(screen.getByDisplayValue("kamol")).toHaveAttribute("readonly");

    rerender(
      <QueryClientProvider client={queryClient}>
        <ChangePasswordDialog open={false} onOpenChange={vi.fn()} variant="tenant" />
      </QueryClientProvider>
    );
    rerender(
      <QueryClientProvider client={queryClient}>
        <ChangePasswordDialog open onOpenChange={vi.fn()} variant="tenant" />
      </QueryClientProvider>
    );

    expect(screen.getByRole("tab", { name: "user_profile.account_security.tabs.password" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    const reopened = screen.getAllByRole("tabpanel", { hidden: true });
    expect(reopened[0]).not.toHaveAttribute("hidden");
    expect(reopened[1]).toHaveAttribute("hidden");
  });

  it("requires a new username and does not submit the current username", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("tab", { name: "user_profile.account_security.tabs.username" }));
    const current = screen.getByDisplayValue("kamol");
    expect(current).toHaveAttribute("readonly");
    expect(current).toHaveValue("kamol");

    await user.click(screen.getByRole("button", { name: "common.save" }));

    expect(
      await screen.findByText("user_profile.account_security.change_username.username.errors.required")
    ).toBeInTheDocument();
    expect(useFetchMock).not.toHaveBeenCalled();
  });

  it("saves a new username and refreshes the profile", async () => {
    const user = userEvent.setup();
    useFetchMock.mockResolvedValue({
      success: true,
      data: { username: "kamol.new", message: "Username updated successfully" },
    });
    renderDialog();

    await user.click(screen.getByRole("tab", { name: "user_profile.account_security.tabs.username" }));
    await user.type(
      screen.getByPlaceholderText("user_profile.account_security.change_username.username.placeholder"),
      "kamol.new"
    );
    await user.click(screen.getByRole("button", { name: "common.save" }));

    expect(useFetchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/auth/change-username",
        method: "PUT",
        data: { username: "kamol.new" },
      })
    );
    expect(updateProfile).toHaveBeenCalledWith({ username: "kamol.new" });
  });

  it("shows a backend username validation error", async () => {
    const user = userEvent.setup();
    useFetchMock.mockResolvedValue({
      success: false,
      errors: { username: ["The username has already been taken."] },
    });
    renderDialog();

    await user.click(screen.getByRole("tab", { name: "user_profile.account_security.tabs.username" }));
    await user.type(
      screen.getByPlaceholderText("user_profile.account_security.change_username.username.placeholder"),
      "taken"
    );
    await user.click(screen.getByRole("button", { name: "common.save" }));

    expect(await screen.findByText("The username has already been taken.")).toBeInTheDocument();
    expect(updateProfile).not.toHaveBeenCalled();
  });
});
