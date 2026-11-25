import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ColumnDef } from "@tanstack/react-table";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DataTable } from "@/components/data-table/data-table";
import type { DataTableToolbarConfig } from "@/components/data-table/toolbar/toolbar-config";
import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";
import { TableLayoutProvider } from "@/context/table-layout-provider";

let isMobile = false;

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en" } }),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/toolbar-test",
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

const columns: ColumnDef<{ name: string }>[] = [{ accessorKey: "name", header: "Name" }];
const filter: FieldConfig[] = [{ type: "text", name: "client", placeholder: "client.placeholder" }];

function renderTable(toolbar: boolean | DataTableToolbarConfig, setFilter = vi.fn()) {
  render(
    <TableLayoutProvider>
      <DataTable columns={columns} data={[{ name: "Ada" }]} setFilter={setFilter} toolbar={toolbar} />
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

function AddButton() {
  return <button type="button">Add</button>;
}

beforeEach(() => {
  isMobile = false;
});

describe("DataTable toolbar config", () => {
  it("renders page end items before the built-ins, in the fixed order", () => {
    renderTable({
      title: "Clients (3)",
      start: [{ key: "info", node: <span>Online 2</span> }],
      end: [{ key: "settings", node: <button type="button">Settings</button> }],
      page: null,
      features: { columns: true, filter: { filter }, add: AddButton },
    });

    expect(screen.getByText("Clients (3)")).toBeVisible();
    expect(screen.getByText("Online 2")).toBeVisible();
    expect(endLabels()).toEqual(["Settings", "common.view", "Switch to full layout", "common.filter", "Add"]);
  });

  it("switches built-ins off and accepts add as an element", () => {
    renderTable({ features: { columns: false, layoutToggle: false, add: <AddButton /> } });

    expect(endLabels()).toEqual(["Add"]);
  });

  it("shows only the layout toggle by default and nothing when the toolbar is off", () => {
    renderTable(true);
    expect(endLabels()).toEqual(["Switch to full layout"]);
  });

  it("renders no toolbar for toolbar={false}", () => {
    renderTable(false);
    expect(document.querySelector("[data-toolbar-layout]")).toBeNull();
  });

  it("skips hidden and empty items", () => {
    renderTable({
      end: [
        { key: "hidden", node: <button type="button">Hidden</button>, show: false },
        { key: "empty", node: null },
        { key: "shown", node: <button type="button">Shown</button> },
      ],
      features: { layoutToggle: false },
    });

    expect(endLabels()).toEqual(["Shown"]);
  });

  it("uses the centered layout only when center has items", () => {
    renderTable({ center: [{ key: "middle", node: <span>Middle</span> }] });

    expect(document.querySelector('[data-toolbar-layout="desktop-centered"]')).not.toBeNull();
    expect(screen.getByText("Middle").closest('[data-toolbar-slot="center"]')).not.toBeNull();
  });

  it("keeps the plain layout when center is empty", () => {
    renderTable({ center: [{ key: "empty", node: null }] });

    expect(document.querySelector('[data-toolbar-layout="desktop"]')).not.toBeNull();
  });

  it("applies mobile rules: title hidden, row items on their own row, hidden items dropped", () => {
    isMobile = true;
    renderTable({
      title: "Clients (3)",
      start: [
        { key: "activity", node: <span>Online 2</span>, mobile: "row" },
        { key: "desktop-only", node: <span>Desktop only</span>, mobile: "hidden" },
      ],
    });

    expect(screen.queryByText("Clients (3)")).toBeNull();
    expect(screen.queryByText("Desktop only")).toBeNull();
    expect(screen.getByText("Online 2").closest('[data-toolbar-row="activity"]')).not.toBeNull();
    expect(screen.getByTestId("page-size")).toBeInTheDocument();
  });

  it("puts mobile actions on their own row when asked", () => {
    isMobile = true;
    renderTable({ features: { add: AddButton }, mobileActions: "row" });

    const end = document.querySelector('[data-toolbar-slot="end"]');
    expect(end?.className).toContain("w-full");
  });

  it("clears an active filter when the desktop filter row is closed", async () => {
    const user = userEvent.setup();
    const { setFilter } = renderTable({ page: null, features: { filter: { filter } } });

    await user.click(screen.getByRole("button", { name: "common.filter" }));
    await user.type(screen.getByPlaceholderText("client.placeholder"), "ada");
    await user.click(screen.getByRole("button", { name: "common.search" }));
    expect(setFilter).toHaveBeenLastCalledWith("client=ada");

    const actions = document.querySelector("[data-filter-actions]");
    if (!(actions instanceof HTMLElement)) throw new Error("Missing filter actions");
    await user.click(within(actions).getByRole("button", { name: "common.filter" }));

    expect(setFilter).toHaveBeenLastCalledWith("");
    expect(document.querySelector('[data-toolbar-layout="desktop"]')).not.toBeNull();
  });
});
