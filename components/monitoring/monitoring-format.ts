"use client";

import { format } from "date-fns";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { parseLanguage } from "@/lib/i18n/languages";

const LOCALES = { en: "en-US", bn: "bn-BD" } as const;

export function toDate(value: string | null | undefined): Date | null {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

// The formatters take numbers but coerce, in case a decimal column arrives as a string.

/** "1.1 ms"; sub-millisecond values keep two decimals. */
export function formatMs(value: number | null | undefined): string {
    if (value == null) return "—";
    const ms = Number(value);
    return `${ms < 1 ? ms.toFixed(2) : ms.toFixed(1)} ms`;
}

/** "98.82%"; `trim` drops trailing zeros ("0%", "33.33%"). */
export function formatPct(value: number | null | undefined, trim = false): string {
    if (value == null) return "—";
    const pct = Number(value).toFixed(2);
    return `${trim ? Number(pct) : pct}%`;
}

/** "-21.40 dBm" */
export function formatDbm(value: number | null | undefined): string {
    return value == null ? "—" : `${Number(value).toFixed(2)} dBm`;
}

/** "08 Oct 2026, 14:31" (or with seconds). */
export function formatDateTime(value: string | null | undefined, withSeconds = false): string {
    const date = toDate(value);
    if (!date) return "—";
    return format(date, withSeconds ? "dd MMM yyyy, HH:mm:ss" : "dd MMM yyyy, HH:mm");
}

export type DurationUnit = "d" | "h" | "m" | "s";

/** The two most significant units of a duration: 4140 s → 1 h 9 min, 1020 s → 17 min. */
export function durationParts(seconds: number): { unit: DurationUnit; count: number }[] {
    let rest = Math.max(0, Math.round(seconds));
    if (rest < 60) return [{ unit: "s", count: rest }];

    const parts: { unit: DurationUnit; count: number }[] = [];
    for (const [unit, size] of [["d", 86400], ["h", 3600], ["m", 60]] as const) {
        const count = Math.floor(rest / size);
        rest -= count * size;
        if (count > 0 || parts.length > 0) parts.push({ unit, count });
    }
    return parts.slice(0, 2).filter((part, index) => index === 0 || part.count > 0);
}

/** Locale-aware duration and relative-time formatters for the monitoring screens. */
export function useMonitoringFormat() {
    const { t, i18n } = useTranslation();
    const locale = LOCALES[parseLanguage(i18n.language)];

    return useMemo(() => {
        const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

        const duration = (seconds: number | null | undefined): string =>
            seconds == null
                ? "—"
                : durationParts(seconds)
                      .map((part) => t(`monitoring.duration.${part.unit}`, { count: part.count }))
                      .join(" ");

        /** Seconds from `value` until now (0 when missing). */
        const secondsSince = (value: string | null | undefined): number => {
            const date = toDate(value);
            return date ? Math.max(0, (Date.now() - date.getTime()) / 1000) : 0;
        };

        /** "1 minute ago"; "Never" when there is no time. */
        const relative = (value: string | null | undefined): string => {
            if (!toDate(value)) return t("monitoring.never");
            const ago = secondsSince(value);
            const [unit, size] =
                ago < 60 ? (["second", 1] as const)
                    : ago < 3600 ? (["minute", 60] as const)
                        : ago < 86400 ? (["hour", 3600] as const)
                            : (["day", 86400] as const);
            return rtf.format(-Math.round(ago / size), unit);
        };

        return { duration, relative, secondsSince };
    }, [t, locale]);
}
