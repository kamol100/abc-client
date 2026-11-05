import { describe, expect, it, vi } from "vitest";
import { thermalPageHeightDots } from "@/components/invoices/invoice-print-dialog";

vi.mock("@/app/actions", () => ({ useFetch: vi.fn() }));

const PAGE_WIDTH_DOTS = 384;
const MIN_PAGE_DOTS = 480;

describe("thermalPageHeightDots", () => {
    it.each([1, 200, 377, 383, 384, 479.2])("pads a %s-dot receipt to a portrait page", (contentHeight) => {
        const pageHeight = thermalPageHeightDots(contentHeight);

        expect(pageHeight).toBe(MIN_PAGE_DOTS);
        expect(pageHeight).toBeGreaterThan(PAGE_WIDTH_DOTS);
    });

    it("keeps tall receipts at their own height", () => {
        expect(thermalPageHeightDots(505)).toBe(505);
        expect(thermalPageHeightDots(2240)).toBe(2240);
    });
});
