"use client";

import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { formatDateTime, toDate } from "./monitoring-format";
import type { DeviceMonitoring, MonitorState } from "./monitoring-type";

// Hand-built charts (no chart library in this app). Colours follow the designs:
// green = up, red = down, amber = short downtime, grey = no data.

export type BarTone = "up" | "down" | "warn" | "none";

export const TONE_BG: Record<BarTone, string> = {
    up: "bg-green-600",
    down: "bg-red-600",
    warn: "bg-amber-500",
    none: "bg-zinc-300 dark:bg-zinc-700",
};

const STATE_BG: Record<MonitorState, string> = {
    up: "bg-green-600",
    down: "bg-red-600",
    unknown: "bg-slate-400",
};

/** A row of equal-width status bars (48 half hours, 90 days); each bar has a hover title. */
export function StatusBars({
    bars,
    label,
    className,
}: {
    bars: { tone: BarTone; title: string }[];
    label: string;
    className?: string;
}) {
    return (
        <div role="img" aria-label={label} className={cn("flex items-stretch gap-0.5", className)}>
            {bars.map((bar, index) => (
                <span key={index} title={bar.title} className={cn("min-w-0 flex-1 rounded-sm", TONE_BG[bar.tone])} />
            ))}
        </div>
    );
}

export function Legend({ items, label }: { items: { label: string; swatch: string }[]; label?: string }) {
    return (
        <ul aria-label={label} className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {items.map((item) => (
                <li key={item.label} className="flex items-center gap-1.5">
                    <span aria-hidden className={item.swatch} />
                    {item.label}
                </li>
            ))}
        </ul>
    );
}

/** Up / down / unknown segments laid out proportionally over `from` → `to`. */
export function TimelineBar({
    segments,
    from,
    to,
    label,
}: {
    segments: DeviceMonitoring["timeline"];
    from: string;
    to: string;
    label: string;
}) {
    const { t } = useTranslation();
    const start = toDate(from)?.getTime() ?? 0;
    const end = toDate(to)?.getTime() ?? 0;
    const span = Math.max(1, end - start);

    return (
        <div role="img" aria-label={label} className="flex h-3.5 overflow-hidden rounded-full bg-muted">
            {segments.map((segment, index) => {
                const a = Math.max(start, toDate(segment.from)?.getTime() ?? start);
                const b = Math.min(end, toDate(segment.to)?.getTime() ?? end);
                const width = Math.max(0, ((b - a) / span) * 100);
                return (
                    <div
                        key={index}
                        title={`${t(`monitoring.state.${segment.state}`)} · ${formatDateTime(segment.from)} – ${formatDateTime(segment.to)}`}
                        className={STATE_BG[segment.state] ?? STATE_BG.unknown}
                        // Short outages stay visible on a 30-day bar.
                        style={{ flex: `0 0 ${width}%`, minWidth: segment.state === "down" ? 2 : undefined }}
                    />
                );
            })}
        </div>
    );
}

const W = 700;
const H = 220;
const TICKS = 7;

function niceMax(peak: number): number {
    const steps = [2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000];
    return steps.find((step) => peak <= step) ?? Math.ceil(peak / 1000) * 1000;
}

/** Average line, min–max band and red marks for buckets with a failed check. */
export function LatencyChart({
    points,
    from,
    to,
    label,
    tickFormat,
}: {
    points: DeviceMonitoring["latency"]["points"];
    from: string;
    to: string;
    label: string;
    /** date-fns pattern for the x-axis labels */
    tickFormat: string;
}) {
    const { t } = useTranslation();
    const start = toDate(from)?.getTime() ?? 0;
    const end = toDate(to)?.getTime() ?? 0;
    const span = Math.max(1, end - start);
    const hasData = points.some((point) => point.avg != null);

    const yMax = niceMax(Math.max(0, ...points.map((point) => point.max ?? point.avg ?? 0)));
    const x = (iso: string) => ((((toDate(iso)?.getTime() ?? start) - start) / span) * W).toFixed(1);
    const y = (value: number) => (H - (Math.min(value, yMax) / yMax) * (H - 6)).toFixed(1);

    let line = "";
    let band = "";
    let fails = "";
    let run: { t: string; avg: number; min: number; max: number }[] = [];
    const flush = () => {
        if (run.length > 0) {
            line += `M${run.map((p) => `${x(p.t)} ${y(p.avg)}`).join(" L")}${run.length === 1 ? " h1" : ""} `;
            band += `M${run.map((p) => `${x(p.t)} ${y(p.max)}`).join(" L")} L${[...run]
                .reverse()
                .map((p) => `${x(p.t)} ${y(p.min)}`)
                .join(" L")} Z `;
        }
        run = [];
    };
    for (const point of points) {
        if (point.failed) fails += `M${x(point.t)} 0 V${H} `;
        if (point.avg == null) flush();
        else run.push({ t: point.t, avg: point.avg, min: point.min ?? point.avg, max: point.max ?? point.avg });
    }
    flush();

    const ticks = Array.from({ length: TICKS + 1 }, (_, i) => start + (span * i) / TICKS);
    const grid = ticks
        .slice(1, -1)
        .map((tick) => `M${(((tick - start) / span) * W).toFixed(1)} 0 V${H}`)
        .join(" ");

    return (
        <div className="flex gap-2">
            <div className="flex h-[220px] w-8 flex-col justify-between text-right text-[11px] tabular-nums text-muted-foreground">
                <span>{yMax}</span>
                <span>{yMax / 2}</span>
                <span>0</span>
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="relative">
                    <svg
                        viewBox={`0 0 ${W} ${H}`}
                        preserveAspectRatio="none"
                        role="img"
                        aria-label={label}
                        className="block h-[220px] w-full border-b border-l border-border"
                    >
                        <title>{label}</title>
                        <path d={`M0 ${H / 2} H${W} M0 0.5 H${W}`} className="stroke-border" strokeDasharray="4 4" fill="none" vectorEffect="non-scaling-stroke" />
                        <path d={grid} className="stroke-muted" fill="none" vectorEffect="non-scaling-stroke" />
                        <path d={band} className="fill-primary/10" stroke="none" />
                        <path d={fails} className="stroke-red-600" strokeWidth={2} fill="none" vectorEffect="non-scaling-stroke" />
                        <path d={line} className="stroke-primary" strokeWidth={1.5} strokeLinejoin="round" fill="none" vectorEffect="non-scaling-stroke" />
                    </svg>
                    {!hasData && (
                        <p className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">
                            {t("monitoring.latency.empty")}
                        </p>
                    )}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                    {ticks.map((tick, index) => (
                        <span key={tick} className={cn(index % 2 === 1 && "hidden sm:inline")}>
                            {format(tick, tickFormat)}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
