import { describe, expect, it } from "vitest";
import { resolveProductInProductId } from "@/components/products/product-in-type";

describe("resolveProductInProductId", () => {
    it("keeps a positive product id from the product list link", () => {
        expect(resolveProductInProductId("12")).toBe(12);
        expect(resolveProductInProductId(8)).toBe(8);
        expect(resolveProductInProductId("4.9")).toBe(4);
    });

    it("leaves the line unselected when the query is missing or invalid", () => {
        expect(resolveProductInProductId(undefined)).toBe(0);
        expect(resolveProductInProductId(null)).toBe(0);
        expect(resolveProductInProductId("")).toBe(0);
        expect(resolveProductInProductId("abc")).toBe(0);
        expect(resolveProductInProductId(0)).toBe(0);
        expect(resolveProductInProductId(-3)).toBe(0);
    });
});
