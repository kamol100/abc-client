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
