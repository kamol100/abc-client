import { describe, expect, it } from "vitest";
import { AgentFormFieldSchema } from "@/components/agents/agent-form-schema";
import { AgentFormSchema } from "@/components/agents/agent-type";

describe("AgentFormFieldSchema", () => {
    it("includes the agent fields from the migration", () => {
        const names = AgentFormFieldSchema().map((field) => field.name);

        expect(names).toEqual(["name", "phone", "commission", "status", "note"]);
    });
});

describe("AgentFormSchema", () => {
    it("accepts a valid agent and defaults status to active", () => {
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

    it("rejects a missing name and a negative commission", () => {
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
