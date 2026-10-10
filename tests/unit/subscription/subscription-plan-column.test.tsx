import { render, screen } from "@testing-library/react";
import type { CellContext, ColumnDef } from "@tanstack/react-table";
import { describe, expect, it, vi } from "vitest";
import { SubscriptionPlanColumns } from "@/components/subscription/subscription-plan-column";
import type { SubscriptionPlanRow } from "@/components/subscription/subscription-plan-type";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@/context/app-provider", () => ({
  usePermissions: () => ({ hasPermission: () => false }),
}));

vi.mock("@/components/subscription/subscription-plan-form", () => ({
  default: () => null,
}));

vi.mock("@/components/subscription/plan-feature-matrix", () => ({
  default: () => null,
}));

vi.mock("@/components/delete-modal", () => ({
  DeleteModal: () => null,
}));

const plan: SubscriptionPlanRow = {
  id: "plan-1",
  name: "Growth",
  price: 1200,
  billing_interval: "month",
  min_clients: 10,
  max_clients: 500,
  is_active: true,
};

function renderCell(accessorKey: string, row: Partial<SubscriptionPlanRow>) {
  const column = SubscriptionPlanColumns.find(
    (item) => "accessorKey" in item && item.accessorKey === accessorKey,
  ) as ColumnDef<SubscriptionPlanRow> | undefined;

  if (!column?.cell || typeof column.cell !== "function") {
    throw new Error(`Missing cell for ${accessorKey}`);
  }

  return render(<>{column.cell({ row: { original: row } } as CellContext<SubscriptionPlanRow, unknown>)}</>);
}

describe("SubscriptionPlanColumns", () => {
  it("includes client limits and status", () => {
    const keys = SubscriptionPlanColumns.map((column) =>
      "accessorKey" in column ? column.accessorKey : column.id,
    );

    expect(keys).toEqual([
      "name",
      "price",
      "billing_interval",
      "min_clients",
      "max_clients",
      "is_active",
      "actions",
    ]);
  });

  it("shows client limits", () => {
    renderCell("min_clients", plan);
    renderCell("max_clients", plan);

    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("500")).toBeInTheDocument();
  });

  it("shows active and inactive status", () => {
    renderCell("is_active", plan);
    expect(screen.getByText("common.active")).toBeInTheDocument();

    renderCell("is_active", { ...plan, is_active: false });
    expect(screen.getByText("common.inactive")).toBeInTheDocument();
  });
});
