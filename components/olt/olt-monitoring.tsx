"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { keepPreviousData } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import Card from "@/components/card";
import DashboardFilterSelect from "@/components/dashboard/dashboard-filter-select";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import MyBadge from "@/components/my-badge";
import MyButton from "@/components/my-button";
import { Skeleton } from "@/components/ui/skeleton";
import LoadError from "@/components/monitoring/load-error";
import MonitorStateBadge from "@/components/monitoring/monitor-state-badge";
import PingDialog from "@/components/monitoring/ping-dialog";
import { BarTone, LatencyChart, Legend, StatusBars, TimelineBar, TONE_BG } from "@/components/monitoring/monitoring-charts";
import {
    formatDateTime,
    formatMs,
    formatPct,
    toDate,
    useMonitoringFormat,
} from "@/components/monitoring/monitoring-format";
import type { DeviceMonitoring, DeviceOutage, MonitoringPeriod } from "@/components/monitoring/monitoring-type";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { cn } from "@/lib/utils";
import OltChecksTable from "./olt-checks-table";

const PERIODS: { value: MonitoringPeriod; labelKey: string; tick: string }[] = [
    { value: "24h", labelKey: "monitoring.period.24h", tick: "HH:mm" },
    { value: "7d", labelKey: "monitoring.period.7d", tick: "dd MMM" },
    { value: "30d", labelKey: "monitoring.period.30d", tick: "dd MMM" },
];

// Latency bucket size (contract: 10 min for 24 h, 1 h for 7 days, 3 h for 30 days) → legend text.
const AVERAGE_KEYS: Record<number, string> = {
    600: "monitoring.latency.avg_10m",
    3600: "monitoring.latency.avg_1h",
    10800: "monitoring.latency.avg_3h",
};

const SHORT_OUTAGE_SECONDS = 30 * 60;

function dayTone(day: DeviceMonitoring["daily"][number]): BarTone {
    if (!day.monitored) return "none";
    if (day.down_seconds <= 0) return "up";
    return day.down_seconds < SHORT_OUTAGE_SECONDS ? "warn" : "down";
}

const seconds = (from: string, to: string) =>
    Math.max(0, ((toDate(to)?.getTime() ?? 0) - (toDate(from)?.getTime() ?? 0)) / 1000);

const swatch = (className: string) => cn("h-2.5 w-2.5 rounded-sm", className);
const dot = (className: string) => cn("h-2.5 w-2.5 rounded-full", className);

interface Props {
    deviceId: string;
}

