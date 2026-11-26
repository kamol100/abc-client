"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown, History } from "lucide-react";
import { useTranslation } from "react-i18next";
import Card from "@/components/card";
import MyButton from "@/components/my-button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { formatDateTime, formatDbm, useMonitoringFormat } from "@/components/monitoring/monitoring-format";
import { cn } from "@/lib/utils";
import OltPortHistory, { HistoryPort } from "./olt-port-history";
import { PortStatusBadge } from "./olt-port-status-badge";
import {
    PortSort,
    PortSortKey,
    formatBps,
    formatSpeed,
    formatTemp,
    isProblemPort,
    nextSort,
    pctOfSpeed,
    portStatus,
    portSummaryParts,
    sortPorts,
} from "./olt-ports";
import type { OltPonPort, OltUplinkPort } from "./olt-type";

type Tab = "pon" | "uplink";

interface Props {
    oltId: string;
    ponPorts: OltPonPort[];
    uplinkPorts: OltUplinkPort[];
    /** "As of {time} — OLT down": the port numbers are from the last successful poll. */
    staleNote: string | null;
    canListOnus: boolean;
}

function SortHead({
    label,
    sortKey,
    sort,
    onSort,
    className,
}: {
    label: string;
    sortKey: PortSortKey;
    sort: PortSort | null;
    onSort: (key: PortSortKey) => void;
    className?: string;
}) {
    const active = sort?.key === sortKey;
    const Icon = !active ? ArrowUpDown : sort.desc ? ArrowDown : ArrowUp;
    return (
        <TableHead aria-sort={active ? (sort.desc ? "descending" : "ascending") : "none"} className={className}>
            <button
                type="button"
                onClick={() => onSort(sortKey)}
                className="inline-flex items-center gap-1 whitespace-nowrap rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
                {label}
                <Icon className={cn("h-3.5 w-3.5", !active && "opacity-50")} aria-hidden />
            </button>
        </TableHead>
    );
}

