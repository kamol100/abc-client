import { describe, expect, it } from "vitest";
import en from "@/public/lang/en.json";
import { isPortOutage, matchesNocFilter, nocDownItems, notPolledReasonKey, type NocOutage, type NocSummary } from "@/components/noc/noc-type";

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

describe("nocDownItems", () => {
    const outage = (id: string, extra: Partial<NocOutage>): NocOutage => ({
        id,
        title: id,
        device_id: null,
        type: "device_down",
        started_at: "2026-11-25T10:00:00Z",
        affected_clients: 0,
        acknowledged: false,
        ticket: null,
        during_maintenance: false,
        downstream: false,
        port: null,
        parent_device_id: null,
        ...extra,
    });
    const device = (id: string, clients: number, is_olt = false) => ({
        id,
        name: id,
        category: is_olt ? "olt" : "router",
        network: null,
        zone: null,
        device_ip: null,
        latitude: null,
        longitude: null,
        down_since: "2026-11-25T09:00:00Z",
        affected_clients: clients,
        in_maintenance: false,
        is_olt,
    });
    const summary: NocSummary = {
        generated_at: "2026-11-25T10:30:00Z",
        counts: { down: 2, unknown: 0, up: 5, open_outages: 4 },
        maintenance: [],
        down_devices: [device("r1", 10), device("o1", 40, true)],
        ports_down: [
            { olt_id: "o2", olt_name: "OLT 2", port_type: "pon", port_id: 7, name: "EPON0/3", down_since: null, onu_total: 12, affected_clients: 20, incident_id: "p", acknowledged: true },
        ],
        open_outages: [
            outage("r1-out", { device_id: "r1" }),
            outage("sw-out", { device_id: "sw", downstream: true, parent_device_id: "r1" }),
            outage("p-out", { type: "pon_port_down", device_id: "o2", port: { type: "pon", id: 7, name: "EPON0/3" }, acknowledged: true }),
            outage("net-out", { type: "router_unreachable", affected_clients: 5 }),
        ],
    };

    it("makes one card per down thing, most clients first, and shows each outage once", () => {
        const items = nocDownItems(summary);
        expect(items.map((i) => [i.key, i.kind, i.outage?.id ?? null])).toEqual([
            ["device-o1", "olt", null],
            ["pon-7", "pon", "p-out"],
            ["device-r1", "device", "r1-out"],
            ["outage-net-out", "outage", "net-out"],
        ]);
        expect(items[2].behind.map((o) => o.id)).toEqual(["sw-out"]);
    });

    it("puts outages several levels down on the top device's card", () => {
        const deep = { ...summary, open_outages: [...summary.open_outages, outage("onu-out", { device_id: "onu", downstream: true, parent_device_id: "sw" })] };
        const items = nocDownItems(deep);
        expect(items.find((i) => i.key === "device-r1")?.behind.map((o) => o.id)).toEqual(["sw-out", "onu-out"]);
        expect(items).toHaveLength(4);
    });

    it("filters by kind", () => {
        const items = nocDownItems(summary);
        expect(items.filter((i) => matchesNocFilter(i, "pon"))).toHaveLength(1);
        expect(items.filter((i) => matchesNocFilter(i, "all"))).toHaveLength(4);
        for (const key of ["device", "olt", "pon", "uplink"] as const) expect(en.noc.kind[key]).toBeTruthy();
    });
});