export default function OltMonitoring({ deviceId }: Props) {
    const { t } = useTranslation();
    const { duration, relative, secondsSince } = useMonitoringFormat();
    const [period, setPeriod] = useState<MonitoringPeriod>("7d");
    const { data, isLoading, isFetching, error, refetch } = useApiQuery<ApiResponse<DeviceMonitoring>>({
        queryKey: ["device-monitoring", deviceId],
        url: `devices/${deviceId}/monitoring`,
        params: { period },
        pagination: false,
        refetchInterval: 60_000,
        placeholderData: keepPreviousData,
    });

    if (isLoading) {
        return (
            <div className="flex flex-col gap-5" aria-busy>
                <Skeleton className="h-10 w-80" />
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                    {[1, 2, 3, 4, 5, 6].map((key) => (
                        <Skeleton key={key} className="h-24" />
                    ))}
                </div>
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-72 w-full" />
            </div>
        );
    }

    const monitoring = data?.data;
    if (!monitoring) return <LoadError error={error} onRetry={() => refetch()} loading={isFetching} />;

    const { device, stats } = monitoring;
    const periodInfo = PERIODS.find((item) => item.value === monitoring.period) ?? PERIODS[1];
    const downSeconds = monitoring.timeline
        .filter((segment) => segment.state === "down")
        .reduce((sum, segment) => sum + seconds(segment.from, segment.to), 0);
    const resolvedDurations = monitoring.outages
        .filter((outage) => outage.status === "resolved" && outage.duration_seconds != null)
        .map((outage) => outage.duration_seconds as number);
    const longest = resolvedDurations.length ? Math.max(...resolvedDurations) : null;

    const statCards = [
        {
            label: t("monitoring.stats.uptime"),
            value: formatPct(stats.uptime_pct),
            sub: t(`monitoring.period.last_${monitoring.period}`),
            className: stats.uptime_pct != null ? "text-green-700 dark:text-green-400" : undefined,
        },
        {
            label: t("monitoring.stats.avg_latency"),
            value: formatMs(stats.avg_rtt_ms),
            sub: t("monitoring.stats.p95", { value: formatMs(stats.p95_rtt_ms) }),
        },
        { label: t("monitoring.stats.loss"), value: formatPct(stats.loss_pct, true), sub: t("monitoring.stats.loss_sub") },
        {
            label: t("monitoring.stats.outages"),
            value: stats.outages,
            sub: t("monitoring.stats.down_total", { duration: duration(downSeconds) }),
            className: stats.outages > 0 ? "text-destructive" : undefined,
        },
        {
            label: t("monitoring.stats.mttr"),
            value: duration(stats.mttr_seconds),
            sub: longest != null ? t("monitoring.stats.longest", { duration: duration(longest) }) : "",
        },
        {
            label: t("monitoring.stats.checks"),
            value: stats.checks.toLocaleString("en-US"),
            sub: device.check_interval_minutes
                ? t("monitoring.every_minutes", { count: device.check_interval_minutes })
                : "",
        },
    ];

    const days = monitoring.daily.map((day) => {
        const label = format(parseISO(day.date), "dd MMM");
        const text = !day.monitored
            ? t("monitoring.uptime_90d.not_monitored")
            : day.down_seconds > 0
                ? `${formatPct(100 - (day.down_seconds / 86400) * 100)} · ${t("monitoring.uptime_90d.down_for", { duration: duration(day.down_seconds) })}`
                : `${formatPct(100)} · ${t("monitoring.uptime_90d.no_downtime")}`;
        return { tone: dayTone(day), title: `${label} · ${text}` };
    });

    const liveLine = device.monitor_enabled
        ? [
              t("monitoring.live"),
              t("monitoring.checked_ago", { time: relative(device.last_checked_at) }),
              device.check_interval_minutes ? t("monitoring.every_minutes", { count: device.check_interval_minutes }) : null,
              device.device_ip,
          ]
        : [t("monitoring.not_monitored"), device.device_ip];

    const outageColumns: ColumnDef<DeviceOutage>[] = [
        {
            id: "started_at",
            header: ({ column }) => <DataTableColumnHeader column={column} title="monitoring.outages.started" />,
            cell: ({ row }) => <span className="tabular-nums">{formatDateTime(row.original.started_at)}</span>,
        },
        {
            id: "resolved_at",
            header: ({ column }) => <DataTableColumnHeader column={column} title="monitoring.outages.ended" />,
            cell: ({ row }) => (
                <span className="tabular-nums">
                    {row.original.resolved_at ? formatDateTime(row.original.resolved_at) : t("monitoring.outages.ongoing")}
                </span>
            ),
        },
        {
            id: "duration",
            header: ({ column }) => <DataTableColumnHeader column={column} title="monitoring.outages.duration" />,
            cell: ({ row }) => (
                <span className="font-semibold tabular-nums">
                    {duration(row.original.duration_seconds ?? secondsSince(row.original.started_at))}
                </span>
            ),
        },
        {
            id: "type",
            header: ({ column }) => <DataTableColumnHeader column={column} title="monitoring.outages.type" />,
            cell: ({ row }) => t(`monitoring.outage_type.${row.original.type}`),
        },
        {
            id: "affected_clients",
            header: ({ column }) => <DataTableColumnHeader column={column} title="monitoring.outages.affected_clients" />,
            cell: ({ row }) => <span className="tabular-nums">{row.original.affected_clients ?? "—"}</span>,
        },
        {
            id: "acknowledged",
            header: ({ column }) => <DataTableColumnHeader column={column} title="monitoring.outages.acknowledged" />,
            cell: ({ row }) => {
                const { acknowledged_by, acknowledged_at, note } = row.original;
                const at = toDate(acknowledged_at);
                return (
                    <div className="flex max-w-xs flex-col">
                        <span>{acknowledged_by ? [acknowledged_by, at && format(at, "HH:mm")].filter(Boolean).join(" · ") : "—"}</span>
                        {note && <span className="text-xs text-muted-foreground">{note}</span>}
                    </div>
                );
            },
        },
        {
            id: "status",
            header: ({ column }) => <DataTableColumnHeader column={column} title="monitoring.outages.status" />,
            cell: ({ row }) =>
                row.original.status === "open" ? (
                    <MyBadge type="decline" variant="soft" size="sm">
                        {t("monitoring.outages.open")}
                    </MyBadge>
                ) : (
                    <MyBadge type="resolved" variant="soft" size="sm">
                        {t("monitoring.outages.resolved")}
                    </MyBadge>
                ),
        },
    ];

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-3">
                <MyButton
                    variant="default"
                    size="icon"
                    url={`/olts/view/${device.olt_id ?? deviceId}`}
                    aria-label={t("olt.monitoring.back")}
                >
                    <ArrowLeft className="h-4 w-4" />
                </MyButton>
                <div className="flex min-w-0 flex-col">
                    <div className="flex flex-wrap items-center gap-2.5">
                        <h1 className="text-lg font-semibold">{t("olt.monitoring.heading", { name: device.name })}</h1>
                        <MonitorStateBadge state={device.monitor_state} />
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                        {device.monitor_enabled && (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-green-600 ring-[3px] ring-green-600/20" />
                        )}
                        {liveLine.filter(Boolean).join(" · ")}
                    </span>
                </div>
                <div className="ml-auto flex items-center gap-2 text-sm">
                    <PingDialog deviceId={device.id} deviceName={device.name} />
                    {isFetching && monitoring.period !== period && (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-label={t("common.loading")} />
                    )}
                    <span>{t("monitoring.period.label")}</span>
                    <DashboardFilterSelect
                        value={period}
                        onValueChange={(value) => setPeriod(value as MonitoringPeriod)}
                        options={PERIODS}
                        placeholderKey="monitoring.period.label"
                        ariaLabel={t("monitoring.period.label")}
                        className="h-9 w-32"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                {statCards.map((card) => (
                    <Card key={card.label} className="px-3.5 py-3">
                        <h2 className="text-sm font-medium text-muted-foreground">{card.label}</h2>
                        <div className={cn("mt-1 text-xl font-bold tabular-nums", card.className)}>{card.value}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground">{card.sub}</div>
                    </Card>
                ))}
            </div>

            <Card className="flex flex-col gap-2.5 p-4">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <h2 className="flex-1 text-base font-semibold">{t("monitoring.uptime_90d.title")}</h2>
                    <Legend
                        label={t("monitoring.legend.bar_colours")}
                        items={[
                            { label: t("monitoring.uptime_90d.no_downtime"), swatch: swatch(TONE_BG.up) },
                            { label: t("monitoring.uptime_90d.short"), swatch: swatch(TONE_BG.warn) },
                            { label: t("monitoring.uptime_90d.long"), swatch: swatch(TONE_BG.down) },
                            { label: t("monitoring.uptime_90d.not_monitored"), swatch: swatch(TONE_BG.none) },
                        ]}
                    />
                </div>
                <StatusBars bars={days} label={t("monitoring.uptime_90d.label")} className="h-10" />
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{t("monitoring.uptime_90d.start")}</span>
                    <span className="font-semibold text-foreground">
                        {monitoring.uptime_90d == null
                            ? t("monitoring.no_checks")
                            : t("monitoring.uptime_value", { value: formatPct(monitoring.uptime_90d) })}
                    </span>
                    <span>{t("monitoring.uptime_90d.today")}</span>
                </div>
            </Card>

            <Card className="flex flex-col gap-2.5 p-4">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <h2 className="flex-1 text-base font-semibold">{t("monitoring.latency.title")}</h2>
                    <Legend
                        items={[
                            {
                                label: t(AVERAGE_KEYS[monitoring.latency.bucket_seconds] ?? "monitoring.latency.avg"),
                                swatch: "h-0.5 w-3.5 bg-primary",
                            },
                            { label: t("monitoring.latency.range"), swatch: "h-2.5 w-3.5 bg-primary/10" },
                            { label: t("monitoring.latency.no_reply"), swatch: "h-3 w-0.5 bg-red-600" },
                        ]}
                    />
                </div>
                <LatencyChart
                    points={monitoring.latency.points}
                    from={monitoring.from}
                    to={monitoring.to}
                    label={t("monitoring.latency.label", { period: t(periodInfo.labelKey) })}
                    tickFormat={periodInfo.tick}
                />
            </Card>

            <Card className="flex flex-col gap-2.5 p-4">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <h2 className="flex-1 text-base font-semibold">{t("monitoring.timeline.title")}</h2>
                    <Legend
                        label={t("monitoring.timeline.legend")}
                        items={[
                            { label: t("monitoring.state.up"), swatch: dot("bg-green-600") },
                            { label: t("monitoring.state.down"), swatch: dot("bg-red-600") },
                            { label: t("monitoring.state.unknown"), swatch: dot("bg-slate-400") },
                        ]}
                    />
                </div>
                <TimelineBar
                    segments={monitoring.timeline}
                    from={monitoring.from}
                    to={monitoring.to}
                    label={t("monitoring.timeline.label", { period: t(periodInfo.labelKey) })}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatDateTime(monitoring.from)}</span>
                    <span>{formatDateTime(monitoring.to)}</span>
                </div>
            </Card>

            <section className="flex flex-col gap-2.5">
                <h2 className="text-base font-semibold">
                    {t("monitoring.outages.title", { count: monitoring.outages.length })}
                </h2>
                <DataTable data={monitoring.outages} columns={outageColumns} toolbar={false} />
            </section>

            <OltChecksTable deviceId={deviceId} period={period} />
        </div>
    );
}
