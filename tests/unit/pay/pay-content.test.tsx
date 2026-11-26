import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PayContent from "@/components/pay/pay-content";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (value: string) => value,
    i18n: { language: "en" },
  }),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
}));

describe("PayContent", () => {
  // পাবলিক পেমেন্ট পেজ যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «shows a back link to the home page under the lookup button»।
  it("Public payment page: shows a back link to the home page under the lookup button", () => {
    render(<PayContent />);

    const back = screen.getByRole("link", { name: "pay.back" });
    expect(back).toHaveAttribute("href", "/home");
    expect(back.querySelector("svg")).toBeInTheDocument();
  });

  // পাবলিক পেমেন্ট পেজ যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «shows a numeric captcha»।
  it("Public payment page: shows a numeric captcha", () => {
    render(<PayContent />);

    const code = screen.getByLabelText("pay.captcha.image_alt").textContent?.replace(/\s/g, "") ?? "";
    expect(code).toMatch(/^\d{4}$/);
  });
});
