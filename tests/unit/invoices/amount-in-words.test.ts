import { describe, expect, it } from "vitest";
import { amountInWords } from "@/components/invoices/amount-in-words";

describe("amountInWords", () => {
    // ইনভয়েস ও পেমেন্ট যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «spells invoice totals»।
    it("Invoice total in words: spells invoice totals", () => {
        expect(amountInWords(0)).toBe("Zero");
        expect(amountInWords(750)).toBe("Seven Hundred Fifty");
        expect(amountInWords(800)).toBe("Eight Hundred");
        expect(amountInWords(1150)).toBe("One Thousand One Hundred Fifty");
        expect(amountInWords(1000000)).toBe("One Million");
    });
});
