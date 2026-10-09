"use client";

import { FC, ReactNode } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import Card from "@/components/card";
import DisplayCount from "@/components/display-count";
import MyButton from "@/components/my-button";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardMetricCard, DashboardMetricRow } from "@/components/dashboard/items/DashboardMetricCard";
import LoadError from "@/components/monitoring/load-error";
import MonitorStateBadge from "@/components/monitoring/monitor-state-badge";
import PingDialog from "@/components/monitoring/ping-dialog";
import { StatusBars } from "@/components/monitoring/monitoring-charts";
import { formatMs, formatPct, toDate, useMonitoringFormat } from "@/components/monitoring/monitoring-format";
import { usePermissions } from "@/context/app-provider";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { cn } from "@/lib/utils";
import OltAccessPanel from "./olt-access";
import OltAttention from "./olt-attention";
import OltClientsTable from "./olt-clients-table";
import { OltDetail } from "./olt-type";

const GREEN = "text-green-700 dark:text-green-400";
const AMBER = "text-amber-700 dark:text-amber-400";
const RED = "text-destructive";

/** Colours a counter only when it is non-zero. */
const tone = (count: number, className: string) => (count > 0 ? className : undefined);

function Metric({ title, value, rows }: { title: string; value: ReactNode; rows: [string, ReactNode, string?][] }) {
    return (
        <DashboardMetricCard title={<h2 className="text-sm font-semibold">{title}</h2>} value={value}>
            {rows.map(([label, rowValue, className]) => (
                <DashboardMetricRow
                    key={label}
                    label={label}
                    value={<span className={cn("tabular-nums", className)}>{rowValue}</span>}
                    className="text-sm"
                />
            ))}
        </DashboardMetricCard>
    );
}

interface Props {
    oltId: string;
}

