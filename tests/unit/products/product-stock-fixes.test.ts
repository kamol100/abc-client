import { describe, expect, it } from "vitest";
import { ProductInFormSchema } from "@/components/products/product-in-type";
import {
    ProductOutLineSchema,
    calculateProductOutLineTotal,
} from "@/components/products/product-out-type";
import { ProductMovementRowSchema } from "@/components/products/product-movement-type";

const outLine = { product_id: 1, productin_id: 3, quantity: 2, unit_price: 150, vat: 5, discount: 0, has_serial: 0 };
const inLine = { product_id: 1, quantity: 5, unit_price: 100, unit_sell_price: 150, status: "new", has_serial: 0 };
const inForm = { purchase_by: 7, purchase_date: new Date("2026-11-01T00:00:00"), product: [inLine] };

describe("PRODUCTS-002 stock fixes", () => {
    it("calculates the stock-out line total the same way as the API (VAT, then discount)", () => {
        // 2 x 150 = 300, +5% = 315, -20 = 295 (ProductStockService::lineTotals)
        expect(calculateProductOutLineTotal(2, 150, 5, 20)).toBe(295);
    });

    it("rejects a stock-out discount larger than the line amount", () => {
        const result = ProductOutLineSchema.safeParse({ ...outLine, discount: 316 });
        expect(result.success).toBe(false);
        expect(result.error?.issues.map((issue) => issue.message)).toContain("product_out.errors.discount_max");
    });

    it("accepts a discount equal to the line amount", () => {
        expect(ProductOutLineSchema.safeParse({ ...outLine, discount: 315 }).success).toBe(true);
    });

    it("accepts decimal stock-out quantities for unserialized products", () => {
        const parsed = ProductOutLineSchema.parse({ ...outLine, quantity: 20.25 });
        expect(parsed.quantity).toBe(20.25);
    });

    it("sends the vendor on stock-in without an expense", () => {
        const payload = ProductInFormSchema.parse({ ...inForm, vendor_id: 9 });
        expect(payload.vendor_id).toBe(9);
        expect(payload.expense).toBeNull();
    });

    it("copies the vendor into the expense when an expense is added", () => {
        const payload = ProductInFormSchema.parse({ ...inForm, vendor_id: 9, expense: { expense_type_id: 4, amount: 0 } });
        expect(payload.expense?.vendor_id).toBe(9);
        expect(payload.expense?.amount).toBe(500);
    });

    it("sends a null vendor when none is picked", () => {
        expect(ProductInFormSchema.parse(inForm).vendor_id).toBeNull();
    });

    it("keeps decimal stock-in quantities", () => {
        const payload = ProductInFormSchema.parse({ ...inForm, product: [{ ...inLine, quantity: 150.5 }] });
        expect(payload.product[0].quantity).toBe(150.5);
    });

    it("types movement rows by uuid and reads discount, VAT and the linked invoice", () => {
        const row = ProductMovementRowSchema.parse({
            id: "019aac07-0000-7000-8000-000000000002",
            vat: 5,
            discount: 20,
            voucher: "PV-1",
            invoice: { uuid: "019aac07-0000-7000-8000-000000000003", trackID: "INV-1" },
        });
        expect(row.id).toBe("019aac07-0000-7000-8000-000000000002");
        expect(row.discount).toBe(20);
        expect(row.invoice?.trackID).toBe("INV-1");
    });
});
