import { describe, expect, it } from "vitest";
import { isMenuPathActive, supportMenuLocation } from "@/components/nav-main";

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


describe("platform support menu selection", () => {
    it("highlights the current kind on a list or requester detail without changing other routes", () => {
        const issues = "/platform-support?kind=issue";
        const chats = "/platform-support?kind=chat";
        const links = [issues, chats, "/help"];
        expect(isMenuPathActive(supportMenuLocation("/platform-support", "chat"), chats, links)).toBe(true);
        expect(isMenuPathActive(supportMenuLocation("/platform-support/chats/123", null), issues, links)).toBe(false);
        expect(isMenuPathActive(supportMenuLocation("/platform-support/issues/123", "chat"), issues, links)).toBe(true);
        expect(supportMenuLocation("/platform-support-admin", null)).toBe("/platform-support-admin?kind=issue");
        expect(supportMenuLocation("/help/support/getting-started", null)).toBe("/help/support/getting-started");
    });
});
