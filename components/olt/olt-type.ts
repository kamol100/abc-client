import { z } from "zod";
import type { MonitorState } from "@/components/monitoring/monitoring-type";

// API payloads (contract: GET /olts, /olts/{id}, /olts/{id}/clients, GET|PUT /olts/{id}/access).
// `id` is always the device uuid.

type NameRef = { name: string } | null;

export interface OltRow {
    id: string;
    name: string;
    device_ip: string | null;
    vendor: string | null;
    model: string | null;
    network: NameRef;
    zone: NameRef;
    monitor_enabled: boolean;
    monitor_state: MonitorState;
    state_changed_at: string | null;
    last_checked_at: string | null;
    last_rtt_ms: number | null;
    uptime_24h: number | null;
    clients_total: number;
    onus_total: number;
    onus_online: number;
}

export interface OltAccess {
    configured: boolean;
    host?: string | null;
    snmp_version?: string | null;
    snmp_port?: number;
    cli_protocol?: "telnet" | "ssh" | null;
    cli_port?: number | null;
    cli_username?: string | null;
    has_snmp_community?: boolean;
    has_cli_password?: boolean;
    last_poll_at?: string | null;
    last_poll_error?: string | null;
}

export type AttentionReason =
    | "los"
    | "dying_gasp"
    | "offline"
    | "disabled"
    | "low_signal"
    | "near_limit"
    | "too_strong";

export interface OltAttentionItem {
    client: { id: string; name: string; pppoe_username: string | null; phone: string | null };
    onu: { name: string; status: string } | null;
    reason: AttentionReason;
    rx_power_dbm: number | null;
    since: string | null;
}

export interface OltPonPort {
    id: number;
    name: string;
    oper_state: "up" | "down" | null;
    onu_total: number;
    onu_online: number;
}

export interface OltDetail {
    olt: Omit<OltRow, "uptime_24h" | "clients_total" | "onus_total" | "onus_online"> & {
        latitude: number | null;
        longitude: number | null;
        last_loss_pct: number | null;
        check_interval_minutes: number | null;
    };
    monitoring: {
        uptime_24h: number | null;
        bars: { start: string; end: string; state: "up" | "down" | "none"; down_seconds: number }[];
    };
    clients: { total: number; online: number; offline: number; disabled: number };
    onus: { total: number; online: number; los: number; dying_gasp: number; offline: number };
    optical: { threshold_dbm: number; low: number; near_limit: number; too_strong: number };
    billing: { due_total: number; clients_with_due: number; expired: number; due_this_week: number };
    pon_ports: OltPonPort[];
    access: OltAccess;
    attention: OltAttentionItem[];
}

export interface OltClientRow {
    id: string;
    sid: string | number | null;
    name: string;
    pppoe_username: string | null;
    phone: string | null;
    /** The client list's own status values: 1 active, 0 inactive. */
    status: string | number | null;
    online: boolean;
    package: NameRef;
    termination_date: string | null;
    /** Day of the month, as in the client list. */
    payment_deadline: string | number | null;
    due_amount: number | null;
    onu: {
        name: string;
        status: string;
        rx_power_dbm: number | null;
        mac: string | null;
        distance_m: number | null;
        last_online_at: string | null;
        last_offline_at: string | null;
        pon_port_id: number | null;
    } | null;
}

export function isInactiveClient(status: OltClientRow["status"]): boolean {
    return status === 0 || status === "0" || status === "inactive";
}

const optionalSecret = z.string().max(255, { message: "olt.access.errors.max" }).optional();

/** PUT /olts/{id}/access. Empty secrets keep the saved value; the first save needs a community. */
export const buildOltAccessSchema = (requireCommunity: boolean) =>
    z.object({
        snmp_version: z.enum(["v2c"], { required_error: "olt.access.errors.snmp_version" }),
        snmp_community: requireCommunity
            ? z.string({ required_error: "olt.access.errors.community_required" })
                  .min(1, { message: "olt.access.errors.community_required" })
                  .max(255, { message: "olt.access.errors.max" })
            : optionalSecret,
        cli_protocol: z.enum(["telnet", "ssh"]).nullable().optional(),
        cli_username: z.string().max(255, { message: "olt.access.errors.max" }).nullable().optional(),
        cli_password: optionalSecret,
    });
