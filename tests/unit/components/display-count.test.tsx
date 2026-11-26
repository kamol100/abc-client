import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DisplayCount from "@/components/display-count";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: "en" },
    }),
}));

const visibleAmount = (container: HTMLElement) =>
    container.querySelector("[aria-hidden='true'] .absolute");

describe("DisplayCount currency label", () => {
    // সাধারণ UI নিয়ন্ত্রণ যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «hides the BDT label by default»।
    it("Display count: hides the BDT label by default", () => {
        const { container } = render(
            <DisplayCount amount={1500} formatCurrency translation={false} />,
        );

        const amount = visibleAmount(container);
        expect(amount).toHaveTextContent("1,500.00/-");
        expect(amount?.textContent).not.toContain("BDT");
    });

    // সাধারণ UI নিয়ন্ত্রণ যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «hides the /- suffix when currencySuffix is false»।
    it("Display count: hides the /- suffix when currencySuffix is false", () => {
        const { container } = render(
            <DisplayCount amount={1500} formatCurrency currencySuffix={false} translation={false} />,
        );

        const amount = visibleAmount(container);
        expect(amount).toHaveTextContent("1,500.00");
        expect(amount?.textContent).not.toContain("/-");
    });

    // সাধারণ UI নিয়ন্ত্রণ যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «does not add /- to a plain count»।
    it("Display count: does not add /- to a plain count", () => {
        const { container } = render(<DisplayCount amount={12} translation={false} />);

        expect(visibleAmount(container)?.textContent).not.toContain("/-");
    });

    // সাধারণ UI নিয়ন্ত্রণ যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «shows the BDT label when hideCurrency is false»।
    it("Display count: shows the BDT label when hideCurrency is false", () => {
        const { container } = render(
            <DisplayCount amount={1500} formatCurrency hideCurrency={false} translation={false} />,
        );

        expect(visibleAmount(container)).toHaveTextContent("BDT");
    });
});
