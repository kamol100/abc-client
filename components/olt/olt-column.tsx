"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import MyButton from "@/components/my-button";
import { usePermissions } from "@/context/app-provider";
import MonitorStateBadge from "@/components/monitoring/monitor-state-badge";
import PingDialog from "@/components/monitoring/ping-dialog";
import { formatDateTime, formatMs, formatPct, useMonitoringFormat } from "@/components/monitoring/monitoring-format";
import { OltRow } from "./olt-type";

// Column ids double as `common.<id>` keys for the column toggle.
export function useOltColumns(): ColumnDef<OltRow>[] {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();
    const { relative } = useMonitoringFormat();
    const canShow = hasPermission("olts.show");

    // Memoized: flexRender treats each `cell` function as a component type, so new functions on every
    // render remount the cells, which closed the row's Ping dialog when the list refetched after a ping.
    return useMemo<ColumnDef<OltRow>[]>(() => [
        {
            id: "name",
            header: ({ column }) => <DataTableColumnHeader column={column} title="olt.table.name" />,
            cell: ({ row }) =>
                canShow ? (
                    <Link href={`/olts/view/${row.original.id}`} className="font-semibold hover:underline">
                        {row.original.name}
                    </Link>
                ) : (
                    <span className="font-semibold">{row.original.name}</span>
                ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            id: "olt_state",
            header: ({ column }) => <DataTableColumnHeader column={column} title="olt.table.status" />,
            cell: ({ row }) => (
                <div className="flex flex-col items-start gap-0.5">
                    <MonitorStateBadge state={row.original.monitor_state} />
                    {row.original.monitor_state === "up" && (
                        <span className="text-xs tabular-nums text-muted-foreground">{formatMs(row.original.last_rtt_ms)}</span>
                    )}
                </div>
            ),
            enableSorting: false,
        },
        {
            id: "olt_ip",
            header: ({ column }) => <DataTableColumnHeader column={column} title="olt.table.ip" />,
            cell: ({ row }) => <span className="font-mono text-sm">{row.original.device_ip || "—"}</span>,
            enableSorting: false,
        },
        {
            id: "olt_vendor",
            header: ({ column }) => <DataTableColumnHeader column={column} title="olt.table.vendor_model" />,
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span>{row.original.vendor ? t(`olt.vendor.${row.original.vendor}`, { defaultValue: row.original.vendor }) : "—"}</span>
                    <span className="text-xs text-muted-foreground">{row.original.model || "—"}</span>
                </div>
            ),
            enableSorting: false,
        },
        {
            id: "olt_network",
            header: ({ column }) => <DataTableColumnHeader column={column} title="olt.table.network" />,
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span>{row.original.network?.name ?? "—"}</span>
                    {row.original.zone?.name && <span className="text-xs text-muted-foreground">{row.original.zone.name}</span>}
                </div>
            ),
            enableSorting: false,
        },
        {
            id: "olt_onus",
            header: ({ column }) => <DataTableColumnHeader column={column} title="olt.table.onus" />,
            cell: ({ row }) => (
                <span className="tabular-nums">
                    {row.original.onus_online}/{row.original.onus_total}
                </span>
            ),
            enableSorting: false,
        },
        {
            id: "olt_clients",
            header: ({ column }) => <DataTableColumnHeader column={column} title="olt.table.clients" />,
            cell: ({ row }) => <span className="tabular-nums">{row.original.clients_total}</span>,
            enableSorting: false,
        },
        {
            id: "olt_uptime",
            header: ({ column }) => <DataTableColumnHeader column={column} title="olt.table.uptime_24h" />,
            cell: ({ row }) => <span className="tabular-nums">{formatPct(row.original.uptime_24h)}</span>,
            enableSorting: false,
        },
        {
            id: "olt_checked",
            header: ({ column }) => <DataTableColumnHeader column={column} title="olt.table.last_checked" />,
            cell: ({ row }) => (
                <span
                    className={row.original.last_checked_at ? undefined : "text-muted-foreground"}
                    title={row.original.last_checked_at ? formatDateTime(row.original.last_checked_at) : undefined}
                >
                    {relative(row.original.last_checked_at)}
                </span>
            ),
            enableSorting: false,
        },
        {
            id: "actions",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} className="flex justify-end capitalize mr-3" title="common.actions" />
            ),
            cell: ({ row }) => (
                <div className="mr-3 flex items-center justify-end gap-2">
                    {canShow && (
                        <MyButton
                            variant="outline"
                            size="icon"
                            url={`/olts/view/${row.original.id}`}
                            aria-label={t("olt.actions.view")}
                            tooltip={t("olt.actions.view")}
                        >
                            <Eye className="h-4 w-4" />
                        </MyButton>
                    )}
                    <PingDialog deviceId={row.original.id} deviceName={row.original.name} />
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
        },
    ], [t, canShow, relative]);
}
