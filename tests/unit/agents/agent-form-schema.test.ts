import { describe, expect, it } from "vitest";
import { AgentFormFieldSchema } from "@/components/agents/agent-form-schema";
import { AgentFormSchema } from "@/components/agents/agent-type";

describe("AgentFormFieldSchema", () => {
    // এজেন্টের তথ্য ও কমিশন যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «includes the agent fields from the migration»।
    it("Agent form schema: include the required agent fields in the form", () => {
        const names = AgentFormFieldSchema().map((field) => field.name);

        expect(names).toEqual(["name", "phone", "commission", "status", "note"]);
    });
});

describe("AgentFormSchema", () => {
    // এজেন্টের তথ্য ও কমিশন যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «accepts a valid agent and defaults status to active»।
    it("Agent form schema: accepts a valid agent and defaults status to active", () => {
        const parsed = AgentFormSchema.parse({
            name: "Karim",
            phone: "01711111111",
            commission: "15",
            note: "North zone",
        });

        expect(parsed).toMatchObject({
            name: "Karim",
            phone: "01711111111",
            commission: 15,
            note: "North zone",
            status: "active",
        });
    });

    // এজেন্টের তথ্য ও কমিশন যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «rejects a missing name and a negative commission»।
    it("Agent form schema: rejects a missing name and a negative commission", () => {
        const result = AgentFormSchema.safeParse({
            name: "",
            commission: -1,
            status: "inactive",
        });

        expect(result.success).toBe(false);
        if (!result.success) {
            const fields = result.error.issues.map((issue) => issue.path[0]);
            expect(fields).toEqual(expect.arrayContaining(["name", "commission"]));
        }
    });
});
