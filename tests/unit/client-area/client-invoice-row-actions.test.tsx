import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ClientInvoiceRowActions from "@/components/client-area/invoices/client-invoice-row-actions";
import type { InvoiceRow } from "@/components/invoices/invoice-type";
import type { ClientPaymentData } from "@/types/pay-types";

const duePayment: ClientPaymentData = {
  id: "client-1",
  name: "Kamol",
  phone: "01677217129",
  status: "Active",
  billing_terms: "prepaid",
  payment_terms: "1",
  package: {
    name: "Regular-840",
    bandwidth: null,
    mikrotik_profile: null,
    price: 840,
  },
  invoice: [
    {
      id: "inv-1",
      invoice_id: "INV-1",
      invoice_type: "Monthly",
      month: "October",
      due_date: "2026-11-01",
      after_discount_amount: 840,
      discount: 0,
      line_total_discount: 0,
    },
  ],
  total_due: 840,
  total_discount: 0,
};

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en" },
  }),
}));

vi.mock("@/hooks/use-api-query", () => ({
  default: () => ({
    data: { success: true, data: duePayment },
    isLoading: false,
    isFetching: false,
    isError: false,
  }),
}));

vi.mock("@/components/pay/pay-invoice", () => ({
  default: ({ data }: { data: ClientPaymentData }) => (
    <div>payment-modal:{data.name}</div>
  ),
}));

vi.mock("@/components/invoices/invoice-print-dialog", () => ({
  default: () => null,
}));

const dueInvoice = { status: "due" } as InvoiceRow;

describe("ClientInvoiceRowActions", () => {
  it("opens the same bKash invoice dialog", async () => {
    const user = userEvent.setup();
    render(<ClientInvoiceRowActions invoice={dueInvoice} />);

    await user.click(screen.getByRole("button", { name: "invoice.actions.pay" }));

    expect(screen.getByText("payment-modal:Kamol")).toBeInTheDocument();
    expect(screen.getByText("client_dashboard.payment.dialog_title")).toBeInTheDocument();
  });

  it("hides pay when the invoice is paid", () => {
    render(<ClientInvoiceRowActions invoice={{ status: "paid" } as InvoiceRow} />);

    expect(screen.queryByRole("button", { name: "invoice.actions.pay" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "invoice.actions.print" })).toBeInTheDocument();
  });
});
