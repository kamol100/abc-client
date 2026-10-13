import { describe, expect, it } from "vitest";
import { durationParts, formatMs, formatPct } from "@/components/monitoring/monitoring-format";

describe("durationParts", () => {
    it("keeps the two most significant units", () => {
        expect(durationParts(4140)).toEqual([{ unit: "h", count: 1 }, { unit: "m", count: 9 }]);
        expect(durationParts(1020)).toEqual([{ unit: "m", count: 17 }]);
        expect(durationParts(2 * 86400 + 3 * 3600 + 120)).toEqual([{ unit: "d", count: 2 }, { unit: "h", count: 3 }]);
    });

    it("drops a zero second unit and uses seconds below a minute", () => {
        expect(durationParts(3600)).toEqual([{ unit: "h", count: 1 }]);
        expect(durationParts(86400 + 60)).toEqual([{ unit: "d", count: 1 }]);
        expect(durationParts(45)).toEqual([{ unit: "s", count: 45 }]);
        expect(durationParts(-5)).toEqual([{ unit: "s", count: 0 }]);
    });
});

describe("formatters", () => {
    it("formats latency and percentages, with a dash for missing data", () => {
        expect(formatMs(1.14)).toBe("1.1 ms");
        expect(formatMs(0.5)).toBe("0.50 ms");
        expect(formatMs(null)).toBe("—");
        expect(formatPct(99.1)).toBe("99.10%");
        expect(formatPct(0, true)).toBe("0%");
        expect(formatPct(33.333, true)).toBe("33.33%");
        expect(formatPct(null)).toBe("—");
    });
});
