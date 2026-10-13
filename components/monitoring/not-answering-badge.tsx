"use client";

import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

/**
 * Still "up", but the last check(s) failed: the device is marked down only after `fail_threshold` failures in a
 * row, so a red last bar next to an "Up" badge is expected for a while. Null when nothing failed.
 */
export function notAnswering(
    state: string | null | undefined,
    failures: number | null | undefined,
    threshold: number | null | undefined
): { count: number; threshold: number } | null {
    const count = Number(failures ?? 0);
    if (state !== "up" || !Number.isFinite(count) || count <= 0) return null;
    const limit = Number(threshold ?? 0);
    return { count, threshold: Number.isFinite(limit) && limit > 0 ? limit : count + 1 };
}

interface Props {
    state: string | null | undefined;
    failures: number | null | undefined;
    threshold: number | null | undefined;
    className?: string;
}

/** Amber "Not answering — 1 of 2 failed checks; marked Down if it continues". */
export default function NotAnsweringBadge({ state, failures, threshold, className }: Props) {
    const { t } = useTranslation();
    const info = notAnswering(state, failures, threshold);
    if (!info) return null;

    return (
        <span
            role="status"
            className={cn(
                "inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-1.5 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-300",
                className
            )}
        >
            <AlertTriangle className="h-3 w-3 shrink-0" aria-hidden />
            {t("monitoring.not_answering", { count: info.count, threshold: info.threshold })}
        </span>
    );
}
