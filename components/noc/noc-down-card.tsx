"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowUpDown, ChevronDown, Hexagon, History, Navigation, Router, Server, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import MyBadge from "@/components/my-badge";
import MyButton from "@/components/my-button";
import PingDialog from "@/components/monitoring/ping-dialog";
import { formatDateTime, useMonitoringFormat } from "@/components/monitoring/monitoring-format";
import OltPortHistory, { HistoryPort } from "@/components/olt/olt-port-history";
import { cn } from "@/lib/utils";
import type { NocDownItem, NocKind } from "@/components/noc/noc-type";

const ICONS: Record<NocKind, typeof Router> = { device: Router, olt: Server, pon: Hexagon, uplink: ArrowUpDown, outage: AlertTriangle };

interface Props {
    item: NocDownItem;
    open: boolean;
    onToggle: () => void;
    canShowOlt: boolean;
    canShowTicket: boolean;
}

// Not map-utils' toLatLngTuple: that module imports Leaflet, which cannot load during SSR.
function position(device: NocDownItem["device"]): [number, number] | null {
    if (!device || device.latitude == null || device.longitude == null) return null;
    const lat = Number(device.latitude);
    const lng = Number(device.longitude);
    return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 ? [lat, lng] : null;
}

/** NOC card for one down device, OLT, port or outage. The header toggles the details. */
export default function NocDownCard({ item, open, onToggle, canShowOlt, canShowTicket }: Props) {
    const { t } = useTranslation();
    const { duration, secondsSince } = useMonitoringFormat();
    const [historyPort, setHistoryPort] = useState<HistoryPort | null>(null);
    const { device, port, outage } = item;
    const Icon = ICONS[item.kind];
    const handled = Boolean(outage?.acknowledged || outage?.ticket);
    const detailsId = `noc-card-${item.key}`;
    const oltId = port?.olt_id ?? (device?.is_olt ? device.id : null);
    const latLng = position(device);

    const title = device?.name ?? (port ? `${port.olt_name} · ${port.name}` : (outage?.title ?? ""));
    const badge = item.kind === "outage" ? t(`monitoring.outage_type.${outage?.type}`, { defaultValue: outage?.type }) : t(`noc.kind.${item.kind}`);
    const meta = device
        ? [t(`monitoring.category.${device.category}`, { defaultValue: device.category }), device.network?.name, device.zone?.name]
        : port
          ? [t(`noc.port_type.${port.port_type}`), port.onu_total != null ? t("noc.onus_on_port", { count: port.onu_total }) : null]
          : [];
    const status = outage?.ticket
        ? t("noc.ticket", { number: outage.ticket.number })
        : outage?.acknowledged
          ? t("noc.badges.acknowledged")
          : t("noc.not_acknowledged");

    const facts: [string, string | null | undefined][] = device
        ? [
              ["noc.fields.ip", device.device_ip],
              ["noc.fields.type", t(`monitoring.category.${device.category}`, { defaultValue: device.category })],
              ["noc.fields.network", device.network?.name],
              ["noc.fields.zone", device.zone?.name],
              ["noc.fields.down_since", item.since && formatDateTime(item.since)],
          ]
        : port
          ? [
                ["noc.fields.olt", port.olt_name],
                ["noc.fields.port", `${port.name} · ${t(`noc.port_type.${port.port_type}`)}`],
                ["noc.fields.onus", port.onu_total?.toString()],
                ["noc.fields.down_since", item.since && formatDateTime(item.since)],
            ]
          : [
                ["noc.fields.type", badge],
                ["noc.fields.started", item.since && formatDateTime(item.since)],
            ];

    return (
        <article
            className={cn(
                "overflow-hidden rounded-lg border bg-card",
                handled ? "border-amber-300 dark:border-amber-800" : "border-red-300 dark:border-red-900",
            )}
        >
            <button
                type="button"
                onClick={onToggle}
                aria-expanded={open}
                aria-controls={detailsId}
                className={cn(
                    "flex w-full flex-wrap items-center gap-x-5 gap-y-3 p-4 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                    open && "bg-muted/40",
                )}
            >
                <span
                    className={cn(
                        "grid h-10 w-10 shrink-0 place-items-center rounded-full",
                        handled
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                    )}
                    aria-hidden
                >
                    <Icon className="h-5 w-5" />
                </span>
                <span className="flex min-w-0 flex-[1_1_320px] flex-col gap-1">
                    <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                        <span className="font-semibold">{title}</span>
                        <MyBadge type={handled ? "warning" : "error"} variant="soft" size="sm" icon={false}>
                            {badge}
                        </MyBadge>
                        {(device?.in_maintenance || outage?.during_maintenance) && (
                            <MyBadge type="warning" variant="soft" size="sm" icon={false}>
                                {t("noc.badges.maintenance")}
                            </MyBadge>
                        )}
                    </span>
                    {meta.some(Boolean) && <span className="text-xs text-muted-foreground">{meta.filter(Boolean).join(" · ")}</span>}
                    {device?.device_ip && <span className="font-mono text-xs text-muted-foreground">{device.device_ip}</span>}
                </span>
                <span className="flex w-28 flex-col">
                    <span className="text-xs text-muted-foreground">{t("noc.down_for_label")}</span>
                    <span
                        className={cn("font-semibold tabular-nums", handled ? "text-amber-700 dark:text-amber-400" : "text-destructive")}
                        title={formatDateTime(item.since)}
                    >
                        {item.since ? duration(secondsSince(item.since)) : t("monitoring.state.down")}
                    </span>
                </span>
                <span className="flex w-28 flex-col">
                    <span className="text-xs text-muted-foreground">{t("noc.clients_label")}</span>
                    <span className="inline-flex items-center gap-1 font-semibold tabular-nums">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                        {item.clients}
                    </span>
                </span>
                <span className={cn("w-32 text-xs font-medium", handled ? "text-muted-foreground" : "text-destructive")}>{status}</span>
                <ChevronDown
                    className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
                    aria-hidden
                />
            </button>

            {open && (
                <div id={detailsId} className="flex flex-col gap-4 border-t p-4">
                    <div className="grid gap-5 md:grid-cols-2">
                        <section className="flex flex-col gap-2.5">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("noc.details")}</h3>
                            <dl className="grid grid-cols-[max-content_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-sm">
                                {facts
                                    .filter(([, value]) => value)
                                    .map(([label, value]) => (
                                        <div key={label} className="contents">
                                            <dt className="text-muted-foreground">{t(label)}</dt>
                                            <dd className="font-medium">{value}</dd>
                                        </div>
                                    ))}
                            </dl>
                            <p className="rounded-md bg-amber-100/50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-900/20 dark:text-amber-300">
                                <span className="font-semibold">{t("noc.check_first")}</span> {t(`noc.hints.${item.kind}`)}
                            </p>
                        </section>

                        {device && (
                            <section className="flex flex-col gap-2.5">
                                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    {t("noc.behind", { count: item.behind.length })}
                                </h3>
                                {item.behind.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">{t("noc.behind_none")}</p>
                                ) : (
                                    <ul className="rounded-md border">
                                        {item.behind.map((o) => (
                                            <li key={o.id} className="flex items-center justify-between gap-3 border-b px-3 py-2 text-sm last:border-b-0">
                                                <span className="min-w-0 truncate font-medium">{o.title}</span>
                                                <span className="shrink-0 text-xs text-muted-foreground">
                                                    {t("noc.clients", { count: o.affected_clients ?? 0 })}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </section>
                        )}
                    </div>

                    {(device || port || (outage?.ticket && canShowTicket)) && (
                        <div className="flex flex-wrap items-center gap-2 border-t pt-4">
                            {device && <PingDialog deviceId={device.id} deviceName={device.name} />}
                            {port && (
                                <MyButton
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setHistoryPort({ type: port.port_type, id: port.port_id, name: `${port.olt_name} · ${port.name}` })}
                                >
                                    <History className="h-4 w-4" aria-hidden />
                                    {t("noc.port_history")}
                                </MyButton>
                            )}
                            {oltId && canShowOlt && (
                                <MyButton asChild variant="outline" size="sm">
                                    <Link href={`/olts/view/${oltId}`}>
                                        <Server className="h-4 w-4" aria-hidden />
                                        {t("noc.open_olt")}
                                    </Link>
                                </MyButton>
                            )}
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
                            {outage?.ticket && canShowTicket && (
                                <MyButton asChild variant="outline" size="sm">
                                    <Link href={`/tickets/view/${outage.ticket.id}`}>{t("noc.open_ticket", { number: outage.ticket.number })}</Link>
                                </MyButton>
                            )}
                        </div>
                    )}
                </div>
            )}

            {port && <OltPortHistory oltId={port.olt_id} port={historyPort} onClose={() => setHistoryPort(null)} />}
        </article>
    );
}
