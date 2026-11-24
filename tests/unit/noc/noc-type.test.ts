import { describe, expect, it } from "vitest";
import en from "@/public/lang/en.json";
import { isPortOutage, notPolledReasonKey } from "@/components/noc/noc-type";

describe("notPolledReasonKey", () => {
    it("keeps known reasons and falls back to out of date", () => {
        expect(notPolledReasonKey("polling_off")).toBe("polling_off");
        expect(notPolledReasonKey("no_access")).toBe("no_access");
        expect(notPolledReasonKey("failing")).toBe("failing");
        expect(notPolledReasonKey("stale")).toBe("stale");
        expect(notPolledReasonKey("something_new")).toBe("stale");
        expect(notPolledReasonKey(null)).toBe("stale");
    });

    it("has a label for every reason", () => {
        for (const reason of ["polling_off", "no_access", "stale", "failing"] as const) {
            expect(en.noc.not_polled.reasons[reason]).toBeTruthy();
        }
    });
});

describe("isPortOutage", () => {
    it("matches only the port incident types, which have labels", () => {
        expect(isPortOutage("pon_port_down")).toBe(true);
        expect(isPortOutage("uplink_down")).toBe(true);
        expect(isPortOutage("device_down")).toBe(false);
        expect(en.monitoring.outage_type.pon_port_down).toBe("PON port down");
        expect(en.monitoring.outage_type.uplink_down).toBe("Uplink down");
    });
});
