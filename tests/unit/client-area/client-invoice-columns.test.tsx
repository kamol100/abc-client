import { render, renderHook, screen } from "@testing-library/react";
import { CellContext, ColumnDef } from "@tanstack/react-table";
import { ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import { describe, expect, it, vi } from "vitest";
import { useClientInvoiceColumns } from "@/components/client-area/invoices/client-invoice-columns";

vi.mock("@/components/client-area/invoices/client-invoice-row-actions", () => ({
  default: () => null,
}));
import { InvoiceRow } from "@/components/invoices/invoice-type";
import { createI18n } from "@/i18n";

function renderStatus(status: InvoiceRow["status"]) {
  const i18n = createI18n("en");
  const wrapper = ({ children }: { children: ReactNode }) => (
    <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
  );
  const { result } = renderHook(() => useClientInvoiceColumns(), { wrapper });
  const column = result.current.find(
    (item): item is ColumnDef<InvoiceRow> & { accessorKey: "status" } =>
      "accessorKey" in item && item.accessorKey === "status",
  );

  if (!column || typeof column.cell !== "function") {
    throw new Error("status cell missing");
  }

  const view = column.cell({
    row: { original: { status } },
  } as CellContext<InvoiceRow, unknown>);

  return render(wrapper({ children: view }));
}

describe("client invoice status column", () => {
  it.each([
    ["due", "Due"],
    ["paid", "Paid"],
    ["partial", "Partial"],
    ["partial_paid", "Partial"],
  ] as const)("shows %s as %s", (status, label) => {
    renderStatus(status);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
