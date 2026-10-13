// "Test connection" result (POST /olts/{id}/access/test, also `access.last_test`): types and pure helpers.

export type CliProtocol = "telnet" | "ssh";

/** Always sent, in this order. */
// snmp_community: the v2c community read from the OLT configuration over the CLI (BDCOM, VSOL), before `snmp`.
export const TEST_STEP_KEYS = ["reachable", "cli_port", "cli_login", "snmp_community", "snmp"] as const;
export type TestStepKey = (typeof TEST_STEP_KEYS)[number];

/** Steps the UI has a label for: the API's five, plus "address" (a Device IP refused by the address policy). */
export const LABELLED_STEP_KEYS: readonly string[] = ["address", ...TEST_STEP_KEYS];

/** 422 of POST /access/test when the Device IP is refused (loopback, link-local, reserved, deny list). */
export const ADDRESS_DENIED_KEY = "olt.address.denied";

/** ok = green, fail = red, warning = amber (works, but look at it), skipped = grey (not run). */
export type TestStepStatus = "ok" | "fail" | "warning" | "skipped";

export interface OltTestStep {
    key: TestStepKey | string;
    status: TestStepStatus;
    duration_ms?: number | null;
    /** English text; the UI translates `message_key` with `params` and falls back to it. */
    message: string | null;
    message_key?: string | null;
    params?: Record<string, string | number | null> | null;
    suggestion?: { cli_protocol: CliProtocol } | null;
    details?: Record<string, unknown> | null;
}

export interface OltTestResult {
    ok: boolean;
    tested_at: string | null;
    duration_ms?: number | null;
    target?: { host: string | null; snmp_port: number | null; cli_port: number | null } | null;
    steps: OltTestStep[];
    /** Vendor/model recognised over SNMP; `applied` = device fields that were empty and are now filled. */
    detected?: { vendor: string | null; model: string | null; applied: string[] } | null;
    /** The configured protocol's port is closed but the other one is open. */
    suggestion?: { cli_protocol: CliProtocol } | null;
}

export const CLI_PROTOCOLS: readonly CliProtocol[] = ["ssh", "telnet"];

const STATUSES: readonly TestStepStatus[] = ["ok", "fail", "warning", "skipped"];

export function isCliProtocol(value: unknown): value is CliProtocol {
    return value === "telnet" || value === "ssh";
}

/** Unknown statuses are shown grey rather than breaking the list. */
export function stepStatus(step: Pick<OltTestStep, "status"> | null | undefined): TestStepStatus {
    return step && (STATUSES as readonly string[]).includes(step.status) ? step.status : "skipped";
}

/** The steps in run order (known keys first), tolerating a missing or malformed list. */
export function testSteps(result: Pick<OltTestResult, "steps"> | null | undefined): OltTestStep[] {
    const steps = Array.isArray(result?.steps) ? result.steps.filter((step) => step && typeof step.key === "string") : [];
    const order = (key: string) => {
        const index = (TEST_STEP_KEYS as readonly string[]).indexOf(key);
        return index === -1 ? TEST_STEP_KEYS.length : index;
    };
    return [...steps].sort((a, b) => order(a.key) - order(b.key));
}

/** `ok` from the API; without it, no step failed. */
export function testPassed(result: Pick<OltTestResult, "ok" | "steps"> | null | undefined): boolean {
    if (!result) return false;
    if (typeof result.ok === "boolean") return result.ok;
    return !testSteps(result).some((step) => stepStatus(step) === "fail");
}

/** Any step that worked with a caveat (ping blocked, vendor mismatch). */
export function testHasWarning(result: Pick<OltTestResult, "steps"> | null | undefined): boolean {
    return testSteps(result).some((step) => stepStatus(step) === "warning");
}

/** The protocol the test suggests switching to (top-level `suggestion`, else the cli_port step's), unless already saved. */
export function suggestedProtocol(
    result: Pick<OltTestResult, "suggestion" | "steps"> | null | undefined,
    currentProtocol?: CliProtocol | null
): CliProtocol | null {
    if (!result) return null;
    const fromStep = testSteps(result).find((step) => step.suggestion?.cli_protocol)?.suggestion?.cli_protocol;
    const suggested = result.suggestion?.cli_protocol ?? fromStep ?? null;
    return isCliProtocol(suggested) && suggested !== currentProtocol ? suggested : null;
}

