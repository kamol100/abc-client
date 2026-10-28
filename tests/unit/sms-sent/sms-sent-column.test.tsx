import { render, screen } from "@testing-library/react";
import { CellContext, ColumnDef } from "@tanstack/react-table";
import { describe, expect, it, vi } from "vitest";
import { getSmsSentColumns } from "@/components/sms-sent/sms-sent-column";
import { SmsSentClientRow } from "@/components/sms-sent/sms-sent-type";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@/components/display-count", () => ({
  default: ({ amount }: { amount: number }) => <span>{amount}</span>,
}));

function renderPackageDue(client: SmsSentClientRow) {
  const columns = getSmsSentColumns(() => undefined, [], () => undefined, () => undefined, [client]);
  const column = columns.find((item) => item.id === "package_due") as ColumnDef<SmsSentClientRow> | undefined;
  if (!column || typeof column.cell !== "function") {
    throw new Error("package due column is missing");
  }

  return render(
    <>
      {column.cell({
        row: { original: client },
      } as CellContext<SmsSentClientRow, unknown>)}
    </>
  );
}

describe("sms sent package due column", () => {
  it("shows the summed due invoice total for the client", () => {
    renderPackageDue({
      name: "Kamal",
      package: { id: 1, name: "20 Mbps" },
      billing_term: "prepaid",
      payment_deadline: "10",
      invoiceDue: [
        { uuid: "inv-1", total_amount: 150, after_discount_amount: 150, discount: 0, line_total_discount: 0, amount_paid: 0 },
        { uuid: "inv-2", total_amount: 50, after_discount_amount: 50, discount: 0, line_total_discount: 0, amount_paid: 0 },
      ],
    });

    expect(screen.getByText("20 Mbps")).toBeInTheDocument();
    expect(screen.getByText(/client\.table\.total_due/)).toBeInTheDocument();
    expect(screen.getByText("200")).toBeInTheDocument();
    expect(screen.getByText("prepaid")).toBeInTheDocument();
    expect(screen.getByText("client.table.deadline: 10")).toBeInTheDocument();
  });

  it("shows zero due when the client has no open invoice", () => {
    renderPackageDue({
      name: "Kamal",
      package: { id: 1, name: "20 Mbps" },
      invoiceDue: [],
    });

    expect(screen.getByText("0")).toBeInTheDocument();
  });
});
