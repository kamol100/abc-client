import { describe, expect, it } from "vitest";
import ClientFilterSchema from "@/components/clients/client-filter-schema";
import ResellerClientFilterSchema from "@/components/clients/reseller-client-filter-schema";

describe("ResellerClientFilterSchema", () => {
    // ক্লায়েন্টের তথ্য ও নিয়ন্ত্রণ যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «keeps the client filters and adds a clearable reseller dropdown»।
    it("Reseller client filter schema: keeps the client filters and adds a clearable reseller dropdown", () => {
        const clientFilters = ClientFilterSchema();
        const reportFilters = ResellerClientFilterSchema();
        const resellerFilter = reportFilters.find((field) => field.name === "reseller_id");

        expect(reportFilters.map((field) => field.name)).toEqual([
            ...clientFilters.map((field) => field.name),
            "reseller_id",
        ]);
        expect(resellerFilter).toMatchObject({
            type: "dropdown",
            label: { labelText: "client.reseller.label" },
            placeholder: "client.reseller.all",
            api: "/dropdown-resellers/company",
            isClearable: true,
        });
    });
});
