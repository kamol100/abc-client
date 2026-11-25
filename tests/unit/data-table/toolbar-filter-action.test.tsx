import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ColumnDef } from "@tanstack/react-table";
import { describe, expect, it, vi } from "vitest";
import { DataTable } from "@/components/data-table/data-table";
import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";
import { TableLayoutProvider } from "@/context/table-layout-provider";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en" },
  }),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/mikrotik-sync",
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/components/ui/sidebar", () => ({
  useSidebar: () => ({ isMobile: false }),
}));

vi.mock("@/components/change-pagination", () => ({
  default: () => null,
}));

vi.mock("@/components/my-drawer", () => ({
  MyDrawer: () => null,
}));

vi.mock("@/hooks/use-api-query", () => ({
  default: () => ({
    data: undefined,
    isSuccess: false,
    isLoading: false,
    isFetching: false,
    isError: false,
    setCurrentPage: vi.fn(),
  }),
}));

const columns: ColumnDef<{ name: string }>[] = [{ accessorKey: "name", header: "Name" }];

const filter: FieldConfig[] = [
  { type: "text", name: "any", placeholder: "any.placeholder" },
  { type: "text", name: "client", placeholder: "client.placeholder" },
];

function filterButton(): HTMLElement {
  const icon = document.querySelector(".lucide-funnel");
  const button = icon?.closest("button");
  if (!button) throw new Error("Missing filter button");
  return button;
}

describe("toolbar action while filtering", () => {
  it("keeps the selection action beside the open filter fields", async () => {
    const user = userEvent.setup();

    render(
      <TableLayoutProvider>
        <DataTable
          columns={columns}
          data={[{ name: "client" }]}
          setFilter={vi.fn()}
          toolbar={{
            end: [{ key: "import", node: <button type="button">Import selected</button> }],
            page: null,
            features: { filter: { filter, filter_row: 2 } },
          }}
        />
      </TableLayoutProvider>,
    );

    const importButton = screen.getByRole("button", { name: "Import selected" });
    expect(importButton).toBeVisible();
    expect(importButton.closest("[data-filter-actions]")).toBeNull();

    await user.click(filterButton());

    const visibleImport = screen.getByRole("button", { name: "Import selected" });
    expect(visibleImport).toBeVisible();
    expect(visibleImport.closest("[data-filter-actions]")).not.toBeNull();
    expect(visibleImport.closest("form")).toBeNull();
    expect(screen.getByPlaceholderText("any.placeholder")).toBeVisible();
    expect(screen.getByPlaceholderText("client.placeholder")).toBeVisible();
  });

  it("keeps the add slot after the filter button, open or closed", async () => {
    const user = userEvent.setup();
    const bulk = <button type="button">Bulk action</button>;

    render(
      <TableLayoutProvider>
        <DataTable
          columns={columns}
          data={[{ name: "client" }]}
          setFilter={vi.fn()}
          toolbar={{
            page: null,
            features: { filter: { filter, filter_row: 2 }, add: bulk },
          }}
        />
      </TableLayoutProvider>,
    );

    // Closed: the add slot, placed after the filter button.
    const closed = screen.getAllByRole("button", { name: "Bulk action" });
    expect(closed).toHaveLength(1);
    expect(filterButton().compareDocumentPosition(closed[0]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    await user.click(filterButton());

    // Open: the add slot moves into the filter row, still after the filter button.
    const open = screen.getAllByRole("button", { name: "Bulk action" });
    expect(open).toHaveLength(1);
    expect(open[0].closest("[data-filter-actions]")).not.toBeNull();
    expect(filterButton().compareDocumentPosition(open[0]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("hides a center item with inFilterRow false while the filter is open", async () => {
    const user = userEvent.setup();

    render(
      <TableLayoutProvider>
        <DataTable
          columns={columns}
          data={[{ name: "client" }]}
          setFilter={vi.fn()}
          toolbar={{
            center: [
              { key: "links", inFilterRow: false, node: <button type="button">Page link</button> },
              { key: "total", node: <span>Running total</span> },
            ],
            page: null,
            features: { filter: { filter, filter_row: 2 } },
          }}
        />
      </TableLayoutProvider>,
    );

    expect(screen.getByRole("button", { name: "Page link" })).toBeVisible();

    await user.click(filterButton());

    expect(screen.queryByRole("button", { name: "Page link" })).toBeNull();
    expect(screen.getByText("Running total")).toBeVisible();
  });
});
