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
          toolbarOptions={{ filter, filter_row: 2 }}
          toolbarBeforeViewOptions={<button type="button">Import selected</button>}
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
});
