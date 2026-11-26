import { describe, expect, it } from "vitest";
import { paymentDeadlineSetting } from "@/components/settings/core/values";
import { fieldOf } from "@/components/settings/registry/fields";
import { sectionKeys } from "@/components/settings/registry/sections";

describe("payment deadline setting", () => {
    // অ্যাপের সেটিংস যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «offers days 01 through 30 on general settings and defaults to 11»।
    it("Payment deadline: offers days 01 through 30 on general settings and defaults to 11", () => {
        expect(sectionKeys("general")).toContain("payment_deadline");
        const field = fieldOf("payment_deadline");

        expect(field?.kind).toBe("select");
        if (field?.kind !== "select") return;

        expect(field.options).toHaveLength(30);
        expect(field.options[0]).toEqual({ value: 1, label: "01" });
        expect(field.options[10]).toEqual({ value: 11, label: "11" });
        expect(field.options[29]).toEqual({ value: 30, label: "30" });
        expect(paymentDeadlineSetting(undefined)).toBe(11);
        expect(paymentDeadlineSetting(null)).toBe(11);
        expect(paymentDeadlineSetting("")).toBe(11);
        expect(paymentDeadlineSetting("20")).toBe(20);
        expect(paymentDeadlineSetting(1)).toBe(1);
        expect(paymentDeadlineSetting(30)).toBe(30);
        expect(paymentDeadlineSetting(0)).toBe(11);
        expect(paymentDeadlineSetting(31)).toBe(11);
    });
});
