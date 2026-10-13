import type { MyBadgeType } from "@/components/my-badge";
import type { OnuStatus } from "./onu-type";

/** Company default (`onu_rx_power_low_dbm`); the OLT page gets the live value from the API. */
export const DEFAULT_RX_LOW_DBM = -27;
/** Readings within this margin above the threshold are "near limit" (same buckets as the API's optical summary). */
export const NEAR_LIMIT_MARGIN_DB = 2;
/** Above this the ONU receiver is overloaded ("too strong", e.g. no splitter). */
export const TOO_STRONG_DBM = -8;

export type RxLevel = "good" | "near_limit" | "low" | "too_strong" | "none";

/** The threshold setting as a number; missing, empty or invalid → the default. */
export function rxLowThreshold(setting: unknown): number {
    if (setting === null || setting === undefined || setting === "") return DEFAULT_RX_LOW_DBM;
    const value = Number(setting);
    return Number.isFinite(value) ? value : DEFAULT_RX_LOW_DBM;
}

/** low < threshold ≤ near limit < threshold + 2; too strong > −8. */
export function rxLevel(rx: number | null | undefined, threshold: number = DEFAULT_RX_LOW_DBM): RxLevel {
    if (rx === null || rx === undefined || Number.isNaN(Number(rx))) return "none";
    const value = Number(rx);
    if (value > TOO_STRONG_DBM) return "too_strong";
    if (value < threshold) return "low";
    if (value < threshold + NEAR_LIMIT_MARGIN_DB) return "near_limit";
    return "good";
}

export const RX_LEVEL_CLASS: Record<RxLevel, string> = {
    good: "text-green-700 dark:text-green-400",
    near_limit: "text-amber-700 dark:text-amber-400",
    too_strong: "text-amber-700 dark:text-amber-400",
    low: "text-destructive",
    none: "text-muted-foreground",
};

export function rxClass(rx: number | null | undefined, threshold: number = DEFAULT_RX_LOW_DBM): string {
    return RX_LEVEL_CLASS[rxLevel(rx, threshold)];
}

/** "850 m", "1.53 km". */
export function formatDistance(meters: number | null | undefined): string {
    if (meters === null || meters === undefined || Number.isNaN(Number(meters))) return "—";
    const value = Number(meters);
    return value >= 1000 ? `${(value / 1000).toFixed(2)} km` : `${value} m`;
}

export function onuStatusBadgeType(status: OnuStatus | string | null | undefined): MyBadgeType {
    if (status === "online") return "success";
    if (status === "los" || status === "dying_gasp" || status === "offline") return "decline";
    return "pending";
}
