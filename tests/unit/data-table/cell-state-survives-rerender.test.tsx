import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { DataTable } from "@/components/data-table/data-table";
import { TableLayoutProvider } from "@/context/table-layout-provider";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en" } }),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/cell-state-test",
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/components/ui/sidebar", () => ({
  useSidebar: () => ({ isMobile: false }),
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

type Row = { name: string };

/** Stands in for a row action that keeps a dialog's open state. */
function RowDialog() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Open</button>
      {open && <div role="dialog">Row dialog</div>}
    </>
  );
}

/** A list page that builds its columns on every render, as many pages do. */
function ListPage({ swapActions = false }: { swapActions?: boolean }) {
  const [tick, setTick] = useState(0);
  const columns: ColumnDef<Row>[] = [
    { accessorKey: "name", header: "Name", cell: ({ row }) => <span>{row.original.name}</span> },
    {
      id: "actions",
      header: "Actions",
      cell: swapActions && tick > 0 ? () => <span>No actions</span> : () => <RowDialog />,
    },
  ];

  return (
    <TableLayoutProvider>
      <button type="button" onClick={() => setTick((value) => value + 1)}>Re-render {tick}</button>
      <DataTable columns={columns} data={[{ name: "Ada" }]} toolbar={false} />
    </TableLayoutProvider>
  );
}

describe("DataTable cell state", () => {
  // পেজ নিজে থেকে আবার render হলেও (যেমন পেছনে ডেটা রিফ্রেশ) row-র খোলা modal বন্ধ না হয় কি না যাচাই করি।
  it("Row dialog open, page re-renders with new column objects: the dialog stays open", async () => {
    const user = userEvent.setup();
    render(<ListPage />);

    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByRole("dialog")).toBeVisible();

    await user.click(screen.getByRole("button", { name: /Re-render/ }));

    expect(screen.getByRole("button", { name: "Re-render 1" })).toBeVisible();
    expect(screen.getByRole("dialog")).toBeVisible();
  });

  // কলামের cell সত্যিই অন্য কিছুতে বদলে গেলে নতুন cell দেখায়, পুরনোটি থেকে যায় না, যাচাই করি।
  it("Column cell changes to a different renderer: shows the new cell", async () => {
    const user = userEvent.setup();
    render(<ListPage swapActions />);

    expect(screen.getByRole("button", { name: "Open" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: /Re-render/ }));

    expect(screen.getByText("No actions")).toBeVisible();
    expect(screen.queryByRole("button", { name: "Open" })).toBeNull();
  });
});
