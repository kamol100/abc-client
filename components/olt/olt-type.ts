import { z } from "zod";
import type { MonitorState } from "@/components/monitoring/monitoring-type";
import type { OltTestResult } from "./olt-test-result";
import type { OnuDataFreshness } from "@/components/onu/onu-freshness";

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
    /** How current `onus_online` is (last polled count when not fresh). */
    onu_data?: OnuDataFreshness | null;
    /** Phase 3: access state for the list's warning icon. */
    access?: {
        configured: boolean;
        last_poll_at: string | null;
        last_poll_failed?: boolean;
        /** Only for users with olts.access-settings. */
        last_poll_error?: string | null;
        last_test_ok: boolean | null;
    } | null;
}

export type SnmpVersion = "v2c" | "v3";

/**
 * GET|PUT /olts/{id}/access and GET /olts/{id} → `access`. Exactly `{ configured: false }` without access.
 * Users without olts.access-settings get the restricted shape: only `configured`, `restricted` and the
 * status fields (last_poll_*, last_test_at/ok, retest_required); everything else is absent.
 */
export interface OltAccess {
    configured: boolean;
    /** True when the settings part (host, snmp_*, cli_*, has_*, last_poll_error, last_test) was left out. */
    restricted?: boolean;
    last_poll_failed?: boolean;
    /** Translation key when the app wrote a generic poll error (olt.poll.retest_required | internal_error | job_stopped | failed). */
    last_poll_error_key?: string | null;
    last_test_at?: string | null;
    last_test_ok?: boolean | null;
    /** Last successful poll. */
    last_poll_ok_at?: string | null;
    /** The Device IP changed: polling, Poll now and ONU reboot are paused until a Test connection passes. */
    retest_required?: boolean;
    host?: string | null;
    snmp_version?: SnmpVersion | null;
    snmp_port?: number;
    snmp_v3_user?: string | null;
    snmp_v3_auth_protocol?: string | null;
    snmp_v3_priv_protocol?: string | null;
    has_snmp_community?: boolean;
    has_snmp_v3_auth_pass?: boolean;
    has_snmp_v3_priv_pass?: boolean;
    cli_protocol?: "telnet" | "ssh" | null;
    cli_port?: number | null;
    cli_username?: string | null;
    has_cli_password?: boolean;
    has_cli_enable_password?: boolean;
    /** SSH host key pinned on the first SSH login. */
    cli_host_key?: string | null;
    last_poll_at?: string | null;
    last_poll_error?: string | null;
    /** The last "Test connection" result, null if never tested. */
    last_test?: OltTestResult | null;
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
    onu: { id?: string; name: string; status: string } | null;
    reason: AttentionReason;
    rx_power_dbm: number | null;
    since: string | null;
}

export interface OltPonPort {
    id: number;
    port_index?: number;
    name: string;
    admin_state?: "up" | "down" | "unknown" | null;
    oper_state: "up" | "down" | "unknown" | null;
    onu_total: number;
    onu_online: number;
    polled_at?: string | null;
}

export interface OltDetail {
    olt: Omit<OltRow, "uptime_24h" | "clients_total" | "onus_total" | "onus_online"> & {
        latitude: number | null;
        longitude: number | null;
        /** Failed checks in a row; > 0 while still "up" = not answering, marked down at `fail_threshold`. */
        consecutive_failures?: number | null;
        fail_threshold?: number | null;
        last_loss_pct: number | null;
        check_interval_minutes: number | null;
        /** False while the company's automatic check interval is off, whatever `monitor_enabled` says. */
        automatic_checks: boolean;
    };
    monitoring: {
        uptime_24h: number | null;
        bars: { start: string; end: string; state: "up" | "down" | "none"; down_seconds: number }[];
    };
    /** online/offline are null while the ONU data is not fresh; `unknown` = active clients then (0 when fresh). */
    clients: { total: number; online: number | null; offline: number | null; disabled: number; unknown?: number };
    onus: { total: number; online: number; los: number; dying_gasp: number; offline: number };
    optical: { threshold_dbm: number; low: number; near_limit: number; too_strong: number };
    billing: { due_total: number; clients_with_due: number; expired: number; due_this_week: number };
    pon_ports: OltPonPort[];
    access: OltAccess;
    attention: OltAttentionItem[];
    /** How current the ONU/PON/optical numbers are (false while the OLT is down or not polled). */
    onu_data?: OnuDataFreshness | null;
}

