import { describe, expect, it } from "vitest";
import { ResellerFormFieldSchema } from "@/components/resellers/reseller-form-schema";
import { getResellerFormSchema } from "@/components/resellers/reseller-type";

const fieldNames = (mode: "create" | "edit" = "create") =>
    ResellerFormFieldSchema({ mode }).flatMap((section) => section.form.map((field) => field.name));

const validReseller = {
    name: "Demo Reseller",
    username: "demo",
    password: "secret",
    phone: "01700000000",
    network_id: 1,
};

describe("ResellerFormFieldSchema", () => {
    it("adds an agent dropdown and hides commission until an agent is selected", () => {
        const billing = ResellerFormFieldSchema().find(
            (section) => section.name === "reseller.sections.billing_information"
        );
        const agent = billing?.form.find((field) => field.name === "agent_id");
        const commission = billing?.form.find((field) => field.name === "commission");
        const countCommission = billing?.form.find((field) => field.name === "count_commission");

        expect(agent).toMatchObject({
            type: "dropdown",
            api: "/dropdown-agents",
            valueKey: "agent",
            valueMapping: { idKey: "id", labelKey: "name" },
        });
        expect(commission).toMatchObject({
            type: "number",
            label: { labelText: "reseller.commission.label", labelSuffix: "%" },
            visibleWhen: { field: "agent_id", resetValue: null },
        });
        expect(countCommission).toMatchObject({
            type: "switch",
            visibleWhen: { field: "agent_id", resetValue: false },
        });
    });

    it("drops marital status, blood group, and date of birth", () => {
        const removed = ["marital_status", "blood_group", "date_of_birth"];

        expect(fieldNames()).not.toEqual(expect.arrayContaining(removed));
        for (const name of removed) {
            expect(fieldNames()).not.toContain(name);
            expect(fieldNames("edit")).not.toContain(name);
        }
    });
});

describe("getResellerFormSchema", () => {
    it("accepts a reseller with an agent and commission", () => {
        const parsed = getResellerFormSchema("edit").parse({
            ...validReseller,
            agent_id: "7",
            commission: "15",
            count_commission: true,
        });

        expect(parsed).toMatchObject({
            agent_id: 7,
            commission: 15,
            count_commission: true,
        });
    });

    it("allows an empty agent and defaults count commission to false", () => {
        const parsed = getResellerFormSchema("edit").parse(validReseller);

        expect(parsed.agent_id).toBeNull();
        expect(parsed.commission).toBeNull();
        expect(parsed.count_commission).toBe(false);
    });

    it("requires commission when an agent is selected and rejects a negative commission", () => {
        const missing = getResellerFormSchema("edit").safeParse({
            ...validReseller,
            agent_id: 7,
            commission: null,
        });
        const negative = getResellerFormSchema("edit").safeParse({
            ...validReseller,
            agent_id: 7,
            commission: -1,
        });

        expect(missing.success).toBe(false);
        expect(negative.success).toBe(false);
        if (!missing.success) {
            expect(missing.error.issues.map((issue) => issue.path[0])).toContain("commission");
        }
        if (!negative.success) {
            expect(negative.error.issues.map((issue) => issue.path[0])).toContain("commission");
        }
    });
});
