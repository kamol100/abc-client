import { describe, expect, it } from "vitest";
import { formatDataUsage } from "@/lib/helper/helper";

describe("formatDataUsage", () => {
    // সাধারণ সহায়ক ফাংশন যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «formats binary units and drops trailing zeros»।
    it("Data usage formatting: formats binary units and drops trailing zeros", () => {
        expect(formatDataUsage(0)).toBe("0 B");
        expect(formatDataUsage(512)).toBe("512 B");
        expect(formatDataUsage(1536)).toBe("1.5 KB");
        expect(formatDataUsage(1024 ** 2)).toBe("1 MB");
        expect(formatDataUsage(10 * 1024 ** 3)).toBe("10 GB");
        expect(formatDataUsage(300 * 1024 ** 3)).toBe("300 GB");
        expect(formatDataUsage(500 * 1024 ** 3)).toBe("500 GB");
        expect(formatDataUsage(1024 ** 4)).toBe("1 TB");
    });

    // সাধারণ সহায়ক ফাংশন যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «does not format invalid values as usage»।
    it("Data usage formatting: does not format invalid values as usage", () => {
        expect(formatDataUsage(Number.NaN)).toBe("—");
        expect(formatDataUsage(-1)).toBe("—");
        expect(formatDataUsage(Number.POSITIVE_INFINITY)).toBe("—");
    });
});
