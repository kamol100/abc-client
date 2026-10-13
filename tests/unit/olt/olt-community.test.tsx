import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import OltAccessFormFieldSchema, {
    communityPlaceholder,
    communityTooltipKey,
    detectCommunityBlockedReason,
    whereToFindRows,
} from "@/components/olt/olt-access-form-schema";
import { stepMessage, testSteps, type OltTestResult } from "@/components/olt/olt-test-result";
import OltTestResultView from "@/components/olt/olt-test-result-view";
import DeviceFormFieldSchema from "@/components/device/device-form-schema";

const i18n = vi.hoisted(() => ({
    i18n: { language: "en" },
    t: (key: string, options?: Record<string, unknown>) => {
        if (key === "olt.community.access_type.ro") return "RO";
        const params = Object.entries(options ?? {}).filter(([name]) => name !== "defaultValue");
        return params.length ? `${key}|${params.map(([name, value]) => `${name}=${value}`).join(",")}` : key;
    },
}));
vi.mock("react-i18next", () => ({ useTranslation: () => i18n }));

describe("SNMP community help and order", () => {
    it("puts the CLI login first and the SNMP settings last in Edit access", () => {
        const names = OltAccessFormFieldSchema({ configured: false }).map((field) => field.name);
        expect(names.slice(0, 4)).toEqual(["cli_protocol", "cli_username", "cli_password", "cli_enable_password"]);
        expect(names.indexOf("snmp_version")).toBeGreaterThan(names.indexOf("cli_enable_password"));
        expect(names.indexOf("snmp_community")).toBe(names.indexOf("snmp_version") + 1);
    });

    it("puts the community last among the OLT fields of the device form", () => {
        const names = DeviceFormFieldSchema([5]).map((field) => field.name);
        const olt = ["device_ip", "cli_protocol", "cli_username", "cli_password", "snmp_community"].map((name) => names.indexOf(name));
        expect(olt).toEqual([...olt].sort((a, b) => a - b));
        expect(olt[4]).toBe(olt[0] + 4);
    });

    it("picks the brand's community tooltip, or the all-brands one", () => {
        expect(communityTooltipKey("bdcom")).toBe("olt.access.fields.snmp_community_tooltip_bdcom");
        expect(communityTooltipKey("huawei")).toBe("olt.access.fields.snmp_community_tooltip_huawei");
        expect(communityTooltipKey("generic")).toBe("olt.access.fields.snmp_community_tooltip");
        expect(communityTooltipKey(null)).toBe("olt.access.fields.snmp_community_tooltip");
        expect(OltAccessFormFieldSchema({ configured: false }, "vsol").find((f) => f.name === "snmp_community")?.label?.tooltip).toBe(
            "olt.access.fields.snmp_community_tooltip_vsol"
        );
    });

    it("says the community can stay empty only with a CLI login", () => {
        expect(communityPlaceholder(false, true)).toBe("olt.access.fields.snmp_community_auto_placeholder");
        expect(communityPlaceholder(false, false)).toBe("olt.access.fields.snmp_community");
        expect(communityPlaceholder(true, true)).toBe("olt.access.fields.keep_placeholder");
    });

    it("lists the OLT's brand first in the help panel", () => {
        expect(whereToFindRows(null)).toEqual(["general", "auto", "bdcom", "vsol", "huawei", "missing"]);
        expect(whereToFindRows("huawei")).toEqual(["huawei", "general", "auto", "bdcom", "vsol", "missing"]);
    });
});

describe("Detect from OLT", () => {
    it("needs a saved CLI login and a v2c, non-Huawei OLT", () => {
        expect(detectCommunityBlockedReason({ configured: false })).toBe("olt.access.detect.needs_cli");
        expect(detectCommunityBlockedReason({ configured: true, cli_protocol: null })).toBe("olt.access.detect.needs_cli");
        expect(detectCommunityBlockedReason({ configured: true, cli_protocol: "telnet", snmp_version: "v3" })).toBe("olt.access.detect.v3");
        expect(detectCommunityBlockedReason({ configured: true, cli_protocol: "telnet", snmp_version: "v2c" }, "huawei")).toBe("olt.access.detect.huawei");
        expect(detectCommunityBlockedReason({ configured: true, cli_protocol: "ssh", snmp_version: "v2c" }, "bdcom")).toBeNull();
    });
});

const detected: OltTestResult = {
    ok: true,
    tested_at: new Date().toISOString(),
    steps: [
        { key: "snmp", status: "ok", message: "SNMP works.", message_key: "olt.test.snmp.ok", params: {} },
        { key: "snmp_community", status: "ok", message: "Community read (read-only).", message_key: "olt.test.snmp_community.detected", params: { access_type: "read-only" } },
        { key: "cli_login", status: "ok", message: "Logged in.", message_key: "olt.test.cli_login.ok", params: {} },
    ],
};

describe("snmp_community test step", () => {
    it("runs between the CLI login and SNMP, with the access type translated", () => {
        expect(testSteps(detected).map((step) => step.key)).toEqual(["cli_login", "snmp_community", "snmp"]);
        expect(stepMessage(testSteps(detected)[1], i18n.t)).toBe("olt.test.snmp_community.detected|access_type=RO");
    });

    it("is labelled in the result view", () => {
        render(<OltTestResultView result={detected} cliProtocol="telnet" />);
        expect(screen.getByText("olt.test.step.snmp_community")).toBeInTheDocument();
        expect(screen.getByText("olt.test.snmp_community.detected|access_type=RO")).toBeInTheDocument();
    });
});
