import { describe, expect, it } from "vitest";
import { hasFilledValue, hiddenFieldValue, isFieldVisible } from "@/components/form-builder/core/conditions";
import {
    flattenFieldConfigs,
    flattenFormSchema,
    shownFields,
} from "@/components/form-builder/core/form-schema";
import { buildPayload, toFormData } from "@/components/form-builder/core/payload";
import { isDataComplete, toFormValues } from "@/components/form-builder/core/values";
import type { AccordionSection, FormFieldConfig } from "@/components/form-wrapper/form-builder-type";

const fields: FormFieldConfig[] = [
    { type: "text", name: "name" },
    { type: "text", name: "secret", permission: false },
    { type: "slot", name: "images", slot: "images" },
    {
        type: "fieldArray",
        name: "items",
        defaultItem: {},
        itemFields: [{ type: "number", name: "qty" }],
    },
];

const sections: AccordionSection[] = [
    { name: "one", form: [fields[0], fields[1]] },
    { name: "two", form: [fields[2], fields[3]] },
];

describe("form-schema", () => {
    it("flattenFormSchema returns the top-level fields of a list or of sections", () => {
        expect(flattenFormSchema(fields)).toEqual(fields);
        expect(flattenFormSchema(sections)).toEqual(fields);
        expect(flattenFormSchema(undefined)).toEqual([]);
        expect(flattenFormSchema([])).toEqual([]);
    });

    it("flattenFieldConfigs drops slots and replaces a field array by its row fields", () => {
        expect(flattenFieldConfigs(sections).map((field) => field.name)).toEqual(["name", "secret", "qty"]);
    });

    it("shownFields drops slots and fields with permission false", () => {
        expect(shownFields(sections).map((field) => field.name)).toEqual(["name", "items"]);
    });

});

describe("conditions", () => {
    it("hasFilledValue: empty means null, undefined, \"\" or an empty list", () => {
        expect([null, undefined, "", []].map(hasFilledValue)).toEqual([false, false, false, false]);
        expect([0, false, "a", [1], {}].map(hasFilledValue)).toEqual([true, true, true, true, true]);
    });

    it("isFieldVisible: `when` wins, then `equals` (also as text), then filled", () => {
        expect(isFieldVisible({ field: "kind", equals: "a", when: () => true }, "b")).toBe(true);
        expect(isFieldVisible({ field: "kind", equals: 1 }, "1")).toBe(true);
        expect(isFieldVisible({ field: "kind", equals: "a" }, "b")).toBe(false);
        expect(isFieldVisible({ field: "kind" }, "")).toBe(false);
        expect(isFieldVisible({ field: "kind" }, 0)).toBe(true);
    });

    it("hiddenFieldValue: resetValue, or null when none is given", () => {
        expect(hiddenFieldValue({ field: "kind" })).toBeNull();
        expect(hiddenFieldValue({ field: "kind", resetValue: false })).toBe(false);
        expect(hiddenFieldValue({ field: "kind", resetValue: "" })).toBe("");
    });
});

describe("payload", () => {
    it("buildPayload: transform, then extraPayload on top, then drop undefined keys", () => {
        const payload = buildPayload(
            { name: "North", note: undefined },
            {
                transformPayload: (values) => ({ ...values, kind: "from transform", extra: "from transform" }),
                extraPayload: { extra: "from extra" },
            },
        );

        expect(payload).toEqual({ name: "North", kind: "from transform", extra: "from extra" });
    });

    it("buildPayload: with no steps, only cleans the values", () => {
        expect(buildPayload({ name: "North", gone: undefined }, {})).toEqual({ name: "North" });
    });

    it("toFormData: one entry per key", () => {
        const formData = toFormData({ name: "North", amount: 5 });

        expect(formData.get("name")).toBe("North");
        expect(formData.get("amount")).toBe("5");
    });
});

describe("values", () => {
    it("toFormValues returns an empty object for no data", () => {
        expect(toFormValues(undefined as unknown as Record<string, unknown>, fields)).toEqual({});
    });

    it("isDataComplete: every shown field needs its source key in the data", () => {
        const schema: FormFieldConfig[] = [
            { type: "text", name: "name" },
            { type: "dropdown", name: "zone_id", valueKey: "zone", options: [] },
            { type: "text", name: "secret", permission: false },
        ];

        expect(isDataComplete({ name: null, zone: null }, schema)).toBe(true);
        expect(isDataComplete({ name: "x", zone_id: 3 }, schema)).toBe(false);
        expect(isDataComplete(undefined, schema)).toBe(false);
        expect(isDataComplete({}, undefined)).toBe(true);
    });
});
