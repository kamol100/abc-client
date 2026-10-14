import { describe, expect, it } from "vitest";
import { formatDatePickerDisplay, hasSelectedDateRange } from "@/components/form/DatePicker";

const october21 = new Date(2026, 9, 21);
const october22 = new Date(2026, 9, 22);

describe("formatDatePickerDisplay", () => {
    it("shows a single selected date once", () => {
        expect(formatDatePickerDisplay(october21, "single")).toBe("10/21/2026");
    });

    it("shows only the start date when a range has no end date", () => {
        expect(formatDatePickerDisplay({ from: october21 }, "range")).toBe("10/21/2026");
    });

    it("shows a same-day range once", () => {
        expect(formatDatePickerDisplay({ from: october21, to: october21 }, "range")).toBe("10/21/2026");
    });

    it("shows a range with one hyphen", () => {
        expect(formatDatePickerDisplay({ from: october21, to: october22 }, "range")).toBe(
            "10/21/2026 - 10/22/2026",
        );
    });

    it("shows the placeholder state when nothing is selected", () => {
        expect(formatDatePickerDisplay(undefined, "single")).toBeNull();
        expect(formatDatePickerDisplay(undefined, "range")).toBeNull();
    });

    it("formats each side of a custom single-date pattern once", () => {
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
    it("is false for a single date or an incomplete range", () => {
        expect(hasSelectedDateRange(october21)).toBe(false);
        expect(hasSelectedDateRange({ from: october21 })).toBe(false);
        expect(hasSelectedDateRange({ from: october21, to: october21 })).toBe(false);
        expect(hasSelectedDateRange(undefined)).toBe(false);
    });

    it("is true when the start and end dates differ", () => {
        expect(hasSelectedDateRange({ from: october21, to: october22 })).toBe(true);
    });
});
