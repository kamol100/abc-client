import { describe, expect, it } from "vitest";
import { filterColumnCount, splitFilterFields } from "@/components/data-table/filter-layout";
import InvoiceFilterSchema from "@/components/invoices/invoice-filter-schema";

describe("filter row layout", () => {
    it("counts columns from the field count and requested rows", () => {
        expect(filterColumnCount(8, 2)).toBe(4);
        expect(filterColumnCount(10, 2)).toBe(5);
        expect(filterColumnCount(8, 1)).toBe(8);
        expect(filterColumnCount(5, 2)).toBe(3);
        expect(filterColumnCount(0, 2)).toBe(1);
        expect(filterColumnCount(8, 0)).toBe(8);
    });

    it("splits fields into even rows", () => {
        expect(splitFilterFields([1, 2, 3, 4, 5, 6, 7, 8], 2)).toEqual([
            [1, 2, 3, 4],
            [5, 6, 7, 8],
        ]);
        expect(splitFilterFields([1, 2, 3, 4, 5], 2)).toEqual([
            [1, 2, 3],
            [4, 5],
        ]);
        expect(splitFilterFields([], 2)).toEqual([]);
    });

    it("splits the invoice filters across two rows", () => {
        const names = InvoiceFilterSchema().map((field) => field.name);
        const rows = splitFilterFields(names, 2);
        const perRow = Math.ceil(names.length / 2);

        expect(rows).toEqual([names.slice(0, perRow), names.slice(perRow)]);
    });
});