/** The step that carries the protocol suggestion (its message says which port is open). */
export function suggestionStep(result: Pick<OltTestResult, "steps"> | null | undefined): OltTestStep | null {
    return testSteps(result).find((step) => step.key === "cli_port" && step.suggestion?.cli_protocol) ?? null;
}

/** The first failed step (what to fix first). */
export function firstFailedStep(result: Pick<OltTestResult, "steps"> | null | undefined): OltTestStep | null {
    return testSteps(result).find((step) => stepStatus(step) === "fail") ?? null;
}

type Translate = (key: string, options?: Record<string, unknown>) => string;

/** Empty params (e.g. an unknown vendor/model) leave "works:  (OLT-1)" or "()" behind: tidy them. */
function tidy(text: string): string {
    return text
        .replace(/\(\s*\)/g, "")
        .replace(/\s{2,}/g, " ")
        .replace(/\s+([.,:;।])/g, "$1")
        .trim();
}

/** `t(message_key, params)`, falling back to the English `message` when the key is unknown. */
/** "read-only" / "read-write" (or ro / rw) as the reader's language says it. */
export function translateAccessType(value: unknown, t: Translate): unknown {
    const short = value === "read-only" || value === "ro" ? "ro" : value === "read-write" || value === "rw" ? "rw" : null;
    return short ? t(`olt.community.access_type.${short}`) : value;
}

export function stepMessage(step: OltTestStep, t: Translate): string | null {
    const fallback = step.message ?? "";
    if (step.message_key) {
        const params: Record<string, unknown> = { ...(step.params ?? {}) };
        if ("access_type" in params) params.access_type = translateAccessType(params.access_type, t);
        const text = t(step.message_key, { ...params, defaultValue: fallback });
        // i18next returns the key itself for a missing key when no default applies.
        if (text && text !== step.message_key) return tidy(text);
    }
    return step.message ? tidy(step.message) : null;
}

/**
 * PUT body that switches only the CLI protocol: the saved non-secret fields as they are, secrets empty
 * (= keep). Changing the protocol keeps the CLI user/password on the API side.
 */
export function switchProtocolPayload(
    access: {
        snmp_version?: string | null;
        snmp_v3_user?: string | null;
        snmp_v3_auth_protocol?: string | null;
        snmp_v3_priv_protocol?: string | null;
        cli_username?: string | null;
    },
    protocol: CliProtocol
): Record<string, unknown> {
    const v3 = access.snmp_version === "v3";
    return {
        snmp_version: access.snmp_version ?? "v2c",
        ...(v3
            ? {
                  snmp_v3_user: access.snmp_v3_user ?? "",
                  snmp_v3_auth_protocol: access.snmp_v3_auth_protocol ?? "SHA",
                  snmp_v3_priv_protocol: access.snmp_v3_priv_protocol ?? null,
              }
            : {}),
        cli_protocol: protocol,
        cli_username: access.cli_username ?? "",
    };
}

/**
 * A refused Device IP (422 `olt.address.denied`, params {address, reason}) shown like a failed test: one red
 * "Device IP" step with the translated reason. Null for any other error.
 */
export function addressDeniedResult(
    keyed: { key: string; params: Record<string, unknown>; message: string | null } | null,
    testedAt: string = new Date().toISOString()
): OltTestResult | null {
    if (!keyed || keyed.key !== ADDRESS_DENIED_KEY) return null;
    const params: Record<string, string | number | null> = {};
    Object.entries(keyed.params).forEach(([name, value]) => {
        params[name] = typeof value === "number" || typeof value === "string" ? value : value == null ? null : String(value);
    });
    return {
        ok: false,
        tested_at: testedAt,
        steps: [{ key: "address", status: "fail", message: keyed.message, message_key: keyed.key, params }],
        suggestion: null,
        detected: null,
    };
}
