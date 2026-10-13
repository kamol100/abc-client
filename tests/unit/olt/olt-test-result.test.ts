import { describe, expect, it } from "vitest";
import {
    firstFailedStep,
    stepMessage,
    stepStatus,
    suggestedProtocol,
    suggestionStep,
    switchProtocolPayload,
    testHasWarning,
    testPassed,
    testSteps,
    type OltTestResult,
} from "@/components/olt/olt-test-result";

// The example of PHASE3-API.md 1.2: SSH closed, Telnet open.
const sshClosed: OltTestResult = {
    ok: false,
    tested_at: "2026-10-13T08:15:02+00:00",
    duration_ms: 3120,
    target: { host: "10.22.0.2", snmp_port: 161, cli_port: 22 },
    steps: [
        { key: "snmp", status: "ok", message: "SNMP works: BDCOM P3600-04 (OLT-1).", message_key: "olt.test.snmp.ok", params: { vendor: "BDCOM", model: "P3600-04", sys_name: "OLT-1" } },
        { key: "reachable", status: "ok", message: "10.22.0.2 answers ping (0.7 ms).", message_key: "olt.test.reachable.ok", params: { host: "10.22.0.2", rtt_ms: 0.7 } },
        {
            key: "cli_port",
            status: "fail",
            message: "SSH (port 22) is closed but Telnet (port 23) is open — change the access type to Telnet.",
            message_key: "olt.test.cli_port.use_other",
            params: { protocol: "SSH", port: 22, other_protocol: "Telnet", other_port: 23 },
            suggestion: { cli_protocol: "telnet" },
        },
        { key: "cli_login", status: "skipped", message: "Login not tried: the CLI port is not open.", message_key: "olt.test.cli_login.skipped_port", params: {} },
    ],
    detected: { vendor: "bdcom", model: "P3600-04", applied: [] },
    suggestion: { cli_protocol: "telnet" },
};

describe("test result steps", () => {
    it("lists the steps in run order", () => {
        expect(testSteps(sshClosed).map((step) => step.key)).toEqual(["reachable", "cli_port", "cli_login", "snmp"]);
        expect(testSteps(null)).toEqual([]);
        expect(testSteps({ steps: undefined as unknown as [] })).toEqual([]);
    });

    it("reads pass / fail / warning", () => {
        expect(testPassed(sshClosed)).toBe(false);
        expect(firstFailedStep(sshClosed)?.key).toBe("cli_port");
        const blocked = { ...sshClosed, ok: true, suggestion: null, steps: [{ key: "reachable", status: "warning" as const, message: "no ping" }] };
        expect(testPassed(blocked)).toBe(true);
        expect(testHasWarning(blocked)).toBe(true);
        expect(testPassed(null)).toBe(false);
    });

    it("shows unknown statuses grey", () => {
        expect(stepStatus({ status: "exploded" as never })).toBe("skipped");
        expect(stepStatus({ status: "fail" })).toBe("fail");
    });
});

describe("protocol suggestion", () => {
    it("suggests the protocol whose port is open, unless it is already saved", () => {
        expect(suggestedProtocol(sshClosed, "ssh")).toBe("telnet");
        expect(suggestedProtocol(sshClosed, "telnet")).toBeNull();
        expect(suggestedProtocol({ ...sshClosed, suggestion: null }, "ssh")).toBe("telnet"); // from the cli_port step
        expect(suggestedProtocol({ ...sshClosed, suggestion: null, steps: [] }, "ssh")).toBeNull();
        expect(suggestionStep(sshClosed)?.message_key).toBe("olt.test.cli_port.use_other");
    });

    it("builds the PUT body that changes only the protocol and keeps the secrets", () => {
        expect(switchProtocolPayload({ snmp_version: "v2c", cli_username: "admin", snmp_v3_user: null }, "telnet")).toEqual({
            snmp_version: "v2c",
            cli_protocol: "telnet",
            cli_username: "admin",
        });
        expect(
            switchProtocolPayload({ snmp_version: "v3", snmp_v3_user: "nms", snmp_v3_auth_protocol: "SHA256", snmp_v3_priv_protocol: "AES", cli_username: "admin" }, "ssh")
        ).toEqual({ snmp_version: "v3", snmp_v3_user: "nms", snmp_v3_auth_protocol: "SHA256", snmp_v3_priv_protocol: "AES", cli_protocol: "ssh", cli_username: "admin" });
    });
});

describe("stepMessage", () => {
    const step = testSteps(sshClosed)[1];

    it("translates message_key with params", () => {
        const t = (key: string, options?: Record<string, unknown>) =>
            key === "olt.test.cli_port.use_other" ? `${options?.protocol} closed, use ${options?.other_protocol}` : String(options?.defaultValue ?? key);
        expect(stepMessage(step, t)).toBe("SSH closed, use Telnet");
    });

    it("falls back to the English message for an unknown key", () => {
        const t = (key: string, options?: Record<string, unknown>) => String(options?.defaultValue ?? key);
        expect(stepMessage(step, t)).toBe(step.message);
        const echoKey = (key: string) => key; // i18next without a default
        expect(stepMessage(step, echoKey)).toBe(step.message);
        expect(stepMessage({ key: "snmp", status: "ok", message: null }, echoKey)).toBeNull();
    });
});

describe("pollFinished", () => {
    it("waits until last_poll_at differs from the value the 202 returned", async () => {
        const { pollFinished } = await import("@/components/olt/olt-poll");
        const wait = { since: Date.now(), before: "2026-10-13T08:10:00+00:00" };
        expect(pollFinished(wait, "2026-10-13T08:10:00+00:00")).toBe(false);
        expect(pollFinished(wait, null)).toBe(false);
        expect(pollFinished(wait, "2026-10-13T08:16:40+00:00")).toBe(true);
        expect(pollFinished({ since: Date.now(), before: null }, "2026-10-13T08:16:40+00:00")).toBe(true);
    });
});

describe("stepMessage tidying", () => {
    it("drops what empty params leave behind", () => {
        const t = (_key: string, options?: Record<string, unknown>) =>
            `SNMP works: ${options?.vendor} ${options?.model} (${options?.sys_name}).`;
        const step = { key: "snmp", status: "ok" as const, message: "x", message_key: "olt.test.snmp.ok", params: { vendor: "", model: "", sys_name: "" } };
        expect(stepMessage(step, t)).toBe("SNMP works:.");
        expect(stepMessage({ ...step, params: { vendor: "BDCOM", model: "", sys_name: "OLT-1" } }, t)).toBe("SNMP works: BDCOM (OLT-1).");
    });
});
