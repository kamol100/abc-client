import { describe, expect, it } from "vitest";
import { buildMenuConfig, selectMenuItems, type MenuAccess } from "@/hooks/use-menu-items";

const menu = buildMenuConfig((key) => key);

const billingLinks = (permissions: string[], isReseller: boolean): string[] => {
    const allow = new Set(permissions);
    const access: MenuAccess = { hasPermission: (permission) => allow.has(permission), isReseller };
    const group = selectMenuItems(menu, access).find((item) => item.id === 9);
    return group?.items?.map((sub) => sub.url) ?? [];
};

describe("My bills menu link", () => {
    // অনুমতি পাওয়া রিসেলার "My Bills" লিংক দেখে, অন্য ইনভয়েস অনুমতি না থাকলেও — তা যাচাই করি।
    it("My bills menu - Reseller with permission: shows the link, also without other invoice permissions", () => {
        expect(billingLinks(["reseller-invoices.access"], true)).toEqual(["/my-bills"]);
        expect(billingLinks(["invoices.access", "reseller-invoices.access"], true)).toEqual(["/invoices", "/my-bills"]);
    });

    // অনুমতি না থাকা রিসেলার এবং অনুমতি থাকা কোম্পানি ব্যবহারকারী — কেউই লিংক দেখে না, তা যাচাই করি।
    it("My bills menu - Reseller without permission or company staff: hides the link", () => {
        expect(billingLinks(["invoices.access"], true)).toEqual(["/invoices"]);
        expect(billingLinks(["invoices.access", "reseller-invoices.access"], false)).toEqual(["/invoices"]);
        expect(billingLinks(["reseller-invoices.access"], false)).toEqual([]);
    });
});
