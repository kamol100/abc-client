// How current the ONU data of an OLT is (GET /olts/{id} `onu_data`, /olts/{id}/clients meta, ONU rows'
// `status_known` + `status_unknown_reason`). While the OLT is down or not polled, the ONU statuses are old:
// the UI shows "Unknown" instead of Online/Offline and keeps the readings, muted.

import { formatDateTime } from "@/components/monitoring/monitoring-format";

export type OnuDataReason = "olt_down" | "stale" | "never_polled";

export interface OnuDataFreshness {
    fresh: boolean;
    reason: OnuDataReason | null;
    /** When the data was last read from the OLT (the last successful poll). */
    as_of: string | null;
}

type Translate = (key: string, options?: Record<string, unknown>) => string;

const REASONS: readonly string[] = ["olt_down", "stale", "never_polled"];

export function isOnuDataReason(value: unknown): value is OnuDataReason {
    return typeof value === "string" && REASONS.includes(value);
}

/** Old data: the API said `fresh: false`. Missing info (older API) counts as fresh. */
export function isStale(data: Pick<OnuDataFreshness, "fresh"> | null | undefined): boolean {
    return data?.fresh === false;
}

/**
 * Why an ONU / client status is unknown, for a tooltip: "OLT is down — status from the last poll {time}",
 * "Not polled since {time}", "Never polled".
 */
export function unknownStatusText(reason: string | null | undefined, asOf: string | null | undefined, t: Translate): string {
    const time = asOf ? formatDateTime(asOf) : null;
    if (reason === "olt_down") return time ? t("onu.unknown.olt_down", { time }) : t("onu.unknown.olt_down_no_time");
    if (reason === "never_polled") return t("onu.unknown.never_polled");
    if (reason === "stale") return time ? t("onu.unknown.stale", { time }) : t("onu.unknown.never_polled");
    return time ? t("onu.unknown.stale", { time }) : t("onu.unknown.generic");
}

/** The small note on the OLT page's ONU / optical / PON cards: "As of {time} — OLT down". */
export function staleNoteText(data: OnuDataFreshness | null | undefined, t: Translate): string | null {
    if (!isStale(data)) return null;
    const reason = data?.reason ?? "stale";
    if (reason === "never_polled" || !data?.as_of) return t("olt.onu_data.never_polled");
    return t(reason === "olt_down" ? "olt.onu_data.olt_down" : "olt.onu_data.stale", { time: formatDateTime(data.as_of) });
}
