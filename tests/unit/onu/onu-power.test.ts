import { describe, expect, it } from "vitest";
import { formatDistance, onuStatusBadgeType, rxLevel, rxLowThreshold } from "@/components/onu/onu-power";
import { onuIdentity, onuLabel } from "@/components/onu/onu-type";
import OnuFilterSchema from "@/components/onu/onu-filter-schema";

describe("onu power", () => {
    it("grades receive power like the API's optical summary", () => {
        expect(rxLevel(-20, -27)).toBe("good");
        expect(rxLevel(-26.5, -27)).toBe("near_limit"); // threshold ≤ rx < threshold + 2
        expect(rxLevel(-27, -27)).toBe("near_limit");
        expect(rxLevel(-27.01, -27)).toBe("low");
        expect(rxLevel(-7.5, -27)).toBe("too_strong");
        expect(rxLevel(-25, -24)).toBe("low"); // the threshold is a setting
        expect(rxLevel(null)).toBe("none");
    });

    it("reads the threshold setting with a default", () => {
        expect(rxLowThreshold("-26.5")).toBe(-26.5);
        expect(rxLowThreshold(-30)).toBe(-30);
        expect(rxLowThreshold(undefined)).toBe(-27);
        expect(rxLowThreshold("")).toBe(-27);
        expect(rxLowThreshold("abc")).toBe(-27);
    });

    it("formats distance and maps statuses to badges", () => {
        expect(formatDistance(850)).toBe("850 m");
        expect(formatDistance(1530)).toBe("1.53 km");
        expect(formatDistance(null)).toBe("—");
        expect(["online", "los", "dying_gasp", "offline", "unknown", "weird"].map(onuStatusBadgeType)).toEqual([
            "success", "decline", "decline", "decline", "pending", "pending",
        ]);
    });
});

describe("onu names", () => {
    it("prefers the label, and the serial (GPON) over the MAC (EPON)", () => {
        expect(onuLabel({ name: "EPON0/1:4" })).toBe("EPON0/1:4");
        expect(onuLabel({ name: "EPON0/1:4", label: "0/1:4" })).toBe("0/1:4");
        expect(onuIdentity({ serial: "HWTC554A9E26", mac: null })).toBe("HWTC554A9E26");
        expect(onuIdentity({ serial: null, mac: "02:DF:0A:01:04:7B" })).toBe("02:DF:0A:01:04:7B");
        expect(onuIdentity({ serial: null, mac: null })).toBeNull();
    });
});

describe("ONU filters", () => {
    it("offers search, OLT, status, low power and unbound", () => {
        const fields = OnuFilterSchema();
        expect(fields.map((field) => field.name)).toEqual(["search", "olt", "status", "low_power", "unbound"]);
        expect(fields.find((field) => field.name === "olt")).toMatchObject({ type: "dropdown", api: "/dropdown-devices?category=olt" });
        expect(fields.find((field) => field.name === "status")).toMatchObject({
            options: expect.arrayContaining([{ value: "los", label: "onu.status.los" }]),
        });
    });
});
