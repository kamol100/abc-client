"use client";

import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import DashboardFilterSelect from "@/components/dashboard/dashboard-filter-select";
import MonitorStateBadge from "@/components/monitoring/monitor-state-badge";
import { formatDateTime, formatMs, formatPct } from "@/components/monitoring/monitoring-format";
import type { DeviceCheck, MonitoringPeriod } from "@/components/monitoring/monitoring-type";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { cn } from "@/lib/utils";

const ALL = "all";

interface Props {
    deviceId: string;
    period: MonitoringPeriod;
}

/** Check log of the monitoring page (GET /devices/{id}/checks) with Source / Result filters. */
export default function OltChecksTable({ deviceId, period }: Props) {
    const { t } = useTranslation();
    const [source, setSource] = useState(ALL);
    const [result, setResult] = useState(ALL);

    const params = useMemo(
        () => ({
            period,
            ...(source !== ALL && { source }),
            ...(result !== ALL && { result }),
        }),
        [period, source, result]
    );
    const { data, isLoading, isFetching, setCurrentPage } = useApiQuery<PaginatedApiResponse<DeviceCheck>>({
        queryKey: ["device-checks", deviceId],
        url: `devices/${deviceId}/checks`,
        params,
    });
    const pagination = data?.data?.pagination;

    const columns: ColumnDef<DeviceCheck>[] = [
        {
            id: "checked_at",
            header: ({ column }) => <DataTableColumnHeader column={column} title="monitoring.checks.checked_at" />,
            cell: ({ row }) => <span className="tabular-nums">{formatDateTime(row.original.checked_at, true)}</span>,
        },
        {
            id: "source",
            header: ({ column }) => <DataTableColumnHeader column={column} title="monitoring.checks.source" />,
            cell: ({ row }) =>
                row.original.source === "manual"
                    ? [t("monitoring.checks.manual"), row.original.user].filter(Boolean).join(" · ")
                    : t("monitoring.checks.auto"),
        },
        {
            id: "result",
            header: ({ column }) => <DataTableColumnHeader column={column} title="monitoring.checks.result" />,
            cell: ({ row }) => <MonitorStateBadge state={row.original.result} />,
        },
        {
            id: "latency",
            header: ({ column }) => <DataTableColumnHeader column={column} title="monitoring.checks.latency" />,
            cell: ({ row }) => <span className="tabular-nums">{formatMs(row.original.rtt_avg_ms)}</span>,
        },
        {
            id: "sent_received",
            header: ({ column }) => <DataTableColumnHeader column={column} title="monitoring.checks.sent_received" />,
            cell: ({ row }) => (
                <span className="tabular-nums">
                    {row.original.sent} / {row.original.received}
                </span>
            ),
        },
        {
            id: "loss",
            header: ({ column }) => <DataTableColumnHeader column={column} title="monitoring.checks.loss" />,
            cell: ({ row }) => (
                <span className={cn("tabular-nums", (row.original.loss_pct ?? 0) > 0 && "text-destructive")}>
                    {formatPct(row.original.loss_pct, true)}
                </span>
            ),
        },
    ];

    const filters = [
        {
            label: t("monitoring.checks.source"),
            value: source,
            onChange: setSource,
            options: [
                { value: ALL, labelKey: "monitoring.checks.all" },
                { value: "auto", labelKey: "monitoring.checks.auto" },
                { value: "manual", labelKey: "monitoring.checks.manual" },
            ],
        },
        {
            label: t("monitoring.checks.result"),
            value: result,
            onChange: setResult,
            options: [
                { value: ALL, labelKey: "monitoring.checks.all" },
                { value: "up", labelKey: "monitoring.state.up" },
                { value: "down", labelKey: "monitoring.state.down" },
                { value: "unknown", labelKey: "monitoring.state.unknown" },
            ],
        },
    ];

    return (
        <section className="flex flex-col gap-2.5">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <h2 className="flex-1 text-base font-semibold">
                    {pagination
                        ? t("monitoring.checks.title_count", { total: pagination.total.toLocaleString("en-US") })
                        : t("monitoring.checks.title")}
                </h2>
                {filters.map((filter) => (
                    <div key={filter.label} className="flex items-center gap-2 text-sm">
                        <span>{filter.label}</span>
                        <DashboardFilterSelect
                            value={filter.value}
                            onValueChange={filter.onChange}
                            options={filter.options}
                            placeholderKey="monitoring.checks.all"
                            ariaLabel={filter.label}
                            className="h-8 w-32"
                        />
                    </div>
                ))}
            </div>
            <DataTable
                data={data?.data?.data ?? []}
                columns={columns}
                toolbar={false}
                pagination={pagination}
                setCurrentPage={setCurrentPage}
                isLoading={isLoading}
                isFetching={isFetching}
                queryKey="device-checks"
            />
        </section>
    );
}
