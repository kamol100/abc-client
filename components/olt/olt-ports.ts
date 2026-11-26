// Pure helpers for the OLT page's Ports section (PON + uplink tables) and the port history drawer.

import { toDate } from "@/components/monitoring/monitoring-format";
import type { OltPonPort, OltUplinkPort } from "./olt-type";

export type PortStatus = "up" | "link_down" | "disabled" | "unknown";

/** Disabled by the operator wins over the link state. */
export function portStatus(port: Pick<OltPonPort, "admin_state" | "oper_state">): PortStatus {
    if (port.admin_state === "down") return "disabled";
    if (port.oper_state === "down") return "link_down";
    if (port.oper_state === "up") return "up";
    return "unknown";
}

export const isProblemPort = (port: Pick<OltPonPort, "admin_state" | "oper_state">): boolean =>
    portStatus(port) === "link_down" || portStatus(port) === "disabled";

/** Counts per status, for "14 up · 1 link down · 1 disabled". */
export function portCounts(ports: Pick<OltPonPort, "admin_state" | "oper_state">[]): Record<PortStatus, number> {
    const counts: Record<PortStatus, number> = { up: 0, link_down: 0, disabled: 0, unknown: 0 };
    ports.forEach((port) => counts[portStatus(port)]++);
    return counts;
}

const STATUS_ORDER: PortStatus[] = ["up", "link_down", "disabled", "unknown"];

/** The non-zero counts in a fixed order (empty for no ports). */
export function portSummaryParts(ports: Pick<OltPonPort, "admin_state" | "oper_state">[]): { status: PortStatus; count: number }[] {
    const counts = portCounts(ports);
    return STATUS_ORDER.filter((status) => counts[status] > 0).map((status) => ({ status, count: counts[status] }));
}

const trim = (value: number) => (value < 10 ? Number(value.toFixed(1)) : Math.round(value)).toString();

/** "120 Mbps", "8.4 Mbps", "1.2 Gbps"; "—" when unknown. Decimal units, like interface counters. */
export function formatBps(bps: number | null | undefined): string {
    if (bps == null || !Number.isFinite(Number(bps))) return "—";
    const value = Math.max(0, Number(bps));
    for (const [unit, size] of [["Tbps", 1e12], ["Gbps", 1e9], ["Mbps", 1e6], ["Kbps", 1e3]] as const) {
        if (value >= size) return `${trim(value / size)} ${unit}`;
    }
    return `${Math.round(value)} bps`;
}

/** Link speed: 10000 → "10 Gbps", 100 → "100 Mbps". */
export const formatSpeed = (mbps: number | null | undefined): string =>
    mbps == null || Number(mbps) <= 0 ? "—" : formatBps(Number(mbps) * 1e6);

/** Share of the link speed in use, 0–100 (null without both numbers). */
export function pctOfSpeed(bps: number | null | undefined, mbps: number | null | undefined): number | null {
    if (bps == null || mbps == null || Number(mbps) <= 0) return null;
    return Math.min(100, Math.round((Number(bps) / (Number(mbps) * 1e6)) * 100));
}

export const formatTemp = (celsius: number | null | undefined): string =>
    celsius == null ? "—" : `${Number(celsius).toFixed(1)} °C`;

export type PortSortKey = "name" | "status" | "down_since" | "onus" | "clients" | "traffic";
export interface PortSort {
    key: PortSortKey;
    desc: boolean;
}

type SortablePort = (OltPonPort | OltUplinkPort) & Partial<Pick<OltPonPort, "onu_total" | "affected_clients">>;

const nameCollator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });

function sortValue(port: SortablePort, key: PortSortKey): number | string | null {
    switch (key) {
        case "name":
            return port.port_index ?? port.name;
        case "status":
            // Problems first when ascending.
            return ["link_down", "disabled", "unknown", "up"].indexOf(portStatus(port));
        case "down_since": {
            // Longest down (oldest time) first when ascending; ports that are up have none.
            const date = isProblemPort(port) ? toDate(port.down_since) : null;
            return date ? date.getTime() : null;
        }
        case "onus":
            return port.onu_total ?? null;
        case "clients":
            return port.affected_clients ?? null;
        case "traffic":
            return port.in_bps == null && port.out_bps == null ? null : Number(port.in_bps ?? 0) + Number(port.out_bps ?? 0);
    }
}

/** A sorted copy; ports without a value stay last in both directions. `null` sort keeps the API order. */
export function sortPorts<T extends SortablePort>(ports: T[], sort: PortSort | null): T[] {
    if (!sort) return ports;
    return [...ports].sort((a, b) => {
        const left = sortValue(a, sort.key);
        const right = sortValue(b, sort.key);
        if (left == null || right == null) return left == null ? (right == null ? 0 : 1) : -1;
        const order =
            typeof left === "string" || typeof right === "string"
                ? nameCollator.compare(String(left), String(right))
                : left - right;
        return sort.desc ? -order : order;
    });
}

/** Click on a header: ascending, then descending, then back to the API order. */
export function nextSort(current: PortSort | null, key: PortSortKey): PortSort | null {
    if (current?.key !== key) return { key, desc: false };
    return current.desc ? null : { key, desc: true };
}

/** A history event's state as a status label key: up / link_down / disabled / unknown. */
export function eventStatus(state: string | null | undefined): PortStatus {
    if (state === "up") return "up";
    if (state === "down" || state === "link_down") return "link_down";
    if (state === "disabled" || state === "admin_down") return "disabled";
    return "unknown";
}
