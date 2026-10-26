import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ClientDashboardPaymentCard from "@/components/client-area/dashboard/ClientDashboardPaymentCard";
import { ClientDashboardPaymentSchema } from "@/components/client-area/dashboard/client-dashboard-type";
import type { ClientPaymentData } from "@/types/pay-types";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en" },
  }),
}));

vi.mock("@/components/pay/pay-invoice", () => ({
  default: ({ data }: { data: ClientPaymentData }) => (
    <div>payment-modal:{data.name}</div>
  ),
}));

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

describe("ClientDashboardPaymentCard", () => {
  it("shows the due amount and opens the bKash invoice modal", async () => {
    const user = userEvent.setup();
    render(
      <ClientDashboardPaymentCard
        data={duePayment}
        isLoading={false}
        isRefreshing={false}
        isError={false}
      />,
    );

    expect(screen.getByText("client_dashboard.payment.title")).toBeInTheDocument();
    expect(screen.getAllByText(/840\.00/).length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: "pay.result.pay_bkash" }));

    expect(screen.getByText("payment-modal:Kamol")).toBeInTheDocument();
    expect(screen.getByText("client_dashboard.payment.dialog_title")).toBeInTheDocument();
  });

  it("keeps bKash disabled when nothing is due", () => {
    render(
      <ClientDashboardPaymentCard
        data={{ ...duePayment, invoice: [], total_due: 0 }}
        isLoading={false}
        isRefreshing={false}
        isError={false}
      />,
    );

    expect(screen.getByText("client_dashboard.payment.no_due")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "pay.result.pay_bkash" })).toBeDisabled();
  });

  it("parses the invoice payment payload", () => {
    const parsed = ClientDashboardPaymentSchema.parse({
      id: "client-1",
      name: "Kamol",
      phone: 1677217129,
      status: "Active",
      package: { name: "Regular-840", price: "840" },
      invoice: [
        {
          id: "inv-1",
          invoice_id: 1001,
          month: "October",
          after_discount_amount: "840",
        },
      ],
      total_due: "840",
    });

    expect(parsed.phone).toBe("1677217129");
    expect(parsed.invoice[0]?.invoice_id).toBe("1001");
    expect(parsed.total_due).toBe("840");
    expect(parsed.package?.name).toBe("Regular-840");
  });
});
