import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import BkashPaymentResultNotice from "@/components/bkash-payment/bkash-payment-result-notice";

const searchParams = vi.hoisted(() => ({ value: new URLSearchParams() }));

vi.mock("next/navigation", () => ({
  useSearchParams: () => searchParams.value,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("BkashPaymentResultNotice", () => {
  it("shows one success message after a verified redirect", () => {
    searchParams.value = new URLSearchParams("payment=success");

    render(<BkashPaymentResultNotice />);

    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(screen.getByRole("status")).toHaveTextContent("pay.bkash.success");
  });

  it("stays hidden for failed, cancelled, and ordinary visits", () => {
    searchParams.value = new URLSearchParams("payment=failure");
    const { rerender, container } = render(<BkashPaymentResultNotice />);
    expect(container).toBeEmptyDOMElement();

    searchParams.value = new URLSearchParams("payment=cancel");
    rerender(<BkashPaymentResultNotice />);
    expect(container).toBeEmptyDOMElement();

    searchParams.value = new URLSearchParams();
    rerender(<BkashPaymentResultNotice />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