export interface OltClientRow {
    id: string;
    sid: string | number | null;
    name: string;
    pppoe_username: string | null;
    phone: string | null;
    /** The client list's own status values: 1 active, 0 inactive. */
    status: string | number | null;
    /** null when the ONU data is not current (OLT down, stale, never polled): show "Unknown". */
    online: boolean | null;
    package: NameRef;
    termination_date: string | null;
    /** Day of the month, as in the client list. */
    payment_deadline: string | number | null;
    due_amount: number | null;
    onu: {
        id?: string;
        name: string;
        status: string;
        client_binding?: "auto" | "manual" | "none" | null;
        /** false while the OLT's ONU data is not fresh (status is the last polled value). */
        status_known?: boolean;
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

/** Credentials are printable ASCII only (no line breaks), like the API's /^[\x20-\x7E]*$/. */
export const PRINTABLE_ASCII = /^[\x20-\x7E]*$/;
/** The SNMP community: printable ASCII without spaces, at most 64 (API rule on both forms). */
export const SNMP_COMMUNITY = /^[\x21-\x7E]*$/;
const printable = { message: "olt.access.errors.printable" };

const optionalSecret = z
    .string()
    .max(255, { message: "olt.access.errors.max" })
    .regex(PRINTABLE_ASCII, printable)
    .nullable()
    .optional();
const passphrase = z
    .string()
    .max(64, { message: "olt.access.errors.max_64" })
    .regex(PRINTABLE_ASCII, printable)
    .refine((value) => value === "" || value.length >= 8, { message: "olt.access.errors.passphrase_min" })
    .nullable()
    .optional();

/** POST /olts/{id}/access/detect-community: the community read from the OLT's configuration (saved when ok). */
export interface DetectCommunityResult {
    ok: boolean;
    /** not_found | not_supported_vendor | command_failed | cli_login_failed (null when ok). */
    reason?: string | null;
    /** olt.community.<detected | reason>. */
    message?: string | null;
    message_key?: string | null;
    params?: Record<string, unknown> | null;
    /** ro | rw of the community found. */
    access_type?: string | null;
    /** A different saved community was overwritten. */
    replaced?: boolean;
}

/** What is already stored (secrets are never returned, only these flags). */
type StoredSecrets = Pick<OltAccess, "has_snmp_community" | "has_snmp_v3_auth_pass" | "has_cli_password">;

/**
 * PUT /olts/{id}/access. Empty secrets keep the saved value, so a secret is only required when none is
 * stored: the community for v2c without a CLI login, the auth passphrase for v3, the CLI password once a
 * protocol is chosen.
 */
export const buildOltAccessSchema = (stored: StoredSecrets = {}) =>
    z
        .object({
            snmp_version: z.enum(["v2c", "v3"], { required_error: "olt.access.errors.snmp_version" }),
            // Printable ASCII without spaces, like the API.
            snmp_community: z
                .string()
                .max(64, { message: "olt.access.errors.max_64" })
                .regex(SNMP_COMMUNITY, { message: "olt.access.errors.community_chars" })
                .nullable()
                .optional(),
            snmp_v3_user: z.string().max(64, { message: "olt.access.errors.max_64" }).regex(PRINTABLE_ASCII, printable).nullable().optional(),
            snmp_v3_auth_protocol: z.enum(["MD5", "SHA", "SHA256", "SHA512"]).nullable().optional(),
            snmp_v3_auth_pass: passphrase,
            snmp_v3_priv_protocol: z.enum(["DES", "AES"]).nullable().optional(),
            snmp_v3_priv_pass: passphrase,
            cli_protocol: z.enum(["telnet", "ssh"]).nullable().optional(),
            cli_username: z.string().max(100, { message: "olt.access.errors.max_100" }).regex(PRINTABLE_ASCII, printable).nullable().optional(),
            cli_password: optionalSecret,
            cli_enable_password: optionalSecret,
            reset_host_key: z.boolean().optional(),
        })
        .superRefine((value, ctx) => {
            const missing = (field: string, message: string) => ctx.addIssue({ code: "custom", path: [field], message });
            // With a CLI login the community may stay empty: the app reads it from the OLT's configuration
            // (BDCOM, VSOL) during Test connection / Detect from OLT.
            if (value.snmp_version === "v2c" && !value.snmp_community && !stored.has_snmp_community && !value.cli_protocol) {
                missing("snmp_community", "olt.access.errors.community_required_without_cli");
            }
            if (value.snmp_version === "v3") {
                if (!value.snmp_v3_user) missing("snmp_v3_user", "olt.access.errors.v3_user_required");
                if (!value.snmp_v3_auth_pass && !stored.has_snmp_v3_auth_pass) {
                    missing("snmp_v3_auth_pass", "olt.access.errors.v3_auth_pass_required");
                }
            }
            if (value.cli_protocol) {
                if (!value.cli_username) missing("cli_username", "olt.access.errors.cli_username_required");
                if (!value.cli_password && !stored.has_cli_password) {
                    missing("cli_password", "olt.access.errors.cli_password_required");
                }
            }
        });

/** Form values from the saved access: never the secrets (empty = keep). */
export function toAccessFormValues(access: OltAccess, protocolOverride?: "telnet" | "ssh" | null): Record<string, unknown> {
    return {
        snmp_version: access.snmp_version ?? "v2c",
        snmp_community: "",
        snmp_v3_user: access.snmp_v3_user ?? "",
        snmp_v3_auth_protocol: access.snmp_v3_auth_protocol ?? "SHA",
        snmp_v3_auth_pass: "",
        snmp_v3_priv_protocol: access.snmp_v3_priv_protocol ?? "AES",
        snmp_v3_priv_pass: "",
        cli_protocol: protocolOverride ?? access.cli_protocol ?? null,
        cli_username: access.cli_username ?? "",
        cli_password: "",
        cli_enable_password: "",
        reset_host_key: false,
    };
}

const SECRET_FIELDS = ["snmp_community", "snmp_v3_auth_pass", "snmp_v3_priv_pass", "cli_password", "cli_enable_password"];

/**
 * The PUT body from the form values: only the fields of the chosen SNMP version and CLI protocol, and no
 * empty secrets (missing = keep the stored one). The privacy protocol is sent only with a privacy passphrase.
 */
export function toAccessPayload(
    values: Record<string, unknown>,
    stored: Pick<OltAccess, "has_snmp_v3_priv_pass"> = {}
): Record<string, unknown> {
    const v3 = values.snmp_version === "v3";
    const cli = values.cli_protocol === "telnet" || values.cli_protocol === "ssh";
    const payload: Record<string, unknown> = { snmp_version: v3 ? "v3" : "v2c" };

    if (v3) {
        payload.snmp_v3_user = values.snmp_v3_user ?? "";
        payload.snmp_v3_auth_protocol = values.snmp_v3_auth_protocol || "SHA";
        payload.snmp_v3_auth_pass = values.snmp_v3_auth_pass;
        const priv = !!values.snmp_v3_priv_pass || !!stored.has_snmp_v3_priv_pass;
        payload.snmp_v3_priv_protocol = priv ? values.snmp_v3_priv_protocol || "AES" : null;
        payload.snmp_v3_priv_pass = values.snmp_v3_priv_pass;
    } else {
        payload.snmp_community = values.snmp_community;
    }

    payload.cli_protocol = cli ? values.cli_protocol : null;
    if (cli) {
        payload.cli_username = values.cli_username ?? "";
        payload.cli_password = values.cli_password;
        payload.cli_enable_password = values.cli_enable_password;
        if (values.reset_host_key === true) payload.reset_host_key = true;
    }

    SECRET_FIELDS.forEach((field) => {
        if (payload[field] === undefined || payload[field] === null || payload[field] === "") delete payload[field];
    });
    return payload;
}
