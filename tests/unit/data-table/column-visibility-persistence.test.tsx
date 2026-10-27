import { act, render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ColumnDef } from "@tanstack/react-table";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DataTable } from "@/components/data-table/data-table";
import {
  columnVisibilityStorageKey,
  writeStoredColumnVisibility,
} from "@/components/data-table/column-visibility";
import { usePersistedColumnVisibility } from "@/components/data-table/use-persisted-column-visibility";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/clients",
}));

vi.mock("@/components/change-pagination", () => ({
  default: () => null,
}));

vi.mock("@/app/actions", () => ({
  useFetch: vi.fn(),
}));

vi.mock("@/auth/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/components/ui/sidebar", () => ({
  useSidebar: () => ({ isMobile: false }),
}));

vi.mock("@/context/table-layout-provider", () => ({
  useTableLayoutMode: () => ({
    mode: "fixed",
    setMode: vi.fn(),
    toggleMode: vi.fn(),
    isFixed: true,
  }),
}));

interface Row {
  name: string;
  email: string;
}

const columns: ColumnDef<Row>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { id: "actions", header: "Actions", cell: () => "Open", enableHiding: false },
];

const rows: Row[] = [{ name: "Ada", email: "ada@example.com" }];

const clientsKey = columnVisibilityStorageKey("/clients", "clients");

function renderClientsTable(toggleColumns = true) {
  return render(
    <DataTable
      columns={columns}
      data={rows}
      queryKey="clients"
      toggleColumns={toggleColumns}
      toolbar={toggleColumns}
    />,
  );
}

describe("persisted column visibility", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("restores a hidden column after refresh and keeps another page unchanged", () => {
    writeStoredColumnVisibility(clientsKey, { email: false });
    writeStoredColumnVisibility(columnVisibilityStorageKey("/invoices", "invoices"), {
      name: false,
    });

    const { unmount } = renderClientsTable();

    expect(screen.getByRole("columnheader", { name: "Name" })).toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "Email" })).not.toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Actions" })).toBeInTheDocument();

    unmount();
    renderClientsTable();

    expect(screen.queryByRole("columnheader", { name: "Email" })).not.toBeInTheDocument();
    expect(localStorage.getItem(columnVisibilityStorageKey("/invoices", "invoices"))).toContain(
      '"name":false',
    );
  });

  it("saves a column when it is shown again", async () => {
    const user = userEvent.setup();
    writeStoredColumnVisibility(clientsKey, { email: false });
    renderClientsTable();

    await user.click(screen.getByRole("button", { name: "common.view" }));
    await user.click(screen.getByRole("menuitemcheckbox", { name: "common.email" }));

    expect(screen.getByRole("columnheader", { name: "Email" })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(clientsKey) ?? "{}")).toMatchObject({ email: true });
  });

  it("ignores stored visibility when the column toggle is off", () => {
    writeStoredColumnVisibility(clientsKey, { email: false });
    renderClientsTable(false);

    expect(screen.getByRole("columnheader", { name: "Email" })).toBeInTheDocument();
    expect(localStorage.getItem(clientsKey)).toContain('"email":false');
  });

  it("falls back to the default visibility for corrupt or outdated storage", () => {
    const { result, unmount } = renderHook(() =>
      usePersistedColumnVisibility({
        enabled: true,
        pathname: "/clients",
        queryKey: "clients",
        columns,
        initialColumnVisibility: { email: false },
      }),
    );

    expect(result.current.columnVisibility).toEqual({ email: false });
    expect(result.current.hasResolvedVisibility).toBe(true);

    act(() => {
      result.current.onColumnVisibilityChange({ email: true });
    });
    unmount();

    const restored = renderHook(() =>
      usePersistedColumnVisibility({
        enabled: true,
        pathname: "/clients",
        queryKey: "clients",
        columns,
        initialColumnVisibility: { email: false },
      }),
    );

    expect(restored.result.current.columnVisibility.email).toBe(true);

    localStorage.setItem(clientsKey, "{");
    restored.unmount();

    const fallback = renderHook(() =>
      usePersistedColumnVisibility({
        enabled: true,
        pathname: "/clients",
        queryKey: "clients",
        columns,
        initialColumnVisibility: { email: false },
      }),
    );

    expect(fallback.result.current.columnVisibility).toEqual({ email: false });
  });

  it("keeps two tables on different pages from sharing visibility", () => {
    const clients = renderHook(() =>
      usePersistedColumnVisibility({
        enabled: true,
        pathname: "/clients",
        queryKey: "clients",
        columns,
      }),
    );
    const invoices = renderHook(() =>
      usePersistedColumnVisibility({
        enabled: true,
        pathname: "/invoices",
        queryKey: "invoices",
        columns,
      }),
    );

    act(() => {
      clients.result.current.onColumnVisibilityChange({ email: false });
    });

    expect(invoices.result.current.columnVisibility.email).toBeUndefined();
    expect(localStorage.getItem(columnVisibilityStorageKey("/invoices", "invoices"))).toBeNull();
  });
});
