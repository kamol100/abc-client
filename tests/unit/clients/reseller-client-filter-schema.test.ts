import { describe, expect, it } from "vitest";
import ClientFilterSchema from "@/components/clients/client-filter-schema";
import ResellerClientFilterSchema from "@/components/clients/reseller-client-filter-schema";

describe("ResellerClientFilterSchema", () => {
    it("keeps the client filters and adds a clearable reseller dropdown", () => {
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
