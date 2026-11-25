import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import NocDownCard from "@/components/noc/noc-down-card";
import type { NocDownItem, NocOutage } from "@/components/noc/noc-type";

const i18n = vi.hoisted(() => ({
    i18n: { language: "en" },
    t: (key: string, options?: Record<string, unknown>) => {
        const params = Object.entries(options ?? {}).filter(([name]) => name !== "defaultValue");
        return params.length ? `${key}|${params.map(([name, value]) => `${name}=${value}`).join(",")}` : key;
    },
}));
vi.mock("react-i18next", () => ({ useTranslation: () => i18n }));
vi.mock("@/components/monitoring/ping-dialog", () => ({ default: () => <button type="button">ping</button> }));
vi.mock("@/components/olt/olt-port-history", () => ({
    default: ({ port }: { port: { name: string } | null }) => (port ? <div role="dialog">{port.name}</div> : null),
}));

const outage = (extra: Partial<NocOutage>): NocOutage => ({
    id: "o",
    title: "o",
    device_id: null,
    type: "pon_port_down",
    started_at: "2026-11-25T10:00:00Z",
    affected_clients: 34,
    acknowledged: false,
    ticket: null,
    during_maintenance: false,
    downstream: false,
    ...extra,
});

const pon: NocDownItem = {
    key: "pon-3",
    kind: "pon",
    since: "2026-11-25T10:00:00Z",
    clients: 34,
    outage: outage({}),
    behind: [],
    port: { olt_id: "olt-2", olt_name: "Mirpur OLT-02", port_type: "pon", port_id: 3, name: "EPON0/3", down_since: "2026-11-25T10:00:00Z", onu_total: 38, affected_clients: 34, incident_id: "o", acknowledged: false },
};

function Harness({ item, canShowOlt = true }: { item: NocDownItem; canShowOlt?: boolean }) {
    const [open, setOpen] = useState(false);
    return <NocDownCard item={item} open={open} onToggle={() => setOpen(!open)} canShowOlt={canShowOlt} canShowTicket />;
}

describe("NocDownCard", () => {
    it("shows a PON port card closed, then its details, OLT link and port history", () => {
        render(<Harness item={pon} />);
        expect(screen.getByText("Mirpur OLT-02 · EPON0/3")).toBeInTheDocument();
        expect(screen.getByText("noc.kind.pon")).toBeInTheDocument();
        expect(screen.getByText("noc.not_acknowledged")).toBeInTheDocument();
        expect(screen.queryByText("noc.details")).not.toBeInTheDocument();

        const header = screen.getByRole("button", { expanded: false });
        fireEvent.click(header);
        expect(header).toHaveAttribute("aria-expanded", "true");
        expect(screen.getByText("noc.hints.pon")).toBeInTheDocument();
        expect(screen.getByText("38")).toBeInTheDocument(); // ONUs on port
        expect(screen.getByRole("link", { name: "noc.open_olt" })).toHaveAttribute("href", "/olts/view/olt-2");
        expect(screen.queryByText("ping")).not.toBeInTheDocument(); // ports have no ping

        fireEvent.click(screen.getByRole("button", { name: "noc.port_history" }));
        expect(screen.getByRole("dialog")).toHaveTextContent("Mirpur OLT-02 · EPON0/3");
    });

    it("marks a ticketed uplink as handled and links the ticket; hides the OLT link without permission", () => {
        const uplink: NocDownItem = {
            ...pon,
            key: "uplink-9",
            kind: "uplink",
            clients: 0,
            outage: outage({ type: "uplink_down", acknowledged: true, ticket: { id: "t1", number: "1042" } }),
            port: { ...pon.port!, port_type: "uplink", port_id: 9, name: "GE0/2", onu_total: null },
        };
        const { container } = render(<Harness item={uplink} canShowOlt={false} />);
        expect(container.querySelector("article")).toHaveClass("border-amber-300");
        expect(screen.getByText("noc.ticket|number=1042")).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { expanded: false }));
        expect(screen.getByRole("link", { name: "noc.open_ticket|number=1042" })).toHaveAttribute("href", "/tickets/view/t1");
        expect(screen.queryByRole("link", { name: "noc.open_olt" })).not.toBeInTheDocument();
    });

    it("lists what a down device cuts off", () => {
        const router: NocDownItem = {
            key: "device-r1",
            kind: "device",
            since: "2026-11-25T10:00:00Z",
            clients: 186,
            outage: null,
            behind: [outage({ id: "sw", title: "UTT-SW-01", downstream: true, affected_clients: 60 })],
            device: { id: "r1", name: "Uttara Core Router", category: "router", network: null, zone: null, device_ip: "10.12.0.1", latitude: null, longitude: null, down_since: "2026-11-25T10:00:00Z", affected_clients: 186, in_maintenance: false, is_olt: false },
        };
        render(<Harness item={router} />);
        fireEvent.click(screen.getByRole("button", { expanded: false }));
        expect(screen.getByText("noc.behind|count=1")).toBeInTheDocument();
        expect(screen.getByText("UTT-SW-01")).toBeInTheDocument();
        expect(screen.getByText("ping")).toBeInTheDocument();
        expect(screen.queryByText("noc.directions")).not.toBeInTheDocument(); // no location saved
    });
});

describe("NocDownCard without actions", () => {
    it("draws no empty action bar for an outage with no device, port or ticket", () => {
        const network: NocDownItem = { key: "outage-n", kind: "outage", since: "2026-11-25T10:00:00Z", clients: 12, outage: outage({ type: "router_unreachable", title: "Network unreachable: Banani" }), behind: [] };
        const { container } = render(<Harness item={network} />);
        fireEvent.click(screen.getByRole("button", { expanded: false }));
        expect(screen.getByText("noc.hints.outage")).toBeInTheDocument();
        expect(container.querySelector(".pt-4")).toBeNull();
    });
});