/** Full-width Ports card on the OLT page: PON and uplink tables, problem filter, per-port history. */
export default function OltPortsSection({ oltId, ponPorts, uplinkPorts, staleNote, canListOnus }: Props) {
    const { t } = useTranslation();
    const { relative } = useMonitoringFormat();
    const [tab, setTab] = useState<Tab>("pon");
    const [problemsOnly, setProblemsOnly] = useState(false);
    const [sort, setSort] = useState<PortSort | null>(null);
    const [history, setHistory] = useState<HistoryPort | null>(null);

    const ports: (OltPonPort | OltUplinkPort)[] = tab === "pon" ? ponPorts : uplinkPorts;
    const summary = portSummaryParts(ports)
        .map((part) => t(`olt.ports.summary.${part.status}`, { count: part.count }))
        .join(" · ");
    const onSort = (key: PortSortKey) => setSort((current) => nextSort(current, key));
    const head = (key: PortSortKey, label: string, className?: string) => (
        <SortHead label={t(label)} sortKey={key} sort={sort} onSort={onSort} className={className} />
    );

    const portName = (port: OltPonPort | OltUplinkPort) =>
        tab === "pon" && canListOnus ? (
            <Link
                href={`/onus?olt=${oltId}&pon_port=${port.id}`}
                className="font-semibold hover:underline"
                title={t("olt.pon_ports.view_onus", { port: port.name })}
            >
                {port.name}
            </Link>
        ) : (
            <span className="font-semibold">{port.name}</span>
        );

    const changed = (port: OltPonPort | OltUplinkPort) => {
        if (isProblemPort(port) && port.down_since) {
            return (
                <span
                    className={cn("font-medium", portStatus(port) === "link_down" ? "text-destructive" : "text-muted-foreground")}
                    title={formatDateTime(port.down_since)}
                >
                    {relative(port.down_since)}
                </span>
            );
        }
        if (!port.last_change_at) return <span className="text-muted-foreground">—</span>;
        return (
            <span className="text-muted-foreground" title={formatDateTime(port.last_change_at)}>
                {t("olt.ports.changed", { time: relative(port.last_change_at) })}
            </span>
        );
    };

    const traffic = (port: OltPonPort | OltUplinkPort, withPct: boolean): ReactNode => {
        if (port.in_bps == null && port.out_bps == null) return <span className="text-muted-foreground">—</span>;
        const inPct = withPct ? pctOfSpeed(port.in_bps, port.speed_mbps) : null;
        const outPct = withPct ? pctOfSpeed(port.out_bps, port.speed_mbps) : null;
        return (
            <div className="flex flex-col whitespace-nowrap">
                <span>{`${formatBps(port.in_bps)} / ${formatBps(port.out_bps)}`}</span>
                {(inPct != null || outPct != null) && (
                    <span className="text-xs text-muted-foreground">
                        {t("olt.ports.pct_of_speed", { in: inPct ?? "—", out: outPct ?? "—" })}
                    </span>
                )}
            </div>
        );
    };

    const historyButton = (port: OltPonPort | OltUplinkPort) => (
        <MyButton
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label={t("olt.ports.history_aria", { port: port.name })}
            title={t("olt.ports.columns.history")}
            onClick={() => setHistory({ type: tab, id: port.id, name: port.name })}
        >
            <History className="h-4 w-4" />
        </MyButton>
    );

    const rows = sortPorts(problemsOnly ? ports.filter(isProblemPort) : ports, sort);
    const columnCount = tab === "pon" ? 9 : 6;

    const body = () => {
        if (ports.length === 0) {
            return t(tab === "pon" ? "olt.pon_ports.empty" : "olt.ports.empty_uplink");
        }
        if (rows.length === 0) return t("olt.ports.no_problems");
        return null;
    };
    const emptyText = body();

    return (
        <Card className="min-w-0 shrink-0 overflow-hidden">
            <div className="flex flex-col gap-2 border-b bg-muted/60 px-3.5 py-2.5">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <h2 className="text-sm font-semibold">{t("olt.ports.title")}</h2>
                    <ToggleGroup
                        type="single"
                        value={tab}
                        onValueChange={(value) => {
                            if (!value) return;
                            setTab(value as Tab);
                            setSort(null);
                        }}
                        aria-label={t("olt.ports.title")}
                        className="gap-0 rounded-[var(--radius)] border border-input bg-background p-0.5"
                    >
                        {(["pon", "uplink"] as const).map((value) => (
                            <ToggleGroupItem
                                key={value}
                                value={value}
                                size="sm"
                                className={cn(
                                    "h-7 rounded-[var(--radius)] px-2.5 text-xs font-medium",
                                    tab === value &&
                                        "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                                )}
                            >
                                {t(`olt.ports.tabs.${value}`, { count: value === "pon" ? ponPorts.length : uplinkPorts.length })}
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                    <div className="flex items-center gap-2 sm:ml-auto">
                        <Switch id="olt-ports-problems" checked={problemsOnly} onCheckedChange={setProblemsOnly} />
                        <Label htmlFor="olt-ports-problems" className="cursor-pointer text-xs font-medium">
                            {t("olt.ports.problems_only")}
                        </Label>
                    </div>
                </div>
                {/* Fixed one-line slot: switching tabs never moves the table. */}
                <p className="min-h-4 text-xs leading-4 text-muted-foreground">{summary}</p>
                {staleNote && <p className="text-xs font-normal text-amber-700 dark:text-amber-400">{staleNote}</p>}
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        {head("name", "olt.ports.columns.port")}
                        {head("status", "olt.ports.columns.status")}
                        {head("down_since", "olt.ports.columns.down_since")}
                        {tab === "pon" ? (
                            <>
                                {head("onus", "olt.ports.columns.onus")}
                                {head("clients", "olt.ports.columns.clients")}
                            </>
                        ) : (
                            <TableHead className="whitespace-nowrap">{t("olt.ports.columns.speed")}</TableHead>
                        )}
                        {head("traffic", "olt.ports.columns.traffic")}
                        {tab === "pon" && (
                            <>
                                <TableHead className="whitespace-nowrap">{t("olt.ports.columns.tx_power")}</TableHead>
                                <TableHead className="whitespace-nowrap">{t("olt.ports.columns.temperature")}</TableHead>
                            </>
                        )}
                        <TableHead className="w-12">
                            <span className="sr-only">{t("olt.ports.columns.history")}</span>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {emptyText ? (
                        <TableRow>
                            <TableCell colSpan={columnCount} className="py-8 text-center text-sm text-muted-foreground">
                                {emptyText}
                            </TableCell>
                        </TableRow>
                    ) : (
                        rows.map((port) => {
                            const status = portStatus(port);
                            const pon = tab === "pon" ? (port as OltPonPort) : null;
                            const pct = pon?.onu_total ? Math.round((pon.onu_online / pon.onu_total) * 100) : 0;
                            const online = pon
                                ? pon.onu_total
                                    ? t("olt.pon_ports.online", { online: pon.onu_online, total: pon.onu_total })
                                    : t("olt.pon_ports.no_onus")
                                : "";
                            return (
                                <TableRow key={port.id}>
                                    <TableCell className="whitespace-nowrap">{portName(port)}</TableCell>
                                    <TableCell>
                                        <PortStatusBadge status={status} />
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap">{changed(port)}</TableCell>
                                    {pon ? (
                                        <>
                                            <TableCell className="min-w-36">
                                                <div className="flex flex-col gap-1">
                                                    <span className="whitespace-nowrap tabular-nums">{online}</span>
                                                    <div
                                                        role="progressbar"
                                                        aria-label={`${port.name}: ${online}`}
                                                        aria-valuemin={0}
                                                        aria-valuemax={100}
                                                        aria-valuenow={pct}
                                                        className="h-1.5 overflow-hidden rounded-full bg-muted"
                                                    >
                                                        <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell
                                                className={cn(
                                                    "tabular-nums",
                                                    (pon.affected_clients ?? 0) > 0 && status !== "up"
                                                        ? "font-medium text-destructive"
                                                        : "text-muted-foreground"
                                                )}
                                            >
                                                {pon.affected_clients ?? "—"}
                                            </TableCell>
                                        </>
                                    ) : (
                                        <TableCell className="whitespace-nowrap tabular-nums">{formatSpeed(port.speed_mbps)}</TableCell>
                                    )}
                                    <TableCell className="tabular-nums">{traffic(port, !pon)}</TableCell>
                                    {pon && (
                                        <>
                                            <TableCell className="whitespace-nowrap tabular-nums">{formatDbm(pon.tx_power_dbm)}</TableCell>
                                            <TableCell className="whitespace-nowrap tabular-nums">{formatTemp(pon.temperature_c)}</TableCell>
                                        </>
                                    )}
                                    <TableCell className="py-1">{historyButton(port)}</TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>

            <OltPortHistory oltId={oltId} port={history} onClose={() => setHistory(null)} />
        </Card>
    );
}
