import { describe, expect, it } from "vitest";
import { SETTINGS_SECTION_SCHEMA } from "@/components/settings/settings-form-schema";
import {
    clientAutoInactiveTimeSetting,
    toSettingsPayloadValue,
} from "@/components/settings/settings-type";

describe("client auto inactive time setting", () => {
    it("offers hours 00 through 23 on general settings and defaults to 12", () => {
        const field = SETTINGS_SECTION_SCHEMA.general.fields.find(
            (item) => item.kind === "select" && item.key === "auto_inactive_client_time",
        );

        expect(field?.kind).toBe("select");
        if (field?.kind !== "select") return;

        expect(field.options).toHaveLength(24);
        expect(field.options[0]).toEqual({ value: 0, label: "00" });
        expect(field.options[1]).toEqual({ value: 1, label: "01" });
        expect(field.options[12]).toEqual({ value: 12, label: "12" });
        expect(field.options[13]).toEqual({ value: 13, label: "13" });
        expect(field.options[22]).toEqual({ value: 22, label: "22" });
        expect(field.options[23]).toEqual({ value: 23, label: "23" });
        expect(clientAutoInactiveTimeSetting(undefined)).toBe(12);
        expect(clientAutoInactiveTimeSetting(null)).toBe(12);
        expect(clientAutoInactiveTimeSetting("")).toBe(12);
        expect(clientAutoInactiveTimeSetting("12")).toBe(12);
        expect(clientAutoInactiveTimeSetting(0)).toBe(0);
        expect(clientAutoInactiveTimeSetting(23)).toBe(23);
        expect(clientAutoInactiveTimeSetting(-1)).toBe(12);
        expect(clientAutoInactiveTimeSetting(24)).toBe(12);
    });

    it("saves the selected hour as a number", () => {
        expect(toSettingsPayloadValue("auto_inactive_client_time", 12)).toBe(12);
        expect(toSettingsPayloadValue("auto_inactive_client_time", "07")).toBe(7);
        expect(toSettingsPayloadValue("auto_inactive_client_time", 0)).toBe(0);
    });
});
