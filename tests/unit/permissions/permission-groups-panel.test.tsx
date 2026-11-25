import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { KeyRound } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import PermissionGroupsPanel from "@/components/permissions/permission-groups-panel";
import { buildPermissionGroups } from "@/components/permissions/permission-groups";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options ? `${key}:${JSON.stringify(options)}` : key,
    i18n: { language: "en" },
  }),
}));

const groups = buildPermissionGroups(
  ["clients.access", "clients.create", "invoices.access", "invoices.delete", "sub-zones.access"].map((name) => ({ name })),
);

function renderPanel(overrides: Partial<Parameters<typeof PermissionGroupsPanel>[0]> = {}) {
  const props = {
    groups,
    selected: ["clients.access"],
    show: "all" as const,
    disabled: false,
    onTogglePermission: vi.fn(),
    onToggleGroup: vi.fn(),
    pins: [] as string[],
    canPin: true,
    pinDisabled: false,
    onTogglePin: vi.fn(),
    groupIcon: () => KeyRound,
    ...overrides,
  };
  render(<PermissionGroupsPanel {...props} />);
  return props;
}

function groupList(): HTMLElement {
  return screen.getByRole("navigation", { name: "permission.groups" });
}

function groupNames(): string[] {
  return within(groupList())
    .getAllByRole("listitem")
    .map((item) => item.querySelector("button span span")?.textContent ?? "");
}

describe("PermissionGroupsPanel", () => {
  it("lists pinned groups first and shows the first group's permissions", () => {
    renderPanel({ pins: ["sub-zones"] });

    expect(groupNames()).toEqual(["sub zones", "clients", "invoices"]);
    expect(screen.getByText("sub-zones.access")).toBeInTheDocument();
    expect(screen.queryByText("clients.create")).toBeNull();
  });

  it("filters the group list by the search box", async () => {
    const user = userEvent.setup();
    renderPanel();

    await user.type(screen.getByPlaceholderText("permission.search_groups"), "inv");

    expect(groupNames()).toEqual(["invoices"]);
    expect(screen.getByText("invoices.delete")).toBeInTheDocument();
  });

  it("opens a group and grants one permission or the whole group through the same callbacks", async () => {
    const user = userEvent.setup();
    const props = renderPanel();

    await user.click(within(groupList()).getByText("invoices"));
    await user.click(screen.getByRole("checkbox", { name: /invoices\.delete/ }));
    expect(props.onTogglePermission).toHaveBeenCalledWith("invoices.delete", true);

    await user.click(screen.getByRole("checkbox", { name: "invoices" }));
    expect(props.onToggleGroup).toHaveBeenCalledWith(
      [{ name: "invoices.access" }, { name: "invoices.delete" }],
      true,
    );
  });

  it("revokes a granted permission", async () => {
    const user = userEvent.setup();
    const props = renderPanel();

    await user.click(screen.getByRole("checkbox", { name: /clients\.access/ }));
    expect(props.onTogglePermission).toHaveBeenCalledWith("clients.access", false);
  });

  it("pins and unpins from the list", async () => {
    const user = userEvent.setup();
    const props = renderPanel({ pins: ["invoices"] });

    const [invoices, clients] = within(groupList()).getAllByRole("listitem");
    await user.click(within(invoices).getByRole("button", { name: "permission.pin.unpin" }));
    await user.click(within(clients).getByRole("button", { name: "permission.pin.pin" }));

    expect(props.onTogglePin).toHaveBeenNthCalledWith(1, "invoices");
    expect(props.onTogglePin).toHaveBeenNthCalledWith(2, "clients");
  });

  it("hides the pin button when pins cannot be saved", () => {
    renderPanel({ canPin: false });
    expect(screen.queryByRole("button", { name: "permission.pin.pin" })).toBeNull();
  });

  it("keeps permissions read-only while disabled", () => {
    renderPanel({ disabled: true });
    expect(screen.getByRole("checkbox", { name: /clients\.access/ })).toBeDisabled();
  });
});
