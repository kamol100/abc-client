import { describe, expect, it } from "vitest";
import { ProductFormSchema, ProductRowSchema } from "@/components/products/product-type";
import { ProductInLineSchema, ProductInFormSchema } from "@/components/products/product-in-type";
import { ProductOutLineSchema, ProductOutFormSchema } from "@/components/products/product-out-type";

const base = { product_id: 1, quantity: 2, unit_price: 100, unit_sell_price: 150, status: "new", has_serial: 0 };

describe("PRODUCTS-001 product contracts", () => {
  it("uses UUID route identity separately from numeric product references", () => {
    const row = ProductRowSchema.parse({ id: "019aac07-0000-7000-8000-000000000001", product_id: 42, name: "Router" });
    expect(row.product_id).toBe(42);
    expect(row.id).toBe("019aac07-0000-7000-8000-000000000001");
    expect(ProductRowSchema.safeParse({ id: 42, name: "Router" }).success).toBe(false);
  });
  it("rejects whitespace names and database-length overflow", () => {
    const fields = { unit_type_id: 1, product_category_id: 1 };
    for (const name of ["  ", "a", "a".repeat(256)]) expect(ProductFormSchema.safeParse({ ...fields, name }).success).toBe(false);
    expect(ProductFormSchema.parse({ ...fields, name: " Router " }).name).toBe("Router");
    expect(ProductFormSchema.safeParse({ ...fields, name: "Router", description: "x".repeat(256) }).success).toBe(false);
  });
  for (const [direction, schema] of [["in", ProductInLineSchema], ["out", ProductOutLineSchema]] as const) {
    it(`rejects zero and negative stock-${direction} quantities`, () => {
      for (const quantity of [0, -1]) expect(schema.safeParse({ ...base, quantity }).success).toBe(false);
    });
    it(`rejects duplicate and fractional serialized stock-${direction}`, () => {
      const serialized = { ...base, has_serial: 1, productin_id: 1 };
      expect(schema.safeParse({ ...serialized, serial: ["1", "1"] }).success).toBe(false);
      expect(schema.safeParse({ ...serialized, quantity: 2.5, serial: ["1", "2"] }).success).toBe(false);
    });
  }
  it("requires dates before submission", () => {
    expect(ProductInFormSchema.safeParse({ purchase_by: 1, product: [base] }).success).toBe(false);
    expect(ProductOutFormSchema.safeParse({ received_by: 1, product: [base] }).success).toBe(false);
  });
});
