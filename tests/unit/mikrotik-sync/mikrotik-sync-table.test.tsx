import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import type { DataTableToolbarConfig } from "@/components/data-table/toolbar/toolbar-config";
import MikrotikSyncTable from "@/components/mikrotik-sync/mikrotik-sync-table";

const selection = vi.hoisted(() => ({
  row: (_id: string, _selected: boolean) => {},
  page: (_ids: string[], _selected: boolean) => {},
}));

vi.mock("react-i18next", () => ({ useTranslation: () => ({
  t: (key: string, values?: { count?: number }) => values?.count === undefined ? key : `${key}:${values.count}`,
}) }));
vi.mock("@/app/actions", () => ({ useFetch: vi.fn() }));
vi.mock("@/context/app-provider", () => ({ usePermissions: () => ({ hasPermission: () => true }) }));
vi.mock("@/hooks/use-api-query", () => ({ default: () => ({
  data: { data: { data: [
    { id: "row-1", client_in_app: null, syncd_status: null },
    { id: "row-2", client_in_app: null, syncd_status: null },
  ], unimported_count: 80, pagination: { total: 50 } } },
  isLoading: false, isFetching: false, setCurrentPage: vi.fn(), refetch: vi.fn(),
}) }));
vi.mock("@/components/mikrotik-sync/mikrotik-sync-column", () => ({
  isImportable: () => true,
  useMikrotikSyncColumns: (props: { onSelectRow: typeof selection.row; onSelectAllCurrentPage: typeof selection.page }) => {
    selection.row = props.onSelectRow;
    selection.page = props.onSelectAllCurrentPage;
    return [];
  },
}));
vi.mock("@/components/mikrotik-sync/mikrotik-sync-form", () => ({ default: () => null }));
vi.mock("@/components/mikrotik-sync/mikrotik-sync-bulk-dialog", () => ({
  default: ({ trigger, importIds, unimportedCount }: { trigger: ReactNode; importIds: string[]; unimportedCount: number }) => (
    <div data-testid="bulk-dialog" data-import-ids={importIds.join(",")} data-unimported-count={unimportedCount}>{trigger}</div>
  ),
}));
vi.mock("@/components/my-button", () => ({
  default: ({ children, "aria-label": label }: { children: ReactNode; "aria-label"?: string }) => (
    <button aria-label={label}>{children}</button>
  ),
}));
vi.mock("@/components/data-table/data-table", () => ({
  DataTable: ({ toolbar, setFilter }: { toolbar: DataTableToolbarConfig; setFilter: (query: string) => void }) => (
    <div>
      <button onClick={() => selection.row("row-1", true)}>Select one row</button>
      <button onClick={() => selection.page(["row-1", "row-2"], true)}>Select this page</button>
      <button onClick={() => setFilter("any=another-client")}>Change filters</button>
      {toolbar.end?.map((item) => <div key={item.key}>{item.node}</div>)}
    </div>
  ),
}));

function renderTable() {
  return render(<QueryClientProvider client={new QueryClient()}><MikrotikSyncTable /></QueryClientProvider>);
}

describe("MikroTik import selection", () => {
  it("keeps selecting a page limited to its two UUIDs instead of the total across pages", async () => {
    renderTable();
    await userEvent.click(screen.getByRole("button", { name: "Select this page" }));
    expect(screen.getByTestId("bulk-dialog")).toHaveAttribute("data-import-ids", "row-1,row-2");
    expect(screen.getByTestId("bulk-dialog")).toHaveAttribute("data-unimported-count", "80");
    expect(screen.getByRole("button", { name: "mikrotik_sync.actions.import_selected:2" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "mikrotik_sync.actions.import_selected:50" })).not.toBeInTheDocument();
  });

  it("clears selected UUIDs when the filter changes", async () => {
    renderTable();
    await userEvent.click(screen.getByRole("button", { name: "Select one row" }));
    expect(screen.getByTestId("bulk-dialog")).toHaveAttribute("data-import-ids", "row-1");
    await userEvent.click(screen.getByRole("button", { name: "Change filters" }));
    expect(screen.queryByTestId("bulk-dialog")).not.toBeInTheDocument();
  });
});
