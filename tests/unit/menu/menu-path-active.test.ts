import { describe, expect, it } from "vitest";
import { isMenuPathActive } from "@/components/nav-main";

const productLinks = ["/products", "/products/reports", "/product-categories", "/unit-types"];

describe("menu path active state", () => {
  it("selects only the longer sibling when one menu url contains another", () => {
    expect(isMenuPathActive("/products/reports", "/products", productLinks)).toBe(false);
    expect(isMenuPathActive("/products/reports", "/products/reports", productLinks)).toBe(true);
    expect(isMenuPathActive("/products/reports", "/product-categories", productLinks)).toBe(false);
  });

  it("keeps the parent link active for its own page and nested routes", () => {
    expect(isMenuPathActive("/products", "/products", productLinks)).toBe(true);
    expect(isMenuPathActive("/products", "/products/reports", productLinks)).toBe(false);
    expect(isMenuPathActive("/products/12", "/products", productLinks)).toBe(true);
    expect(isMenuPathActive("/products/12", "/products/reports", productLinks)).toBe(false);
  });
});
