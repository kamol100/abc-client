import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import OltTestResultView from "@/components/olt/olt-test-result-view";
import type { OltTestResult } from "@/components/olt/olt-test-result";

// Known keys render as "key|param=value"; the rest return the default (the API's English message).
const KNOWN = new Set(["olt.test.cli_port.use_other", "olt.test.reachable.ok"]);
const i18n = vi.hoisted(() => ({
    i18n: { language: "en" },
    t: (key: string, options?: Record<string, unknown>) => {
        if (options && "defaultValue" in options && !KNOWN.has(key)) return String(options.defaultValue);
        const params = Object.entries(options ?? {}).filter(([name]) => name !== "defaultValue");
        return params.length ? `${key}|${params.map(([name, value]) => `${name}=${value}`).join(",")}` : key;
    },
}));
vi.mock("react-i18next", () => ({ useTranslation: () => i18n }));

const result: OltTestResult = {
    ok: false,
    tested_at: new Date().toISOString(),
    target: { host: "10.22.0.2", snmp_port: 161, cli_port: 22 },
    steps: [
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
        { key: "snmp", status: "warning", message: "SNMP works, but this looks like a VSOL OLT.", message_key: "olt.test.snmp.vendor_mismatch", params: {} },
    ],
    detected: null,
    suggestion: { cli_protocol: "telnet" },
};

describe("OltTestResultView", () => {
    it("lists every step with its translated message and status", () => {
        render(<OltTestResultView result={result} cliProtocol="ssh" />);

        expect(screen.getByText("olt.test.failed")).toBeInTheDocument();
        expect(screen.getByText("olt.test.reachable.ok|host=10.22.0.2,rtt_ms=0.7")).toBeInTheDocument();
        expect(screen.getByText("Login not tried: the CLI port is not open.")).toBeInTheDocument(); // fallback to `message`
        ["ok", "fail", "skipped", "warning"].forEach((status) => expect(screen.getByText(`(olt.test.status.${status})`)).toBeInTheDocument());
    });

    it("puts the protocol hint first and switches with one click", () => {
        const onSwitch = vi.fn();
        render(<OltTestResultView result={result} cliProtocol="ssh" onSwitchProtocol={onSwitch} />);

        const hint = "olt.test.cli_port.use_other|protocol=SSH,port=22,other_protocol=Telnet,other_port=23";
        expect(screen.getAllByText(hint)).toHaveLength(2); // the hint box and the cli_port step
        fireEvent.click(screen.getByRole("button", { name: /olt.test.switch_to/ }));
        expect(onSwitch).toHaveBeenCalledWith("telnet");
    });

    it("hides the hint once the suggested protocol is saved, and folds a clean pass", () => {
        const passed: OltTestResult = { ...result, ok: true, suggestion: null, steps: [result.steps[0]] };
        render(<OltTestResultView result={passed} cliProtocol="telnet" collapsible />);

        expect(screen.queryByRole("button", { name: /olt.test.switch_to/ })).not.toBeInTheDocument();
        expect(screen.getByText("olt.test.passed")).toBeInTheDocument();
        expect(screen.queryByText(/olt.test.reachable.ok/)).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: /olt.test.show_steps/ }));
        expect(screen.getByText(/olt.test.reachable.ok/)).toBeInTheDocument();
    });
});
