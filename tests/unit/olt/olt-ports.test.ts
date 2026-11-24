import { describe, expect, it } from "vitest";
import {
    eventStatus,
    formatBps,
    formatSpeed,
    formatTemp,
    isProblemPort,
    nextSort,
    pctOfSpeed,
    portStatus,
    portSummaryParts,
    sortPorts,
} from "@/components/olt/olt-ports";
import type { OltPonPort } from "@/components/olt/olt-type";

const port = (id: number, overrides: Partial<OltPonPort> = {}): OltPonPort => ({
    id,
    name: `EPON0/${id}`,
    oper_state: "up",
    onu_total: 0,
    onu_online: 0,
    ...overrides,
});

describe("portStatus", () => {
    it("maps admin and oper state to one label, disabled first", () => {
        expect(portStatus({ admin_state: "down", oper_state: "down" })).toBe("disabled");
        expect(portStatus({ admin_state: "up", oper_state: "down" })).toBe("link_down");
        expect(portStatus({ oper_state: "up" })).toBe("up");
        expect(portStatus({ oper_state: null })).toBe("unknown");
        expect(portStatus({ oper_state: "unknown" })).toBe("unknown");
    });

    it("counts link down and disabled as problems", () => {
        expect(isProblemPort({ oper_state: "down" })).toBe(true);
        expect(isProblemPort({ admin_state: "down", oper_state: "up" })).toBe(true);
        expect(isProblemPort({ oper_state: "up" })).toBe(false);
        expect(isProblemPort({ oper_state: null })).toBe(false);
    });

    it("maps history states to plain labels", () => {
        expect(eventStatus("up")).toBe("up");
        expect(eventStatus("down")).toBe("link_down");
        expect(eventStatus("admin_down")).toBe("disabled");
        expect(eventStatus(null)).toBe("unknown");
    });
});

describe("portSummaryParts", () => {
    it("lists the non-zero counts in a fixed order", () => {
        const ports = [
            ...Array.from({ length: 14 }, (_, index) => port(index)),
            port(20, { oper_state: "down" }),
            port(21, { admin_state: "down" }),
        ];
        expect(portSummaryParts(ports)).toEqual([
            { status: "up", count: 14 },
            { status: "link_down", count: 1 },
            { status: "disabled", count: 1 },
        ]);
        expect(portSummaryParts([])).toEqual([]);
    });
});

describe("formatters", () => {
    it("formats bits per second with decimal units", () => {
        expect(formatBps(120_000_000)).toBe("120 Mbps");
        expect(formatBps(8_400_000)).toBe("8.4 Mbps");
        expect(formatBps(1_250_000_000)).toBe("1.3 Gbps");
        expect(formatBps(2_000)).toBe("2 Kbps");
        expect(formatBps(512)).toBe("512 bps");
        expect(formatBps(0)).toBe("0 bps");
        expect(formatBps(null)).toBe("—");
        expect(formatBps(undefined)).toBe("—");
    });

    it("formats link speed, usage share and temperature", () => {
        expect(formatSpeed(10_000)).toBe("10 Gbps");
        expect(formatSpeed(1_000)).toBe("1 Gbps");
        expect(formatSpeed(2_500)).toBe("2.5 Gbps");
        expect(formatSpeed(100)).toBe("100 Mbps");
        expect(formatSpeed(null)).toBe("—");
        expect(formatSpeed(0)).toBe("—");
        expect(pctOfSpeed(250_000_000, 1_000)).toBe(25);
        expect(pctOfSpeed(5e9, 1_000)).toBe(100);
        expect(pctOfSpeed(250_000_000, null)).toBeNull();
        expect(pctOfSpeed(null, 1_000)).toBeNull();
        expect(formatTemp(41.25)).toBe("41.3 °C");
        expect(formatTemp(null)).toBe("—");
    });
});

describe("sortPorts", () => {
    const ports = [
        port(1, { name: "EPON0/10", port_index: 10, onu_total: 5, in_bps: 10 }),
        port(2, { name: "EPON0/2", port_index: 2, oper_state: "down", down_since: "2026-11-23T10:00:00Z", onu_total: 9 }),
        port(3, { name: "EPON0/3", port_index: 3, admin_state: "down", down_since: "2026-11-20T10:00:00Z", onu_total: 1, in_bps: 50, out_bps: 50 }),
    ];
    const ids = (list: OltPonPort[]) => list.map((item) => item.id);

    it("keeps the API order without a sort", () => {
        expect(sortPorts(ports, null)).toBe(ports);
    });

    it("sorts by index, status, down since and counts", () => {
        expect(ids(sortPorts(ports, { key: "name", desc: false }))).toEqual([2, 3, 1]);
        expect(ids(sortPorts(ports, { key: "status", desc: false }))).toEqual([2, 3, 1]);
        expect(ids(sortPorts(ports, { key: "down_since", desc: false }))).toEqual([3, 2, 1]);
        expect(ids(sortPorts(ports, { key: "onus", desc: true }))).toEqual([2, 1, 3]);
    });

    it("keeps ports without a value last in both directions", () => {
        expect(ids(sortPorts(ports, { key: "traffic", desc: false }))).toEqual([1, 3, 2]);
        expect(ids(sortPorts(ports, { key: "traffic", desc: true }))).toEqual([3, 1, 2]);
        expect(ids(sortPorts(ports, { key: "down_since", desc: true }))).toEqual([2, 3, 1]);
    });

    it("sorts names naturally without a port index", () => {
        const named = [port(1, { name: "PON 10" }), port(2, { name: "PON 2" })];
        expect(ids(sortPorts(named, { key: "name", desc: false }))).toEqual([2, 1]);
    });

    it("cycles ascending, descending, then off", () => {
        expect(nextSort(null, "name")).toEqual({ key: "name", desc: false });
        expect(nextSort({ key: "name", desc: false }, "name")).toEqual({ key: "name", desc: true });
        expect(nextSort({ key: "name", desc: true }, "name")).toBeNull();
        expect(nextSort({ key: "name", desc: true }, "status")).toEqual({ key: "status", desc: false });
    });

    it("filters to problems", () => {
        expect(ids(ports.filter(isProblemPort))).toEqual([2, 3]);
    });
});
