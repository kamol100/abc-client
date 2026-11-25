// GET /monitoring/summary. Port monitoring fields (counts.pon_ports_down, counts.uplinks_down, ports_down,
// port_monitoring, open_outages[].port) are absent on older APIs.

type NameRef = { name: string } | null;

export type NotPolledReason = "polling_off" | "no_access" | "stale" | "failing";

export interface NocPortDown {
    olt_id: string;
    olt_name: string;
    port_type: "pon" | "uplink";
    port_id: number;
    name: string;
    down_since: string | null;
    onu_total: number | null;
    affected_clients: number;
    incident_id: string | null;
    acknowledged: boolean;
}

export interface NocNotPolled {
    olt_id: string;
    olt_name: string;
    reason: NotPolledReason | string;
    last_polled_at: string | null;
}

export interface NocSummary {
    generated_at: string;
    counts: { down: number; unknown: number; up: number; open_outages: number; pon_ports_down?: number; uplinks_down?: number };
    maintenance: { id: string; device: NameRef; network: NameRef; starts_at: string; ends_at: string; reason: string | null }[];
    down_devices: {
        id: string;
        name: string;
        category: string;
        network: NameRef;
        zone: NameRef;
        device_ip: string | null;
        latitude: number | null;
        longitude: number | null;
        down_since: string | null;
        affected_clients: number | null;
        in_maintenance: boolean;
        is_olt: boolean;
    }[];
    open_outages: {
        id: string;
        title: string;
        device_id: string | null;
        /** device_down | router_unreachable | pon_port_down | uplink_down */
        type: string;
        started_at: string;
        affected_clients: number | null;
        acknowledged: boolean;
        ticket: { id: string; number: number | string } | null;
        during_maintenance: boolean;
        downstream: boolean;
        port?: { type: "pon" | "uplink"; id: number; name: string } | null;
        /** The nearest down ancestor's device, set on downstream outages. */
        parent_device_id?: string | null;
    }[];
    ports_down?: NocPortDown[];
    port_monitoring?: { olts_total: number; olts_polled: number; not_polled: NocNotPolled[] };
}

const REASONS: readonly string[] = ["polling_off", "no_access", "stale", "failing"];

/** noc.not_polled.reasons.<key>; an unknown reason falls back to "stale" (data out of date). */
export const notPolledReasonKey = (reason: string | null | undefined): NotPolledReason =>
    reason && REASONS.includes(reason) ? (reason as NotPolledReason) : "stale";

/** Port incidents get a type badge on the outage list; device incidents keep none. */
export const isPortOutage = (type: string): type is "pon_port_down" | "uplink_down" =>
    type === "pon_port_down" || type === "uplink_down";

export type NocOutage = NocSummary["open_outages"][number];
export type NocDownDevice = NocSummary["down_devices"][number];
/** "outage" = an open outage with no down device or port behind it, e.g. a network the app server cannot reach. */
export type NocKind = "device" | "olt" | "pon" | "uplink" | "outage";
export const NOC_FILTERS = ["all", "device", "olt", "pon", "uplink"] as const;
export type NocFilter = (typeof NOC_FILTERS)[number];

/** One NOC card: a down device, OLT or port, or an unmatched open outage. */
export interface NocDownItem {
    key: string;
    kind: NocKind;
    since: string | null;
    clients: number;
    /** This item's own open outage (acknowledged, ticket). */
    outage: NocOutage | null;
    /** Downstream outages this item cuts off. */
    behind: NocOutage[];
    device?: NocDownDevice;
    port?: NocPortDown;
}

/** Every down thing as one card, most clients first, then longest down. Each open outage shows once. */
export function nocDownItems(summary: NocSummary): NocDownItem[] {
    const outages = summary.open_outages;
    const used = new Set<string>();
    const take = (outage: NocOutage | undefined) => {
        if (outage) used.add(outage.id);
        return outage ?? null;
    };

    const devices = summary.down_devices.map((device): NocDownItem => {
        const behind = outages.filter((o) => o.downstream && o.parent_device_id === device.id);
        behind.forEach((o) => used.add(o.id));
        return {
            key: `device-${device.id}`,
            kind: device.is_olt ? "olt" : "device",
            since: device.down_since,
            clients: device.affected_clients ?? 0,
            outage: take(outages.find((o) => !o.downstream && !o.port && o.device_id === device.id)),
            behind,
            device,
        };
    });
    // Deeper levels (router → OLT → switch): an outage under a downstream device joins that device's card.
    for (let added = true; added; ) {
        added = false;
        for (const o of outages) {
            if (used.has(o.id) || !o.downstream || !o.parent_device_id) continue;
            const card = devices.find((d) => d.behind.some((b) => b.device_id === o.parent_device_id));
            if (card) {
                card.behind.push(o);
                used.add(o.id);
                added = true;
            }
        }
    }
    const ports = (summary.ports_down ?? []).map(
        (port): NocDownItem => ({
            key: `${port.port_type}-${port.port_id}`,
            kind: port.port_type,
            since: port.down_since,
            clients: port.affected_clients ?? 0,
            outage: take(outages.find((o) => o.port?.type === port.port_type && o.port.id === port.port_id)),
            behind: [],
            port,
        }),
    );
    const rest = outages
        .filter((o) => !used.has(o.id))
        .map(
            (outage): NocDownItem => ({
                key: `outage-${outage.id}`,
                kind: "outage",
                since: outage.started_at,
                clients: outage.affected_clients ?? 0,
                outage,
                behind: [],
            }),
        );

    const time = (since: string | null) => (since ? Date.parse(since) || Infinity : Infinity);
    return [...devices, ...ports, ...rest].sort((a, b) => b.clients - a.clients || time(a.since) - time(b.since));
}

export const matchesNocFilter = (item: NocDownItem, filter: NocFilter) => filter === "all" || item.kind === filter;
