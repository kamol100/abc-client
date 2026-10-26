import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PayInvoice from "@/components/pay/pay-invoice";
import type { ClientPaymentData } from "@/types/pay-types";

const startPayment = vi.hoisted(() => vi.fn());

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en" },
  }),
}));

vi.mock("@/components/display-count", () => ({
  default: ({ amount }: { amount: number }) => <span>{amount}</span>,
}));

vi.mock("@/components/bkash-payment/use-bkash-payment", async () => {
  const actual = await vi.importActual<typeof import("@/components/bkash-payment/use-bkash-payment")>(
    "@/components/bkash-payment/use-bkash-payment",
  );
  return {
    ...actual,
    useBkashPayment: () => ({ startPayment, isCreating: false }),
  };
});

const dueInvoice: ClientPaymentData = {
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

describe("PayInvoice return origin", () => {
  beforeEach(() => {
    startPayment.mockReset();
  });

  it("uses the current dashboard path when payment starts", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("location", { pathname: "/client/dashboard" });

    render(<PayInvoice data={dueInvoice} />);
    await user.click(screen.getByRole("button", { name: "pay.result.pay_bkash" }));

    expect(startPayment).toHaveBeenCalledWith(
      expect.objectContaining({ returnTarget: "client-dashboard" }),
    );
  });

  it("uses the invoice list when payment starts there", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("location", { pathname: "/client/invoices" });

    render(<PayInvoice data={dueInvoice} />);
    await user.click(screen.getByRole("button", { name: "pay.result.pay_bkash" }));

    expect(startPayment).toHaveBeenCalledWith(
      expect.objectContaining({ returnTarget: "client-invoices" }),
    );
  });

  it("keeps quick pay on /pay", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("location", { pathname: "/pay" });

    render(<PayInvoice data={dueInvoice} />);
    await user.click(screen.getByRole("button", { name: "pay.result.pay_bkash" }));

    expect(startPayment).toHaveBeenCalledWith(expect.objectContaining({ returnTarget: "pay" }));
  });
});
