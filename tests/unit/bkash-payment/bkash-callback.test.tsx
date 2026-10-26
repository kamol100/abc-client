import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import BkashCallbackPage from "@/app/(public)/pay/bkash-callback/page";
import { rememberBkashReturnTarget } from "@/components/bkash-payment/use-bkash-payment";

const { executePayment, searchParams, locationReplace, locationAssign } = vi.hoisted(() => ({
  executePayment: vi.fn(),
  searchParams: { value: new URLSearchParams() },
  locationReplace: vi.fn(),
  locationAssign: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => searchParams.value,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en" },
  }),
}));

vi.mock("@/components/bkash-payment/use-bkash-payment", async () => {
  const actual = await vi.importActual<typeof import("@/components/bkash-payment/use-bkash-payment")>(
    "@/components/bkash-payment/use-bkash-payment",
  );
  return {
    ...actual,
    executePayment: (...args: unknown[]) => executePayment(...args),
  };
});

describe("BkashCallbackPage", () => {
  beforeEach(() => {
    executePayment.mockReset();
    locationReplace.mockReset();
    locationAssign.mockReset();
    sessionStorage.clear();
    searchParams.value = new URLSearchParams();
    vi.stubGlobal("location", {
      replace: locationReplace,
      assign: locationAssign,
    });
  });

  it("returns a verified quick pay payment to /pay", async () => {
    searchParams.value = new URLSearchParams({
      paymentID: "pay-quick",
      status: "success",
      pid: "client-1",
      return: "pay",
    });
    executePayment.mockResolvedValue({ success: true, message: "OK" });

    render(<BkashCallbackPage />);

    await waitFor(() => {
      expect(locationReplace).toHaveBeenCalledWith("/pay?payment=success");
    });
    expect(executePayment).toHaveBeenCalledWith("pay-quick", "client-1");
  });

  it("returns a verified dashboard payment to the dashboard", async () => {
    searchParams.value = new URLSearchParams({
      paymentID: "pay-dashboard",
      status: "success",
      pid: "client-1",
      return: "client-dashboard",
    });
    executePayment.mockResolvedValue({ success: true, message: "OK" });

    render(<BkashCallbackPage />);
    render(<BkashCallbackPage />);

    await waitFor(() => {
      expect(locationReplace).toHaveBeenCalledWith("/client/dashboard?payment=success");
    });
    expect(executePayment).toHaveBeenCalledTimes(1);
  });

  it("uses the stored origin when bKash drops the return query", async () => {
    rememberBkashReturnTarget("client-invoices");
    searchParams.value = new URLSearchParams({
      paymentID: "pay-invoices",
      status: "success",
      pid: "client-1",
    });
    executePayment.mockResolvedValue({ success: true, message: "OK" });

    render(<BkashCallbackPage />);

    await waitFor(() => {
      expect(locationReplace).toHaveBeenCalledWith("/client/invoices?payment=success");
    });
  });

  it("ignores an external return url", async () => {
    searchParams.value = new URLSearchParams({
      paymentID: "pay-evil",
      status: "success",
      pid: "client-1",
      return: "https://evil.example/phish",
    });
    executePayment.mockResolvedValue({ success: true, message: "OK" });

    render(<BkashCallbackPage />);

    await waitFor(() => {
      expect(locationReplace).toHaveBeenCalledWith("/pay?payment=success");
    });
  });

  it("does not confirm a cancelled payment", async () => {
    const user = userEvent.setup();
    searchParams.value = new URLSearchParams({
      paymentID: "pay-cancel",
      status: "cancel",
      pid: "client-1",
      return: "client-dashboard",
    });

    render(<BkashCallbackPage />);

    expect(await screen.findByText("pay.bkash.cancelled_title")).toBeInTheDocument();
    expect(executePayment).not.toHaveBeenCalled();
    expect(locationReplace).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "pay.bkash.back_to_dashboard" }));
    expect(locationAssign).toHaveBeenCalledWith("/client/dashboard");
  });

  it("does not confirm a failed or unverified payment", async () => {
    const user = userEvent.setup();
    searchParams.value = new URLSearchParams({
      paymentID: "pay-failed",
      status: "success",
      pid: "client-1",
      return: "client-invoices",
    });
    executePayment.mockResolvedValue({ success: false, message: "Payment failed!" });

    render(<BkashCallbackPage />);

    expect(await screen.findByText("Payment failed!")).toBeInTheDocument();
    expect(locationReplace).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "pay.bkash.back_to_invoices" }));
    expect(locationAssign).toHaveBeenCalledWith("/client/invoices");
  });

  it("does not execute when bKash reports failure", async () => {
    searchParams.value = new URLSearchParams({
      status: "failure",
      return: "pay",
    });

    render(<BkashCallbackPage />);

    expect(await screen.findByText("pay.bkash.failed_title")).toBeInTheDocument();
    expect(executePayment).not.toHaveBeenCalled();
    expect(locationReplace).not.toHaveBeenCalled();
  });
});
