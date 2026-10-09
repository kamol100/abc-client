"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { format } from "date-fns";
import { CheckCircle2, Navigation, RefreshCw, Users, Wrench } from "lucide-react";
import { useTranslation } from "react-i18next";
import Card from "@/components/card";
import MyBadge from "@/components/my-badge";
import MyButton from "@/components/my-button";
import { Skeleton } from "@/components/ui/skeleton";
import LoadError from "@/components/monitoring/load-error";
import PingDialog from "@/components/monitoring/ping-dialog";
import { formatDateTime, toDate, useMonitoringFormat } from "@/components/monitoring/monitoring-format";
import { usePermissions } from "@/context/app-provider";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { cn } from "@/lib/utils";
import type { NocMapMarker } from "./noc-map-canvas";

const NocMapCanvas = dynamic(() => import("./noc-map-canvas"), {
    ssr: false,
    loading: () => <Skeleton className="h-[340px] w-full rounded-md border border-border" />,
});

type NameRef = { name: string } | null;

// GET /monitoring/summary
interface NocSummary {
    generated_at: string;
    counts: { down: number; unknown: number; up: number; open_outages: number };
    maintenance: { id: string; device: NameRef; network: NameRef; starts_at: string; ends_at: string; reason: string | null }[];
    down_devices: {
        id: string;
        name: string;
        category: string;
        network: NameRef;
        zone: NameRef;
        device_ip: string | null;
        latitude: number | null;
        longitude: number | null;
        down_since: string | null;
        affected_clients: number | null;
        in_maintenance: boolean;
        is_olt: boolean;
    }[];
    open_outages: {
        id: string;
        title: string;
        device_id: string | null;
        type: string;
        started_at: string;
        affected_clients: number | null;
        acknowledged: boolean;
        ticket: { id: string; number: number | string } | null;
        during_maintenance: boolean;
        downstream: boolean;
    }[];
}

const AMBER_BADGE = "text-amber-800 dark:text-amber-300";

