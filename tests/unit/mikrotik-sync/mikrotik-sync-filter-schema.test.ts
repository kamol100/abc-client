import { describe, expect, it } from "vitest";
import MikrotikSyncFilterSchema from "@/components/mikrotik-sync/mikrotik-sync-filter-schema";

describe("MikrotikSyncFilterSchema", () => {
    it("adds a clearable reseller dropdown that filters by reseller_id", () => {
        const resellerFilter = MikrotikSyncFilterSchema().find(
            (field) => field.name === "reseller_id",
        );

        expect(resellerFilter).toMatchObject({
            type: "dropdown",
            placeholder: "mikrotik_sync.filters.reseller.placeholder",
            api: "/dropdown-resellers/company",
            isClearable: true,
        });
    });
});
