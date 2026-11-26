import { describe, expect, it, vi } from "vitest";
import { createThermalPdf, paginateReceiptRows, thermalPageHeightDots } from "@/components/invoices/invoice-print-dialog";

vi.mock("@/app/actions", () => ({ useFetch: vi.fn() }));

const PAGE_WIDTH_DOTS = 384;
const MIN_PAGE_DOTS = 480;

describe("thermalPageHeightDots", () => {
    // ইনভয়েস ও পেমেন্ট যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «pads a %s-dot receipt to a portrait page»।
    it.each([1, 200, 377, 383, 384, 479.2])("Invoice print dialog: pads a %s-dot receipt to a portrait page", (contentHeight) => {
        const pageHeight = thermalPageHeightDots(contentHeight);

        expect(pageHeight).toBe(MIN_PAGE_DOTS);
        expect(pageHeight).toBeGreaterThan(PAGE_WIDTH_DOTS);
    });

    // ইনভয়েস ও পেমেন্ট যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «keeps tall receipts at their own height»।
    it("Invoice print dialog: keeps tall receipts at their own height", () => {
        expect(thermalPageHeightDots(505)).toBe(505);
        expect(thermalPageHeightDots(2240)).toBe(2240);
    });
});

describe("paginateReceiptRows", () => {
    // ইনভয়েস ও পেমেন্ট যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «keeps a short receipt on one page»।
    it("Invoice print dialog: keeps a short receipt on one page", () => {
        expect(paginateReceiptRows([8, 8], 30, 20)).toEqual([[0, 1]]);
    });

    // ইনভয়েস ও পেমেন্ট যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «moves a row that does not fit onto the next page»।
    it("Invoice print dialog: moves a row that does not fit onto the next page", () => {
        expect(paginateReceiptRows([10, 10, 10, 10], 30, 20)).toEqual([[0, 1, 2], [3]]);
    });

    // ইনভয়েস ও পেমেন্ট যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «gives the summary its own page when the last rows leave no room»।
    it("Invoice print dialog: gives the summary its own page when the last rows leave no room", () => {
        expect(paginateReceiptRows([25], 30, 10)).toEqual([[0], []]);
    });

    // ইনভয়েস ও পেমেন্ট যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «still prints the header and summary when there are no rows»।
    it("Invoice print dialog: still prints the header and summary when there are no rows", () => {
        expect(paginateReceiptRows([], 30, 10)).toEqual([[]]);
    });

    // ইনভয়েস ও পেমেন্ট যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «rejects a summary taller than the printable page»।
    it("Invoice print dialog: rejects a summary taller than the printable page", () => {
        expect(() => paginateReceiptRows([10], 30, 0)).toThrow(/summary is taller/);
    });
});

describe("createThermalPdf", () => {
    // ইনভয়েস ও পেমেন্ট যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «asks the viewer to print at actual size so the driver paper does not rescale the 48mm strip»।
    it("Invoice print dialog: asks the viewer to print at actual size so the driver paper does not rescale the 48mm strip", () => {
        const pdf = createThermalPdf([48, 70], "INV-12");

        expect(pdf.output()).toMatch(/\/PrintScaling\s*\/None/);
        expect(pdf.internal.pageSize.getWidth()).toBeCloseTo(48, 3);
        expect(pdf.internal.pageSize.getHeight()).toBeCloseTo(70, 3);
    });
});
