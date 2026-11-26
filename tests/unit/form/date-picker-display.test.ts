import { describe, expect, it } from "vitest";
import { formatDatePickerDisplay, hasSelectedDateRange } from "@/components/form/DatePicker";

const october21 = new Date(2026, 9, 21);
const october22 = new Date(2026, 9, 22);

describe("formatDatePickerDisplay", () => {
    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «shows a single selected date once»।
    it("Date picker display: shows a single selected date once", () => {
        expect(formatDatePickerDisplay(october21, "single")).toBe("10/21/2026");
    });

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «shows only the start date when a range has no end date»।
    it("Date picker display: shows only the start date when a range has no end date", () => {
        expect(formatDatePickerDisplay({ from: october21 }, "range")).toBe("10/21/2026");
    });

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «shows a same-day range once»।
    it("Date picker display: shows a same-day range once", () => {
        expect(formatDatePickerDisplay({ from: october21, to: october21 }, "range")).toBe("10/21/2026");
    });

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «shows a range with one hyphen»।
    it("Date picker display: shows a range with one hyphen", () => {
        expect(formatDatePickerDisplay({ from: october21, to: october22 }, "range")).toBe(
            "10/21/2026 - 10/22/2026",
        );
    });

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «shows the placeholder state when nothing is selected»।
    it("Date picker display: shows the placeholder state when nothing is selected", () => {
        expect(formatDatePickerDisplay(undefined, "single")).toBeNull();
        expect(formatDatePickerDisplay(undefined, "range")).toBeNull();
    });

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «formats each side of a custom single-date pattern once»।
    it("Date picker display: formats each side of a custom single-date pattern once", () => {
        expect(
            formatDatePickerDisplay(
                { from: october21, to: october22 },
                "range",
                "yyyy-MM-dd",
                "yyyy-MM-dd",
            ),
        ).toBe("2026-10-21 - 2026-10-22");
    });
});

describe("hasSelectedDateRange", () => {
    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «is false for a single date or an incomplete range»।
    it("Date picker display: is false for a single date or an incomplete range", () => {
        expect(hasSelectedDateRange(october21)).toBe(false);
        expect(hasSelectedDateRange({ from: october21 })).toBe(false);
        expect(hasSelectedDateRange({ from: october21, to: october21 })).toBe(false);
        expect(hasSelectedDateRange(undefined)).toBe(false);
    });

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «is true when the start and end dates differ»।
    it("Date picker display: is true when the start and end dates differ", () => {
        expect(hasSelectedDateRange({ from: october21, to: october22 })).toBe(true);
    });
});
