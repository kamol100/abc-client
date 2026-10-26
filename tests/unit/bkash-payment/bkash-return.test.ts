import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  bkashPaymentSuccessPath,
  bkashReturnTargetFromPath,
  buildBkashCallbackUrl,
  clearBkashReturnTarget,
  readBkashReturnTarget,
  rememberBkashReturnTarget,
  resolveBkashReturnTarget,
  useBkashPayment,
} from "@/components/bkash-payment/use-bkash-payment";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("bKash return target", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("maps payment pages to allowlisted destinations", () => {
    expect(bkashReturnTargetFromPath("/pay")).toBe("pay");
    expect(bkashReturnTargetFromPath("/pay/short-link")).toBe("pay");
    expect(bkashReturnTargetFromPath("/client/dashboard")).toBe("client-dashboard");
    expect(bkashReturnTargetFromPath("/client/dashboard/")).toBe("client-dashboard");
    expect(bkashReturnTargetFromPath("/client/invoices")).toBe("client-invoices");
    expect(bkashReturnTargetFromPath("/client/payments")).toBe("pay");
  });

  it("accepts only known return keys", () => {
    expect(resolveBkashReturnTarget("client-dashboard", null)).toBe("client-dashboard");
    expect(resolveBkashReturnTarget("client-invoices", "pay")).toBe("client-invoices");
    expect(resolveBkashReturnTarget(null, "client-invoices")).toBe("client-invoices");
    expect(resolveBkashReturnTarget("https://evil.example", "client-dashboard")).toBe(
      "client-dashboard",
    );
    expect(resolveBkashReturnTarget("/client/dashboard", null)).toBe("pay");
    expect(resolveBkashReturnTarget("//evil.example", null)).toBe("pay");
    expect(resolveBkashReturnTarget("javascript:alert(1)", null)).toBe("pay");
    expect(bkashPaymentSuccessPath("client-dashboard")).toBe("/client/dashboard?payment=success");
    expect(bkashPaymentSuccessPath("pay")).toBe("/pay?payment=success");
  });

  it("keeps the callback on this origin and puts the return key in the query", () => {
    expect(buildBkashCallbackUrl("https://isp.test", "client 1", "client-invoices")).toBe(
      "https://isp.test/pay/bkash-callback?pid=client+1&return=client-invoices",
    );
    expect(
      buildBkashCallbackUrl("https://isp.test", "client-1", "https://evil.example", "//evil.example"),
    ).toBe("https://isp.test/pay/bkash-callback?pid=client-1&return=pay");
  });

  it("remembers an allowlisted target until the callback clears it", () => {
    rememberBkashReturnTarget("client-dashboard");
    expect(readBkashReturnTarget()).toBe("client-dashboard");
    clearBkashReturnTarget();
    expect(readBkashReturnTarget()).toBeNull();
  });

  it("sends the dashboard return key when payment starts", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({ success: true, data: { bkashURL: "https://bkash.example/checkout" } }),
    });
    const locationStub = {
      hostname: "isp.test",
      origin: "https://isp.test",
      pathname: "/client/dashboard",
      href: "",
    };
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("location", locationStub);

    const { result } = renderHook(() => useBkashPayment());
    await act(async () => {
      await result.current.startPayment({
        clientId: "client-1",
        amount: 840,
        invoiceTrack: "INV-1",
        returnTarget: "client-dashboard",
      });
    });

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const body = JSON.parse(String(request.body)) as { callback: string };
    expect(body.callback).toBe(
      "https://isp.test/pay/bkash-callback?pid=client-1&return=client-dashboard",
    );
    expect(readBkashReturnTarget()).toBe("client-dashboard");
    expect(locationStub.href).toBe("https://bkash.example/checkout");
  });
});
