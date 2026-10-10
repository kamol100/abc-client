import { render, screen } from "@testing-library/react";
import type { CellContext, ColumnDef } from "@tanstack/react-table";
import { describe, expect, it, vi } from "vitest";
import { FeatureColumns } from "@/components/subscription/feature-column";
import type { FeatureRow } from "@/components/subscription/feature-type";

const allowed = vi.hoisted(() => ({ names: new Set<string>() }));

vi.mock("@/context/app-provider", () => ({
  usePermissions: () => ({
    hasPermission: (name: string) => allowed.names.has(name),
  }),
}));

vi.mock("@/components/subscription/feature-permission-editor", () => ({
  default: () => <button type="button">permissions</button>,
}));

vi.mock("@/components/subscription/feature-form", () => ({
  default: () => <button type="button">edit</button>,
}));

vi.mock("@/components/delete-modal", () => ({
  DeleteModal: () => <button type="button">delete</button>,
}));

const feature: FeatureRow = {
  id: "feature-1",
  key: "inventory",
  name: "Inventory",
  permissions_count: 3,
};

function renderActions() {
  const column = FeatureColumns.find((item) => item.id === "actions") as ColumnDef<FeatureRow> | undefined;

  if (!column?.cell || typeof column.cell !== "function") {
    throw new Error("Missing actions cell");
  }

  return render(<>{column.cell({ row: { original: feature } } as CellContext<FeatureRow, unknown>)}</>);
}

describe("FeatureColumns", () => {
  it("lists name, key, permission count, and actions", () => {
    const keys = FeatureColumns.map((column) => ("accessorKey" in column ? column.accessorKey : column.id));

    expect(keys).toEqual(["name", "key", "permissions_count", "actions"]);
  });

  it("hides feature actions without permission", () => {
    allowed.names = new Set();
    renderActions();

    expect(screen.queryByRole("button", { name: "permissions" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "edit" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "delete" })).not.toBeInTheDocument();
  });

  it("shows permission, edit, and delete actions when allowed", () => {
    allowed.names = new Set(["features.permissions", "features.edit", "features.delete"]);
    renderActions();

    expect(screen.getByRole("button", { name: "permissions" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "edit" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "delete" })).toBeInTheDocument();
  });
});
