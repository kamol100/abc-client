import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ColumnDef } from "@tanstack/react-table";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DataTable } from "@/components/data-table/data-table";
import type { DataTableToolbarConfig } from "@/components/data-table/toolbar/toolbar-config";
import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";
import { TableLayoutProvider } from "@/context/table-layout-provider";

let isMobile = false;
let companySettings: Record<string, unknown> = {};

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en" } }),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/toolbar-panel-test",
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/components/ui/sidebar", () => ({
  useSidebar: () => ({ isMobile }),
}));

vi.mock("@/components/change-pagination", () => ({
  default: () => <span data-testid="page-size" />,
}));

vi.mock("@/components/my-drawer", () => ({
  MyDrawer: ({ trigger }: { trigger: React.ReactNode }) => <>{trigger}</>,
}));

vi.mock("@/hooks/use-api-query", () => ({
  default: () => ({ data: undefined, isSuccess: false, isLoading: false, isFetching: false, isError: false }),
}));

vi.mock("@/context/app-provider", () => ({
  useOptionalSettings: () => companySettings,
  usePermissions: () => ({ hasPermission: () => true }),
}));

const columns: ColumnDef<{ name: string }>[] = [{ accessorKey: "name", header: "Name" }];
const filter: FieldConfig[] = [{ type: "text", name: "track_id", placeholder: "invoice.filter.track_id" }];

function renderTable(toolbar: DataTableToolbarConfig, setFilter = vi.fn()) {
  render(
    <TableLayoutProvider>
      <DataTable columns={columns} data={[{ name: "INV-1" }]} setFilter={setFilter} toolbar={toolbar} />
    </TableLayoutProvider>,
  );
  return { setFilter };
}

function endLabels(): string[] {
  const end = document.querySelector('[data-toolbar-slot="end"]');
  if (!(end instanceof HTMLElement)) throw new Error("Missing end slot");
  return within(end)
    .getAllByRole("button")
    .map((button) => button.getAttribute("aria-label") ?? button.textContent ?? "");
}

function panelState(): string | null {
  return document.querySelector("[data-toolbar-panel]")?.getAttribute("data-toolbar-panel") ?? null;
}

const invoices: DataTableToolbarConfig = {
  title: "Invoices (12)",
  page: "invoices",
  features: { filter: { filter } },
};

beforeEach(() => {
  isMobile = false;
  companySettings = {};
});

afterEach(() => {
  vi.useRealTimers();
});

describe("toolbar filter position", () => {
  it("adds the list page's ⚙ before the built-ins", () => {
    renderTable(invoices);

    expect(endLabels()).toEqual(["invoice.title_plural", "Switch to full layout", "common.filter"]);
  });

  it("opens inline (replacing the toolbar) when the page has no setting", async () => {
    const user = userEvent.setup();
    renderTable(invoices);

    await user.click(screen.getByRole("button", { name: "common.filter" }));

    expect(document.querySelector('[data-toolbar-layout="expanded"]')).not.toBeNull();
    expect(screen.queryByText("Invoices (12)")).toBeNull();
    expect(panelState()).toBeNull();
  });

  it("keeps the toolbar and opens the panel under it when the setting is 'below'", async () => {
    const user = userEvent.setup();
    companySettings = { filter_position_invoices: "below" };
    renderTable(invoices);

    expect(panelState()).toBe("closed");
    const toggle = screen.getByRole("button", { name: "common.filter" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await user.click(toggle);

    expect(panelState()).toBe("open");
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Invoices (12)")).toBeVisible();
    expect(document.querySelector('[data-toolbar-layout="expanded"]')).toBeNull();
    // Reset sits right before the filter toggle; the panel has no Search button.
    expect(endLabels()).toEqual(["invoice.title_plural", "Switch to full layout", "common.reset", "common.filter"]);
    expect(screen.queryByRole("button", { name: "common.search" })).toBeNull();
  });

  it("applies text as you type in the panel, and clears it when the panel closes", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    companySettings = { filter_position_invoices: "below" };
    const { setFilter } = renderTable(invoices);

    await user.click(screen.getByRole("button", { name: "common.filter" }));
    await user.type(screen.getByPlaceholderText("invoice.filter.track_id"), "INV-1");
    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    expect(setFilter).toHaveBeenLastCalledWith("track_id=INV-1");

    await user.click(screen.getByRole("button", { name: "common.filter" }));
    expect(panelState()).toBe("closed");
    expect(setFilter).toHaveBeenLastCalledWith("");
  });

  it("resets from the reset button without closing the panel", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    companySettings = { filter_position_invoices: "below" };
    const { setFilter } = renderTable(invoices);

    await user.click(screen.getByRole("button", { name: "common.filter" }));
    await user.type(screen.getByPlaceholderText("invoice.filter.track_id"), "INV-1");
    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    await user.click(screen.getByRole("button", { name: "common.reset" }));

    expect(setFilter).toHaveBeenLastCalledWith("");
    expect(panelState()).toBe("open");
  });

  it("ignores the setting for tables that are not a company list page", async () => {
    const user = userEvent.setup();
    companySettings = { filter_position_invoices: "below" };
    renderTable({ title: "Top dues", page: null, features: { filter: { filter } } });

    expect(endLabels()).toEqual(["Switch to full layout", "common.filter"]);
    await user.click(screen.getByRole("button", { name: "common.filter" }));
    expect(document.querySelector('[data-toolbar-layout="expanded"]')).not.toBeNull();
  });

  it("keeps the bottom sheet on phones whatever the setting", () => {
    isMobile = true;
    companySettings = { filter_position_invoices: "below" };
    renderTable(invoices);

    expect(panelState()).toBeNull();
    expect(document.querySelector('[data-toolbar-layout="mobile"]')).not.toBeNull();
  });
});
