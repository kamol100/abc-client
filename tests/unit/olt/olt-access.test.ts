import { describe, expect, it } from "vitest";
import { buildOltAccessSchema, toAccessFormValues, toAccessPayload, type OltAccess } from "@/components/olt/olt-type";

const saved: OltAccess = {
    configured: true,
    host: "10.22.0.2",
    snmp_version: "v2c",
    snmp_port: 161,
    has_snmp_community: true,
    has_snmp_v3_auth_pass: false,
    has_snmp_v3_priv_pass: false,
    cli_protocol: "ssh",
    cli_port: 22,
    cli_username: "admin",
    has_cli_password: true,
    has_cli_enable_password: false,
    cli_host_key: "SHA256:abc",
    last_poll_at: null,
    last_poll_error: null,
    last_test: null,
};

describe("buildOltAccessSchema", () => {
    const base = { snmp_version: "v2c", cli_protocol: "telnet", cli_username: "admin" };

    it("requires the community and CLI password on the first save", () => {
        const first = buildOltAccessSchema({});
        expect(first.safeParse({ ...base, snmp_community: "", cli_password: "pw" }).success).toBe(false);
        expect(first.safeParse({ ...base, snmp_community: "public", cli_password: "" }).success).toBe(false);
        expect(first.safeParse({ ...base, snmp_community: "public", cli_password: "pw" }).success).toBe(true);
    });

    it("lets empty secrets keep the stored ones", () => {
        const stored = buildOltAccessSchema({ has_snmp_community: true, has_cli_password: true });
        expect(stored.safeParse({ ...base, snmp_community: "", cli_password: "" }).success).toBe(true);
        expect(stored.safeParse({ ...base, cli_protocol: null, snmp_community: "" }).success).toBe(true);
    });

    it("needs a CLI user with a protocol and rejects spaces in the community", () => {
        const stored = buildOltAccessSchema({ has_snmp_community: true, has_cli_password: true });
        expect(stored.safeParse({ ...base, cli_username: "" }).success).toBe(false);
        expect(stored.safeParse({ ...base, snmp_community: "pub lic" }).success).toBe(false);
    });

    it("needs a v3 user and an 8+ character auth passphrase until one is stored", () => {
        const first = buildOltAccessSchema({});
        const v3 = { snmp_version: "v3", cli_protocol: null };
        expect(first.safeParse({ ...v3, snmp_v3_user: "", snmp_v3_auth_pass: "12345678" }).success).toBe(false);
        expect(first.safeParse({ ...v3, snmp_v3_user: "nms", snmp_v3_auth_pass: "short" }).success).toBe(false);
        expect(first.safeParse({ ...v3, snmp_v3_user: "nms", snmp_v3_auth_pass: "" }).success).toBe(false);
        expect(first.safeParse({ ...v3, snmp_v3_user: "nms", snmp_v3_auth_pass: "12345678" }).success).toBe(true);
        expect(buildOltAccessSchema({ has_snmp_v3_auth_pass: true }).safeParse({ ...v3, snmp_v3_user: "nms", snmp_v3_auth_pass: "" }).success).toBe(true);
    });
});

describe("toAccessFormValues", () => {
    it("never pre-fills secrets and can preselect another protocol", () => {
        const values = toAccessFormValues(saved);
        expect(values).toMatchObject({ snmp_version: "v2c", snmp_community: "", cli_protocol: "ssh", cli_username: "admin", cli_password: "" });
        expect(toAccessFormValues(saved, "telnet").cli_protocol).toBe("telnet");
    });
});

describe("toAccessPayload", () => {
    it("sends only the chosen SNMP version's fields and drops empty secrets (keep)", () => {
        const payload = toAccessPayload({
            snmp_version: "v2c",
            snmp_community: "",
            snmp_v3_user: "nms",
            snmp_v3_auth_protocol: "SHA",
            snmp_v3_priv_protocol: "AES",
            cli_protocol: "telnet",
            cli_username: "admin",
            cli_password: "",
            cli_enable_password: "",
            reset_host_key: false,
        });
        expect(payload).toEqual({ snmp_version: "v2c", cli_protocol: "telnet", cli_username: "admin" });
    });

    it("clears the CLI with a null protocol and sends the privacy protocol only with a privacy passphrase", () => {
        const values = {
            snmp_version: "v3",
            snmp_community: "ignored",
            snmp_v3_user: "nms",
            snmp_v3_auth_protocol: "SHA256",
            snmp_v3_auth_pass: "auth-pass-1",
            snmp_v3_priv_protocol: "AES",
            snmp_v3_priv_pass: "",
            cli_protocol: null,
            cli_username: "admin",
            cli_password: "pw",
        };
        expect(toAccessPayload(values)).toEqual({
            snmp_version: "v3",
            snmp_v3_user: "nms",
            snmp_v3_auth_protocol: "SHA256",
            snmp_v3_auth_pass: "auth-pass-1",
            snmp_v3_priv_protocol: null,
            cli_protocol: null,
        });
        expect(toAccessPayload({ ...values, snmp_v3_priv_pass: "priv-pass-1" }).snmp_v3_priv_protocol).toBe("AES");
        expect(toAccessPayload(values, { has_snmp_v3_priv_pass: true }).snmp_v3_priv_protocol).toBe("AES");
    });

    it("asks to reset the SSH host key only when ticked", () => {
        const values = { snmp_version: "v2c", cli_protocol: "ssh", cli_username: "admin" };
        expect(toAccessPayload({ ...values, reset_host_key: true }).reset_host_key).toBe(true);
        expect("reset_host_key" in toAccessPayload({ ...values, reset_host_key: false })).toBe(false);
    });
});

describe("printable ASCII credentials", () => {
    const stored = buildOltAccessSchema({ has_snmp_community: true, has_cli_password: true, has_snmp_v3_auth_pass: true });
    const base = { snmp_version: "v2c", cli_protocol: "telnet", cli_username: "admin" };

    it("refuses line breaks and non-ASCII in the CLI and SNMPv3 fields", () => {
        expect(stored.safeParse({ ...base, cli_password: "pass word!" }).success).toBe(true);
        expect(stored.safeParse({ ...base, cli_password: "pw\nshow run" }).success).toBe(false);
        expect(stored.safeParse({ ...base, cli_username: "অ্যাডমিন" }).success).toBe(false);
        expect(stored.safeParse({ ...base, cli_enable_password: "en\r\n" }).success).toBe(false);
        const v3 = { snmp_version: "v3", cli_protocol: null, snmp_v3_user: "nms" };
        expect(stored.safeParse({ ...v3, snmp_v3_auth_pass: "auth pass 1" }).success).toBe(true);
        expect(stored.safeParse({ ...v3, snmp_v3_auth_pass: "auth\tpass1" }).success).toBe(false);
        expect(stored.safeParse({ ...v3, snmp_v3_user: "nms\n" }).success).toBe(false);
    });
});