const OltView: FC<Props> = ({ oltId }) => {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();
    const { duration, relative } = useMonitoringFormat();
    const { data, isLoading, isFetching, error, refetch } = useApiQuery<ApiResponse<OltDetail>>({
        queryKey: ["olts", "detail", oltId],
        url: `olts/${oltId}`,
        pagination: false,
        refetchInterval: 60_000,
    });

    if (isLoading) {
        return (
            <div className="flex flex-col gap-4" aria-busy>
                <Skeleton className="h-10 w-72" />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                    <Skeleton className="h-40 sm:col-span-2" />
                    {[1, 2, 3, 4].map((key) => (
                        <Skeleton key={key} className="h-40" />
                    ))}
                </div>
                <Skeleton className="h-72 w-full" />
            </div>
        );
    }

    const detail = data?.data;
    if (!detail) return <LoadError error={error} onRetry={() => refetch()} loading={isFetching} />;

    const { olt, monitoring, clients, onus, optical, billing } = detail;
    const canMonitor = hasPermission("devices.monitoring");
    const facts = [
        olt.vendor && t(`olt.vendor.${olt.vendor}`, { defaultValue: olt.vendor }),
        olt.model,
        olt.device_ip,
        olt.network?.name,
        t("olt.view.direct"),
    ].filter(Boolean);

    const bars = monitoring.bars.map((bar) => {
        const start = toDate(bar.start);
        const time = start ? format(start, "HH:mm") : "";
        const state =
            bar.state === "down"
                ? bar.down_seconds > 0
                    ? t("olt.monitoring_card.bar_down_for", { duration: duration(bar.down_seconds) })
                    : t("monitoring.state.down")
                : bar.state === "up"
                    ? t("monitoring.state.up")
                    : t("olt.monitoring_card.bar_none");
        return { tone: bar.state, title: `${time} · ${state}` };
    });
    const uptimeText =
        monitoring.uptime_24h == null
            ? t("monitoring.no_checks")
            : t("monitoring.uptime_value", { value: formatPct(monitoring.uptime_24h) });

    const monitoringBody = (
        <>
            <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold">{t("olt.monitoring_card.title")}</h2>
                {olt.monitor_enabled && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="h-2 w-2 rounded-full bg-green-600 ring-[3px] ring-green-600/20" />
                        {t("monitoring.live")}
                    </span>
                )}
                <MonitorStateBadge state={olt.monitor_state} className="ml-auto" />
            </div>
            <StatusBars bars={bars} label={t("olt.monitoring_card.bars_label")} className="h-[30px]" />
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t("olt.monitoring_card.ago_24h")}</span>
                <span className="font-semibold text-foreground">{uptimeText}</span>
                <span>{t("olt.monitoring_card.now")}</span>
            </div>
            <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 text-sm">
                <span>
                    <span className="text-muted-foreground">{t("olt.monitoring_card.latency")}:</span>{" "}
                    <strong className="tabular-nums">{formatMs(olt.last_rtt_ms)}</strong>
                </span>
                <span>
                    <span className="text-muted-foreground">{t("olt.monitoring_card.checked")}:</span>{" "}
                    <strong>{relative(olt.last_checked_at)}</strong>
                </span>
                {canMonitor && (
                    <span className="inline-flex items-center gap-1 font-medium">
                        {t("olt.monitoring_card.details")}
                        <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                )}
            </div>
        </>
    );
    const monitoringCardClass =
        "flex flex-col gap-2 rounded-lg border bg-card p-4 text-card-foreground shadow-sm sm:col-span-2";

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
                <MyButton variant="default" size="icon" url="/olts" aria-label={t("olt.view.back")}>
                    <ArrowLeft className="h-4 w-4" />
                </MyButton>
                <div className="flex min-w-0 flex-col">
                    <div className="flex flex-wrap items-center gap-2.5">
                        <h1 className="text-lg font-semibold">{olt.name}</h1>
                        <MonitorStateBadge state={olt.monitor_state} />
                    </div>
                    <span className="text-sm text-muted-foreground">{facts.join(" · ")}</span>
                </div>
                <div className="ml-auto">
                    <PingDialog deviceId={olt.id} deviceName={olt.name} />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                {canMonitor ? (
                    <Link
                        href={`/olts/view/${oltId}/monitoring`}
                        aria-label={t("olt.monitoring_card.aria", {
                            state: t(`monitoring.state.${olt.monitor_state}`),
                            uptime: uptimeText,
                        })}
                        className={cn(
                            monitoringCardClass,
                            "transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        )}
                    >
                        {monitoringBody}
                    </Link>
                ) : (
                    <section className={monitoringCardClass}>{monitoringBody}</section>
                )}
                <Metric
                    title={t("olt.metrics.clients")}
                    value={clients.total}
                    rows={[
                        [t("olt.metrics.online"), clients.online, GREEN],
                        [t("olt.metrics.offline"), clients.offline, tone(clients.offline, RED)],
                        [t("olt.metrics.disabled"), clients.disabled, "text-muted-foreground"],
                    ]}
                />
                <Metric
                    title={t("olt.metrics.onus")}
                    value={`${onus.online}/${onus.total}`}
                    rows={[
                        [t("olt.metrics.los"), onus.los, tone(onus.los, RED)],
                        [t("olt.metrics.dying_gasp"), onus.dying_gasp, tone(onus.dying_gasp, RED)],
                        [t("olt.metrics.offline"), onus.offline, tone(onus.offline, RED)],
                    ]}
                />
                <Metric
                    title={t("olt.metrics.optical")}
                    value={<span className={tone(optical.low, RED)}>{t("olt.metrics.low_value", { count: optical.low })}</span>}
                    rows={[
                        [t("olt.metrics.below_threshold", { threshold: optical.threshold_dbm }), optical.low, tone(optical.low, RED)],
                        [t("olt.metrics.near_limit"), optical.near_limit, tone(optical.near_limit, AMBER)],
                        [t("olt.metrics.too_strong"), optical.too_strong, tone(optical.too_strong, AMBER)],
                        [t("olt.metrics.threshold"), `${optical.threshold_dbm} dBm`],
                    ]}
                />
                <Metric
                    title={t("olt.metrics.billing")}
                    value={<DisplayCount amount={billing.due_total} formatCurrency />}
                    rows={[
                        [t("olt.metrics.clients_with_due"), billing.clients_with_due],
                        [t("olt.metrics.expired"), billing.expired, tone(billing.expired, RED)],
                        [t("olt.metrics.due_this_week"), billing.due_this_week],
                    ]}
                />
            </div>

            <div className="grid items-start gap-4 lg:grid-cols-3">
                <OltAttention items={detail.attention} className="lg:col-span-2" />
                <div className="flex min-w-0 flex-col gap-4">
                    <Card className="overflow-hidden">
                        <h2 className="border-b bg-muted/60 px-3.5 py-2.5 text-sm font-semibold">{t("olt.pon_ports.title")}</h2>
                        <div className="flex flex-col gap-2.5 px-3.5 py-2.5">
                            {detail.pon_ports.length === 0 && (
                                <p className="py-4 text-center text-sm text-muted-foreground">{t("olt.pon_ports.empty")}</p>
                            )}
                            {detail.pon_ports.map((port) => {
                                const linkDown = port.oper_state === "down";
                                const pct = port.onu_total ? Math.round((port.onu_online / port.onu_total) * 100) : 0;
                                const online = t("olt.pon_ports.online", { online: port.onu_online, total: port.onu_total });
                                const text = linkDown
                                    ? `${t("olt.pon_ports.link_down")} · ${port.onu_total ? online : t("olt.pon_ports.no_onus")}`
                                    : online;
                                return (
                                    <div key={port.id} className="flex flex-col gap-1">
                                        <div className="flex justify-between gap-2 text-sm">
                                            <span className="font-semibold">{port.name}</span>
                                            <span className={cn("tabular-nums", linkDown ? RED : "text-muted-foreground")}>{text}</span>
                                        </div>
                                        <div
                                            role="progressbar"
                                            aria-label={`${port.name}: ${text}`}
                                            aria-valuemin={0}
                                            aria-valuemax={100}
                                            aria-valuenow={pct}
                                            className="h-2 overflow-hidden rounded-full bg-muted"
                                        >
                                            <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                    <OltAccessPanel oltId={oltId} access={detail.access} />
                </div>
            </div>

            {hasPermission("olts.clients") && (
                <div className="border-t pt-4">
                    <OltClientsTable
                        oltId={oltId}
                        summary={clients}
                        ponPorts={detail.pon_ports}
                        thresholdDbm={optical.threshold_dbm}
                    />
                </div>
            )}
        </div>
    );
};

export default OltView;
