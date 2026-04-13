import { render, screen } from "@testing-library/react";

import { ZonesColumns } from "@/components/zones/zones-column";
import type { ZoneRow } from "@/components/zones/zone-type";

vi.mock("@/components/data-table/data-table-column-header", () => ({
  DataTableColumnHeader: ({ title }: { title: string }) => (
    <div data-testid={`header-${title}`}>{title}</div>
  ),
}));

vi.mock("@/components/zones/zone-form", () => ({
  default: ({
    mode,
    data,
    method,
  }: {
    mode: "create" | "edit";
    data?: { id: number };
    method?: "GET" | "POST" | "PUT";
  }) => (
    <div
      data-testid="mock-zone-form-action"
      data-mode={mode}
      data-zone-id={String(data?.id ?? "")}
      data-method={method ?? ""}
    />
  ),
}));

vi.mock("@/components/delete-modal", () => ({
  DeleteModal: ({
    api_url,
    keys,
    confirmMessage,
  }: {
    api_url: string;
    keys?: string;
    confirmMessage?: string;
  }) => (
    <div
      data-testid="mock-zone-delete-action"
      data-api-url={api_url}
      data-keys={keys ?? ""}
      data-confirm-message={confirmMessage ?? ""}
    />
  ),
}));

function renderCell(
  columnKey: "name" | "subZone" | "actions",
  zone: ZoneRow,
): void {
  const targetColumn = ZonesColumns.find((column) =>
    columnKey === "actions"
      ? column.id === "actions"
      : column.accessorKey === columnKey,
  );

  if (!targetColumn || typeof targetColumn.cell !== "function") {
    throw new Error(`Missing cell renderer for column ${columnKey}`);
  }

  const cellNode = targetColumn.cell({
    row: { original: zone } as { original: ZoneRow },
  } as Parameters<typeof targetColumn.cell>[0]);

  render(<>{cellNode}</>);
}

describe("ZonesColumns", () => {
  const sampleZone: ZoneRow = {
    id: 42,
    name: "North Zone",
    name_bn: "উত্তর",
    lat: 23.81,
    lon: 90.41,
    subZone: [
      { id: 1, name: "A" },
      { id: 2, name: "B" },
    ],
  };

  it("renders zone name", () => {
    renderCell("name", sampleZone);

    expect(screen.getByText("North Zone")).toBeInTheDocument();
  });

  it("renders comma-separated sub-zones", () => {
    renderCell("subZone", sampleZone);

    expect(screen.getByText("A, B")).toBeInTheDocument();
  });

  it("wires action renderers with expected zone props", () => {
    renderCell("actions", sampleZone);

    expect(screen.getByTestId("mock-zone-form-action")).toHaveAttribute(
      "data-mode",
      "edit",
    );
    expect(screen.getByTestId("mock-zone-form-action")).toHaveAttribute(
      "data-zone-id",
      "42",
    );
    expect(screen.getByTestId("mock-zone-form-action")).toHaveAttribute(
      "data-method",
      "PUT",
    );
    expect(screen.getByTestId("mock-zone-delete-action")).toHaveAttribute(
      "data-api-url",
      "/zones/42",
    );
    expect(screen.getByTestId("mock-zone-delete-action")).toHaveAttribute(
      "data-keys",
      "zones",
    );
    expect(screen.getByTestId("mock-zone-delete-action")).toHaveAttribute(
      "data-confirm-message",
      "zone.delete_confirmation",
    );
  });
});
