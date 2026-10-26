import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import BkashPaymentResultNotice from "@/components/bkash-payment/bkash-payment-result-notice";

const { searchParams, replace } = vi.hoisted(() => ({
  searchParams: { value: new URLSearchParams() },
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => searchParams.value,
  usePathname: () => "/pay",
  useRouter: () => ({ replace }),
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

  it("hides when the dismiss icon is clicked", async () => {
    const user = userEvent.setup();
    searchParams.value = new URLSearchParams("payment=success");
    replace.mockClear();

    render(<BkashPaymentResultNotice />);
    await user.click(screen.getByRole("button", { name: "pay.bkash.dismiss" }));

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(replace).toHaveBeenCalledWith("/pay", { scroll: false });
  });

  it("hides automatically after 15 seconds", () => {
    vi.useFakeTimers();
    searchParams.value = new URLSearchParams("payment=success");
    replace.mockClear();

    try {
      render(<BkashPaymentResultNotice />);
      act(() => {
        vi.advanceTimersByTime(14_999);
      });
      expect(screen.getByRole("status")).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
      expect(replace).toHaveBeenCalledWith("/pay", { scroll: false });
    } finally {
      vi.useRealTimers();
    }
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
