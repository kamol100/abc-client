"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CheckCircle2, RefreshCw, Wrench } from "lucide-react";
import { useTranslation } from "react-i18next";
import Card from "@/components/card";
import MyButton from "@/components/my-button";
import { Skeleton } from "@/components/ui/skeleton";
import LoadError from "@/components/monitoring/load-error";
import { formatDateTime, toDate } from "@/components/monitoring/monitoring-format";
import { usePermissions } from "@/context/app-provider";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { cn } from "@/lib/utils";
import NocDownCard from "@/components/noc/noc-down-card";
import NotPolledNotice from "@/components/noc/noc-ports";
import { matchesNocFilter, NOC_FILTERS, nocDownItems, NocFilter, NocSummary } from "@/components/noc/noc-type";

/** NOC: one card per down device, OLT, PON port or uplink. A card opens to its details and actions. */
export default function NocView() {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();
    const [filter, setFilter] = useState<NocFilter>("all");
    const [open, setOpen] = useState<Set<string>>(() => new Set());
    const { data, isLoading, isFetching, error, refetch } = useApiQuery<ApiResponse<NocSummary>>({
        queryKey: ["noc"],
        url: "monitoring/summary",
        pagination: false,
        refetchInterval: 30_000,
    });

    const canShowOlt = hasPermission("olts.show");
    const canShowTicket = hasPermission("tickets.show") || hasPermission("tickets.access");
    const summary = data?.data;
    const items = summary ? nocDownItems(summary) : [];
    const shown = items.filter((item) => matchesNocFilter(item, filter));
    const clients = items.reduce((total, item) => total + item.clients, 0);
    const generatedAt = toDate(summary?.generated_at);

    const toggle = (key: string) =>
        setOpen((current) => {
            const next = new Set(current);
            if (!next.delete(key)) next.add(key);
            return next;
        });

    const content = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col gap-3" aria-busy>
                    <Skeleton className="h-10 w-full max-w-xl" />
                    {[1, 2, 3].map((key) => (
                        <Skeleton key={key} className="h-[88px] w-full" />
                    ))}
                </div>
            );
        }
        if (!summary) return <LoadError error={error} onRetry={() => refetch()} loading={isFetching} />;

        const monitoring = summary.port_monitoring;
        return (
            <>
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

                <nav aria-label={t("noc.filter_label")} className="flex flex-wrap gap-2">
                    {NOC_FILTERS.map((key) => {
                        const active = key === filter;
                        return (
                            <button
                                key={key}
                                type="button"
                                aria-pressed={active}
                                onClick={() => setFilter(key)}
                                className={cn(
                                    "inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                    active ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted",
                                )}
                            >
                                {t(`noc.filter.${key}`)}
                                <span
                                    className={cn(
                                        "min-w-5 rounded-full px-1.5 text-xs tabular-nums",
                                        active ? "bg-primary-foreground text-primary" : "bg-muted",
                                    )}
                                >
                                    {items.filter((item) => matchesNocFilter(item, key)).length}
                                </span>
                            </button>
                        );
                    })}
                </nav>

                {monitoring && monitoring.not_polled.length > 0 && <NotPolledNotice monitoring={monitoring} canShowOlt={canShowOlt} />}

                <section aria-label={t("noc.down_now")} className="flex flex-col gap-3">
                    {shown.map((item) => (
                        <NocDownCard
                            key={item.key}
                            item={item}
                            open={open.has(item.key)}
                            onToggle={() => toggle(item.key)}
                            canShowOlt={canShowOlt}
                            canShowTicket={canShowTicket}
                        />
                    ))}
                    {shown.length === 0 && (
                        <Card className="flex items-center gap-2 px-4 py-3.5 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden />
                            {t(filter === "all" ? "noc.all_up" : "noc.filter_empty")}
                        </Card>
                    )}
                    {(filter === "pon" || filter === "uplink") && monitoring?.olts_total && !monitoring.olts_polled ? (
                        <Card className="px-4 py-3.5 text-sm text-muted-foreground">{t("noc.no_ports_monitored")}</Card>
                    ) : null}
                </section>
            </>
        );
    };

    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-0.5">
                    <h1 className="text-2xl font-semibold">{t("noc.title")}</h1>
                    <p className="text-sm text-muted-foreground">
                        {summary && (
                            <>
                                <span className={cn("font-semibold", items.length > 0 ? "text-destructive" : "text-green-700 dark:text-green-400")}>
                                    {items.length > 0 ? t("noc.summary_down", { count: items.length, clients }) : t("noc.all_up")}
                                </span>
                                {" · "}
                                {t("noc.summary_states", { up: summary.counts.up, unknown: summary.counts.unknown })}
                                {" · "}
                            </>
                        )}
                        {generatedAt ? t("noc.updated", { time: format(generatedAt, "HH:mm:ss") }) : t("noc.refreshes")}
                    </p>
                </div>
                <MyButton type="button" variant="outline" onClick={() => refetch()} loading={isFetching}>
                    {!isFetching && <RefreshCw className="h-4 w-4" aria-hidden />}
                    {t("common.refresh")}
                </MyButton>
            </div>
            {content()}
        </div>
    );
}
