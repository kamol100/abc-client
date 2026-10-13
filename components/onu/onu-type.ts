// ONU payloads (GET /onus, PUT /onus/{id}, POST /onus/{id}/reboot, the client page's `onus`).
// `id` is the ONU uuid; `olt.id` and `client.id` are uuids as well.

export const ONU_STATUSES = ["online", "offline", "los", "dying_gasp", "unknown"] as const;
export type OnuStatus = (typeof ONU_STATUSES)[number];

/** How the client is bound: auto (inventory serial/MAC), manual (staff picked), none (staff unbound). */
export type OnuClientBinding = "auto" | "manual" | "none";

export interface OnuRef {
    id: string;
    name: string;
}

export interface OnuRow {
    id: string;
    olt: OnuRef | null;
    pon_port: { id: number; name: string } | null;
    onu_index?: number | null;
    /** "EPON0/1:4" */
    name: string;
    label?: string | null;
    serial: string | null;
    mac: string | null;
    description?: string | null;
    status: OnuStatus;
    rx_power_dbm: number | null;
    tx_power_dbm?: number | null;
    olt_rx_power_dbm?: number | null;
    distance_m: number | null;
    rx_low?: boolean;
    rx_low_since?: string | null;
    last_online_at: string | null;
    last_offline_at: string | null;
    last_down_cause?: string | null;
    polled_at: string | null;
    /** Null when unbound, or bound to a client outside the user's reseller scope (`client_bound` says which). */
    client: { id: string; name: string; pppoe_username?: string | null; phone?: string | null } | null;
    client_bound?: boolean;
    client_binding?: OnuClientBinding | null;
    /** false: the status is from an old poll (OLT down / not polled lately / never polled); show "Unknown". */
    status_known?: boolean;
    status_unknown_reason?: "olt_down" | "stale" | "never_polled" | null;
    /** When the status was read, if the API sends it (else `polled_at`). */
    status_as_of?: string | null;
}

/** The ONU block on the client page (GET /clients/{id} → `onus`). */
export type OnuSummary = Pick<OnuRow, "id" | "olt" | "name" | "serial" | "mac" | "status" | "rx_power_dbm"> &
    Partial<Pick<OnuRow, "label" | "pon_port" | "olt_rx_power_dbm" | "tx_power_dbm" | "distance_m" | "rx_low" | "last_down_cause" | "last_online_at" | "last_offline_at" | "polled_at" | "client_binding" | "status_known" | "status_unknown_reason" | "status_as_of">>;

/** The ONU's display name: the API label, else its name. */
export function onuLabel(onu: Pick<OnuRow, "name"> & { label?: string | null }): string {
    return onu.label || onu.name;
}

/** What identifies the ONU physically: GPON serial, else EPON MAC. */
export function onuIdentity(onu: Pick<OnuRow, "serial" | "mac">): string | null {
    return onu.serial || onu.mac || null;
}

export function isOnuStatus(value: unknown): value is OnuStatus {
    return typeof value === "string" && (ONU_STATUSES as readonly string[]).includes(value);
}