// Not map-utils' toLatLngTuple: that module imports Leaflet, which cannot load during SSR.
function position(device: NocSummary["down_devices"][number]): [number, number] | null {
    const lat = Number(device.latitude);
    const lng = Number(device.longitude);
    if (device.latitude == null || device.longitude == null || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return Math.abs(lat) <= 90 && Math.abs(lng) <= 180 ? [lat, lng] : null;
}

export default function NocView() {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();
    const { duration, secondsSince } = useMonitoringFormat();
    const { data, isLoading, isFetching, error, refetch } = useApiQuery<ApiResponse<NocSummary>>({
        queryKey: ["noc"],
        url: "monitoring/summary",
        pagination: false,
        refetchInterval: 30_000,
    });

    const canShowOlt = hasPermission("olts.show");
    const canShowTicket = hasPermission("tickets.show") || hasPermission("tickets.access");
    const summary = data?.data;

    const content = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col gap-4" aria-busy>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        {[1, 2, 3, 4].map((key) => (
                            <Skeleton key={key} className="h-20" />
                        ))}
                    </div>
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-[340px] w-full" />
                </div>
            );
        }
        if (!summary) return <LoadError error={error} onRetry={() => refetch()} loading={isFetching} />;

        const counts = [
            { key: "down", value: summary.counts.down, className: "text-destructive" },
            { key: "unknown", value: summary.counts.unknown, className: "text-muted-foreground" },
            { key: "up", value: summary.counts.up, className: "text-green-700 dark:text-green-400" },
            { key: "open_outages", value: summary.counts.open_outages, className: "" },
        ];
        const downFor = (since: string | null) => duration(secondsSince(since));
        const markers: NocMapMarker[] = summary.down_devices.flatMap((device) => {
            const latLng = position(device);
            if (!latLng) return [];
            const text = `${t("noc.down_for", { duration: downFor(device.down_since) })} · ${t("noc.clients", { count: device.affected_clients ?? 0 })}`;
            return [{ id: device.id, name: device.name, position: latLng, text }];
        });

        return (
            <>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {counts.map((count) => (
                        <Card key={count.key} className="px-4 py-3.5">
                            <div className="text-sm text-muted-foreground">{t(`noc.counts.${count.key}`)}</div>
                            <div className={cn("text-2xl font-semibold tabular-nums", count.className)}>{count.value}</div>
                        </Card>
                    ))}
                </div>

                {summary.maintenance.map((window) => {
                    const values = {
                        target: window.device?.name ?? window.network?.name ?? t("noc.maintenance_all"),
                        until: formatDateTime(window.ends_at),
                        reason: window.reason,
                    };
                    return (
                        <div
                            key={window.id}
                            role="note"
                            className="flex items-start gap-2.5 rounded-lg border border-amber-300 bg-amber-100/40 px-3 py-2.5 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300"
                        >
                            <Wrench className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                            <span>{t(window.reason ? "noc.maintenance_reason" : "noc.maintenance", values)}</span>
                        </div>
                    );
                })}

                <h2 className="mt-2 text-lg font-semibold">{t("noc.down_devices")}</h2>
                {summary.down_devices.length === 0 ? (
                    <Card className="flex items-center gap-2 px-4 py-3.5 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden />
                        {t("noc.no_down_devices")}
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {summary.down_devices.map((device) => {
                            const latLng = position(device);
                            const meta = [
                                t(`monitoring.category.${device.category}`, { defaultValue: device.category }),
                                device.network?.name,
                                device.zone?.name,
                            ].filter(Boolean);
                            return (
                                <article
                                    key={device.id}
                                    className="flex flex-col gap-2.5 rounded-lg border border-red-300 bg-card p-4 dark:border-red-900"
                                >
                                    <div className="flex items-start gap-2">
                                        <div className="min-w-0 flex-1">
                                            {device.is_olt && canShowOlt ? (
                                                <Link href={`/olts/view/${device.id}`} className="font-semibold hover:underline">
                                                    {device.name}
                                                </Link>
                                            ) : (
                                                <div className="font-semibold">{device.name}</div>
                                            )}
                                            <div className="text-xs text-muted-foreground">{meta.join(" · ")}</div>
                                        </div>
                                        {device.in_maintenance && (
                                            <MyBadge type="warning" variant="soft" size="sm" icon={false} className={AMBER_BADGE}>
                                                {t("noc.badges.maintenance")}
                                            </MyBadge>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3.5 text-sm">
                                        <span className="font-semibold text-destructive">
                                            {t("noc.down_for", { duration: downFor(device.down_since) })}
                                        </span>
                                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                                            <Users className="h-3.5 w-3.5" aria-hidden />
                                            {t("noc.clients", { count: device.affected_clients ?? 0 })}
                                        </span>
                                        {device.device_ip && <span className="font-mono text-xs">{device.device_ip}</span>}
                                    </div>
                                    <div className="flex gap-2">
                                        <PingDialog deviceId={device.id} deviceName={device.name} />
                                        {latLng && (
                                            <MyButton asChild variant="outline" size="sm">
                                                <a
                                                    href={`https://www.google.com/maps/dir/?api=1&destination=${latLng[0]},${latLng[1]}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <Navigation className="h-4 w-4" aria-hidden />
                                                    {t("noc.directions")}
                                                </a>
                                            </MyButton>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}

                {markers.length > 0 && (
                    <section aria-label={t("noc.map_label")}>
                        <NocMapCanvas markers={markers} />
                    </section>
                )}

                <h2 className="mt-2 text-lg font-semibold">{t("noc.open_outages")}</h2>
                {summary.open_outages.length === 0 ? (
                    <Card className="px-4 py-3.5 text-sm text-muted-foreground">{t("noc.no_open_outages")}</Card>
                ) : (
                    <ul className="rounded-lg border border-border">
                        {summary.open_outages.map((outage) => (
                            <li
                                key={outage.id}
                                className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b px-3.5 py-3 last:border-b-0"
                            >
                                <div className="min-w-0 flex-[1_1_320px]">
                                    <div className="font-semibold">{outage.title}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {t("noc.outage_started", {
                                            ago: duration(secondsSince(outage.started_at)),
                                            count: outage.affected_clients ?? 0,
                                        })}
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    {outage.during_maintenance && (
                                        <MyBadge type="warning" variant="soft" size="sm" icon={false} className={AMBER_BADGE}>
                                            {t("noc.badges.maintenance")}
                                        </MyBadge>
                                    )}
                                    {outage.downstream && (
                                        <MyBadge type="info" variant="soft" size="sm" icon={false}>
                                            {t("noc.badges.downstream")}
                                        </MyBadge>
                                    )}
                                    {outage.acknowledged && (
                                        <MyBadge type="info" variant="soft" size="sm" icon={false}>
                                            {t("noc.badges.acknowledged")}
                                        </MyBadge>
                                    )}
                                    {outage.ticket &&
                                        (canShowTicket ? (
                                            <Link href={`/tickets/view/${outage.ticket.id}`} className="text-sm font-medium underline-offset-4 hover:underline">
                                                {t("noc.ticket", { number: outage.ticket.number })}
                                            </Link>
                                        ) : (
                                            <span className="text-sm">{t("noc.ticket", { number: outage.ticket.number })}</span>
                                        ))}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </>
        );
    };

    const generatedAt = toDate(summary?.generated_at);

    return (
        <div>
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
                <h1 className="sr-only">{t("noc.title")}</h1>
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">
                        {generatedAt
                            ? t("noc.updated", { time: format(generatedAt, "HH:mm:ss") })
                            : t("noc.refreshes")}
                    </span>
                    <MyButton type="button" variant="outline" onClick={() => refetch()} loading={isFetching}>
                        {!isFetching && <RefreshCw className="h-4 w-4" aria-hidden />}
                        {t("common.refresh")}
                    </MyButton>
                </div>
                {content()}
            </div>
        </div>
    );
}
