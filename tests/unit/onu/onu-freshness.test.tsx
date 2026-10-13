import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { formatDateTime } from "@/components/monitoring/monitoring-format";
import NotAnsweringBadge, { notAnswering } from "@/components/monitoring/not-answering-badge";
import { isStale, staleNoteText, unknownStatusText } from "@/components/onu/onu-freshness";
import OnuStatusBadge from "@/components/onu/onu-status-badge";

const i18n = vi.hoisted(() => ({
    i18n: { language: "en" },
    t: (key: string, options?: Record<string, unknown>) => {
        const params = Object.entries(options ?? {}).filter(([name]) => name !== "defaultValue");
        return params.length ? `${key}|${params.map(([name, value]) => `${name}=${value}`).join(",")}` : key;
    },
}));
vi.mock("react-i18next", () => ({ useTranslation: () => i18n }));

const asOf = "2026-09-29T08:00:00+00:00";
const at = formatDateTime(asOf);

describe("ONU data freshness", () => {
    it("explains why a status is unknown", () => {
        expect(unknownStatusText("olt_down", asOf, i18n.t)).toBe(`onu.unknown.olt_down|time=${at}`);
        expect(unknownStatusText("stale", asOf, i18n.t)).toBe(`onu.unknown.stale|time=${at}`);
        expect(unknownStatusText("never_polled", null, i18n.t)).toBe("onu.unknown.never_polled");
        expect(unknownStatusText("olt_down", null, i18n.t)).toBe("onu.unknown.olt_down_no_time");
        expect(unknownStatusText(null, null, i18n.t)).toBe("onu.unknown.generic");
    });

    it("notes old numbers on the OLT cards only when the API says they are not fresh", () => {
        expect(isStale(undefined)).toBe(false);
        expect(staleNoteText({ fresh: true, reason: null, as_of: asOf }, i18n.t)).toBeNull();
        expect(staleNoteText({ fresh: false, reason: "olt_down", as_of: asOf }, i18n.t)).toBe(`olt.onu_data.olt_down|time=${at}`);
        expect(staleNoteText({ fresh: false, reason: "stale", as_of: asOf }, i18n.t)).toBe(`olt.onu_data.stale|time=${at}`);
        expect(staleNoteText({ fresh: false, reason: "never_polled", as_of: null }, i18n.t)).toBe("olt.onu_data.never_polled");
    });

    it("shows a grey Unknown badge instead of Online for an old status", () => {
        render(<OnuStatusBadge status="online" statusKnown={false} unknownReason="olt_down" asOf={asOf} />);
        expect(screen.getByText("onu.status.unknown")).toBeInTheDocument();
        expect(screen.queryByText("onu.status.online")).not.toBeInTheDocument();
        expect(screen.getByText(`: onu.unknown.olt_down|time=${at}`)).toBeInTheDocument(); // screen-reader reason
    });
});

describe("not answering", () => {
    it("only while still up with failed checks in a row", () => {
        expect(notAnswering("up", 1, 2)).toEqual({ count: 1, threshold: 2 });
        expect(notAnswering("up", 0, 2)).toBeNull();
        expect(notAnswering("down", 3, 2)).toBeNull();
        expect(notAnswering("up", undefined, 2)).toBeNull();
        expect(notAnswering("up", 1, null)).toEqual({ count: 1, threshold: 2 });
    });

    it("renders the amber line with n of threshold", () => {
        const { rerender } = render(<NotAnsweringBadge state="up" failures={1} threshold={3} />);
        expect(screen.getByRole("status")).toHaveTextContent("monitoring.not_answering|count=1,threshold=3");
        rerender(<NotAnsweringBadge state="up" failures={0} threshold={3} />);
        expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
});
