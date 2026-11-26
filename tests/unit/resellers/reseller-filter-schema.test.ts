import { describe, expect, it } from "vitest";
import ResellerFilterSchema from "@/components/resellers/reseller-filter-schema";

describe("ResellerFilterSchema", () => {
    // রিসেলারের তথ্য ও সেটিংস যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «searches name, username, phone, and email through one any field»।
    it("Reseller filter schema: searches name, username, phone, and email through one any field", () => {
        const fields = ResellerFilterSchema();
        const any = fields.find((field) => field.name === "any");

        expect(any).toMatchObject({
            type: "text",
            name: "any",
            placeholder: "reseller.any_search.placeholder",
            permission: true,
            watchForFilter: true,
        });
        expect(fields.some((field) => field.name === "name" || field.name === "username" || field.name === "phone")).toBe(false);
        expect(fields.map((field) => field.name)).toEqual(["any", "network_id", "zone_id", "status"]);
    });
});
