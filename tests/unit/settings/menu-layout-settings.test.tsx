import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MenuLayoutSettingsPage } from "@/components/settings/menu-layout/menu-layout-settings";

const useFetch = vi.hoisted(() => vi.fn());
const app = vi.hoisted(() => ({
  permissions: new Set<string>(),
  settings: {} as Record<string, unknown>,
  updateSettings: vi.fn(),
}));

vi.mock("@/app/actions", () => ({ useFetch }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));
vi.mock("react-toastify", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: { name?: string }) => (options?.name ? `${key}:${options.name}` : key),
    i18n: { language: "en" },
  }),
}));
vi.mock("@/context/app-provider", () => ({
  usePermissions: () => ({ hasPermission: (name: string) => app.permissions.has(name) }),
  useProfile: () => ({ profile: {} }),
  useSubscription: () => ({ subscription: null }),
  useSetting: (key: string) => app.settings[key],
  useSettings: () => ({ settings: app.settings, updateSettings: app.updateSettings }),
}));

function renderPage() {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <MenuLayoutSettingsPage />
    </QueryClientProvider>,
  );
}

describe("MenuLayoutSettingsPage", () => {
  beforeEach(() => {
    useFetch.mockReset();
    app.updateSettings = vi.fn();
    app.permissions = new Set(["menu-layout.edit", "dashboard.access", "clients.access", "tickets.access"]);
    app.settings = {};
  });

  it("tells staff without menu-layout.edit that they cannot change the menu", () => {
    app.permissions = new Set(["clients.access"]);
    renderPage();

    expect(screen.getByText("menu_layout.no_access")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "menu_layout.actions.save" })).not.toBeInTheDocument();
  });

  it("changes an icon and saves the menu for everyone", async () => {
    const user = userEvent.setup();
    useFetch.mockResolvedValue({
      success: true,
      data: { layout: { items: [{ id: 2, icon: "contact", children: [] }] }, updated_at: "2026-11-24T21:42:00+06:00", updated_by: "vp", scope: "company" },
    });
    renderPage();

    expect(screen.getByText("menu_layout.status.default")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "menu_layout.actions.save" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "menu_layout.change_icon:menu.clients.title" }));
    await user.click(screen.getByRole("button", { name: /^contact$/ }));

    expect(screen.getByText("menu_layout.icon_changed")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "menu_layout.actions.save" }));

    await waitFor(() => expect(useFetch).toHaveBeenCalledTimes(1));
    const call = useFetch.mock.calls[0][0];
    expect(call.url).toBe("/menu-layout");
    expect(call.method).toBe("PUT");
    expect(call.data.items).toContainEqual({ id: 2, icon: "contact", children: [] });
    // Dashboard, Clients, Support Tickets, plus Subscription (always shown) and Settings (opened by menu-layout.edit).
    expect(call.data.items.map((item: { id: number }) => item.id)).toEqual([1, 2, 13, 36, 31]);
    await waitFor(() =>
      expect(app.updateSettings).toHaveBeenCalledWith({
        menu_layout: { items: [{ id: 2, icon: "contact", children: [] }], updated_at: "2026-11-24T21:42:00+06:00", updated_by: "vp" },
      }),
    );
  });

  it("resets a custom menu to the default after confirming", async () => {
    const user = userEvent.setup();
    app.settings = { menu_layout: { items: [{ id: 13, icon: "headset", children: [] }, { id: 1, icon: null, children: [] }], updated_by: "vp" } };
    useFetch.mockResolvedValue({ success: true, data: { layout: null, updated_at: null, updated_by: null, scope: "company" } });
    renderPage();

    expect(screen.getByText("menu_layout.status.custom")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "menu_layout.actions.reset" }));
    await user.click(screen.getByRole("button", { name: "menu_layout.reset_confirm.confirm" }));

    await waitFor(() => expect(useFetch).toHaveBeenCalledWith({ url: "/menu-layout", method: "DELETE" }));
    await waitFor(() => expect(app.updateSettings).toHaveBeenCalledWith({ menu_layout: null }));
  });
});
