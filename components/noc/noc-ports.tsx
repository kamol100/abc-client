"use client";

import Link from "next/link";
import { CheckCircle2, ChevronDown, Info, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import Card from "@/components/card";
import MyBadge from "@/components/my-badge";
import { formatDateTime, useMonitoringFormat } from "@/components/monitoring/monitoring-format";
import { notPolledReasonKey, NocSummary } from "./noc-type";

interface Props {
    portsDown: NonNullable<NocSummary["ports_down"]>;
    portMonitoring: NocSummary["port_monitoring"];
    canShowOlt: boolean;
}

/** "Port monitoring is off or out of date for N of M OLTs", expandable to the OLTs and why. */
function NotPolledNotice({ monitoring, canShowOlt }: { monitoring: NonNullable<Props["portMonitoring"]>; canShowOlt: boolean }) {
    const { t } = useTranslation();
    const { relative } = useMonitoringFormat();
    return (
        <details className="group rounded-lg border border-border bg-muted/40 text-sm">
            <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 [&::-webkit-details-marker]:hidden">
                <Info className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                <span className="flex-1">
                    {t("noc.not_polled.summary", { count: monitoring.not_polled.length, total: monitoring.olts_total })}
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            <ul className="border-t">
                {monitoring.not_polled.map((olt) => (
                    <li key={olt.olt_id} className="flex flex-wrap items-center gap-x-3 gap-y-0.5 border-b px-3 py-2 last:border-b-0">
                        {canShowOlt ? (
                            <Link href={`/olts/view/${olt.olt_id}`} className="font-medium hover:underline">
                                {olt.olt_name}
                            </Link>
                        ) : (
                            <span className="font-medium">{olt.olt_name}</span>
                        )}
                        <span className="text-muted-foreground">{t(`noc.not_polled.reasons.${notPolledReasonKey(olt.reason)}`)}</span>
                        <span
                            className="text-xs text-muted-foreground sm:ml-auto"
                            title={olt.last_polled_at ? formatDateTime(olt.last_polled_at) : undefined}
                        >
                            {t("noc.not_polled.last_polled", { time: relative(olt.last_polled_at) })}
                        </span>
                    </li>
                ))}
            </ul>
        </details>
    );
}

/** NOC "Ports down": PON and uplink ports whose link is down, in the API's order. */
export default function NocPorts({ portsDown, portMonitoring, canShowOlt }: Props) {
    const { t } = useTranslation();
    const { duration, secondsSince } = useMonitoringFormat();

    return (
        <section className="flex flex-col gap-3" aria-labelledby="noc-ports-down">
            <h2 id="noc-ports-down" className="mt-2 text-lg font-semibold">
                {t("noc.ports_down")}
            </h2>
            {portMonitoring && portMonitoring.not_polled.length > 0 && (
                <NotPolledNotice monitoring={portMonitoring} canShowOlt={canShowOlt} />
            )}
            {portsDown.length === 0 && portMonitoring?.olts_total && !portMonitoring.olts_polled ? (
                <Card className="px-4 py-3.5 text-sm text-muted-foreground">{t("noc.no_ports_monitored")}</Card>
            ) : portsDown.length === 0 ? (
                <Card className="flex items-center gap-2 px-4 py-3.5 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden />
                    {t("noc.no_ports_down")}
                </Card>
            ) : (
                <ul className="rounded-lg border border-red-300 dark:border-red-900">
                    {portsDown.map((port) => (
                        <li
                            key={`${port.olt_id}-${port.port_type}-${port.port_id}`}
                            className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-b px-3.5 py-3 last:border-b-0"
                        >
                            <div className="min-w-0 flex-[1_1_260px]">
                                <div className="font-semibold">
                                    {canShowOlt ? (
                                        <Link href={`/olts/view/${port.olt_id}`} className="hover:underline">
                                            {port.olt_name}
                                        </Link>
                                    ) : (
                                        port.olt_name
                                    )}
                                    <span className="text-muted-foreground"> · </span>
                                    {port.name}
                                </div>
                                <div className="text-xs text-muted-foreground">{t(`noc.port_type.${port.port_type}`)}</div>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-sm">
                                <span className="font-semibold text-destructive" title={formatDateTime(port.down_since)}>
                                    {port.down_since
                                        ? t("noc.down_for", { duration: duration(secondsSince(port.down_since)) })
                                        : t("monitoring.state.down")}
                                </span>
                                {port.onu_total != null && (
                                    <span className="text-muted-foreground">{t("noc.onus_on_port", { count: port.onu_total })}</span>
                                )}
                                <span className="inline-flex items-center gap-1 text-muted-foreground">
                                    <Users className="h-3.5 w-3.5" aria-hidden />
                                    {t("noc.clients", { count: port.affected_clients ?? 0 })}
                                </span>
                                {port.acknowledged && (
                                    <MyBadge type="info" variant="soft" size="sm" icon={false}>
                                        {t("noc.badges.acknowledged")}
                                    </MyBadge>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
