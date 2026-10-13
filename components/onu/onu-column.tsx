"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { formatDateTime, formatDbm, useMonitoringFormat } from "@/components/monitoring/monitoring-format";
import { usePermissions } from "@/context/app-provider";
import { cn } from "@/lib/utils";
import OnuActionsCell from "./onu-actions-cell";
import { formatDistance, rxClass } from "./onu-power";
import OnuStatusBadge from "./onu-status-badge";
import { onuIdentity, onuLabel, type OnuRow } from "./onu-type";

interface Options {
    /** false on the OLT page, where every row is that OLT. */
    showOlt?: boolean;
    /** Low-power threshold in dBm (company setting). */
    thresholdDbm: number;
    /** Reboot paused for this OLT (Device IP changed, retest required). */
    rebootBlocked?: boolean;
}

// Column ids double as `common.<id>` keys for the column toggle.
export function useOnuColumns({ showOlt = true, thresholdDbm, rebootBlocked = false }: Options): ColumnDef<OnuRow>[] {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();
    const { relative, duration, secondsSince } = useMonitoringFormat();
    const canShowOlt = hasPermission("olts.show");
    const canShowClient = hasPermission("clients.show");

    // Memoized: flexRender treats each `cell` function as a component type, so new functions on every
    // render would remount the cells and close a row's bind / reboot dialog when the list refetches.
    return useMemo<ColumnDef<OnuRow>[]>(() => {
        const columns: ColumnDef<OnuRow>[] = [
            {
                id: "onu_name",
                accessorFn: (row) => onuLabel(row),
                header: ({ column }) => <DataTableColumnHeader column={column} title="onu.columns.onu" />,
                cell: ({ row }) => {
                    const identity = onuIdentity(row.original);
                    return (
                        <div className="flex flex-col">
                            <span className="font-semibold tabular-nums">{onuLabel(row.original)}</span>
                            {identity && <span className="font-mono text-xs text-muted-foreground">{identity}</span>}
                            {row.original.description && (
                                <span className="text-xs text-muted-foreground">{row.original.description}</span>
                            )}
                        </div>
                    );
                },
                enableSorting: false,
                enableHiding: false,
            },
            {
                id: "onu_olt",
                accessorFn: (row) => row.olt?.name ?? "",
                header: ({ column }) => <DataTableColumnHeader column={column} title="onu.columns.olt" />,
                cell: ({ row }) => {
                    const olt = row.original.olt;
                    if (!olt) return <span className="text-muted-foreground">—</span>;
                    return canShowOlt ? (
                        <Link href={`/olts/view/${olt.id}`} className="font-medium hover:underline">
                            {olt.name}
                        </Link>
                    ) : (
                        <span>{olt.name}</span>
                    );
                },
                enableSorting: false,
            },
            {
                id: "onu_status",
                accessorFn: (row) => row.status,
                header: ({ column }) => <DataTableColumnHeader column={column} title="onu.columns.status" />,
                cell: ({ row }) => (
                    <OnuStatusBadge
                        status={row.original.status}
                        cause={row.original.last_down_cause}
                        statusKnown={row.original.status_known}
                        unknownReason={row.original.status_unknown_reason}
                        asOf={row.original.status_as_of ?? row.original.polled_at}
                    />
                ),
                enableSorting: false,
            },
            {
                id: "onu_rx",
                accessorFn: (row) => row.rx_power_dbm,
                header: ({ column }) => <DataTableColumnHeader column={column} title="onu.columns.rx" />,
                cell: ({ row }) => {
                    const { rx_power_dbm: rx, olt_rx_power_dbm: oltRx, rx_low_since: lowSince } = row.original;
                    // Readings from an old poll stay visible, muted.
                    const muted = row.original.status_known === false;
                    return (
                        <div className={cn("flex flex-col text-sm", muted && "opacity-60")}>
                            <span className={cn("tabular-nums", muted ? "text-muted-foreground" : rxClass(rx, thresholdDbm))}>
                                {formatDbm(rx)}
                            </span>
                            {oltRx != null && (
                                <span className="text-xs tabular-nums text-muted-foreground">
                                    {t("onu.columns.olt_rx")}: {formatDbm(oltRx)}
                                </span>
                            )}
                            {lowSince && (
                                <span className="text-xs text-muted-foreground" title={formatDateTime(lowSince)}>
                                    {t("onu.low_for", { duration: duration(secondsSince(lowSince)) })}
                                </span>
                            )}
                        </div>
                    );
                },
                enableSorting: false,
            },
            {
                id: "onu_distance",
                accessorFn: (row) => row.distance_m,
                header: ({ column }) => <DataTableColumnHeader column={column} title="onu.columns.distance" />,
                cell: ({ row }) => <span className="text-sm tabular-nums">{formatDistance(row.original.distance_m)}</span>,
                enableSorting: false,
            },
            {
                id: "onu_client",
                accessorFn: (row) => row.client?.name ?? "",
                header: ({ column }) => <DataTableColumnHeader column={column} title="onu.columns.client" />,
                cell: ({ row }) => {
                    const { client, client_bound: bound, client_binding: binding } = row.original;
                    if (!client) {
                        return (
                            <span className="text-sm text-muted-foreground">
                                {t(bound ? "onu.bound_hidden" : "onu.unbound")}
                            </span>
                        );
                    }
                    return (
                        <div className="flex flex-col text-sm">
                            {canShowClient ? (
                                <Link href={`/clients/view/${client.id}`} className="font-medium hover:underline">
                                    {client.name}
                                </Link>
                            ) : (
                                <span className="font-medium">{client.name}</span>
                            )}
                            <span className="text-xs text-muted-foreground">
                                {[client.pppoe_username, binding ? t(`onu.binding.${binding}`) : null].filter(Boolean).join(" · ")}
                            </span>
                        </div>
                    );
                },
                enableSorting: false,
            },
            {
                id: "onu_last_seen",
                accessorFn: (row) => row.polled_at,
                header: ({ column }) => <DataTableColumnHeader column={column} title="onu.columns.last_seen" />,
                cell: ({ row }) => {
                    const { status, last_offline_at: offlineAt, polled_at: polledAt } = row.original;
                    return (
                        <div className="flex flex-col text-sm">
                            <span title={polledAt ? formatDateTime(polledAt) : undefined}>{relative(polledAt)}</span>
                            {status !== "online" && offlineAt && (
                                <span className="text-xs text-muted-foreground" title={formatDateTime(offlineAt)}>
                                    {t("onu.went_down", { time: relative(offlineAt) })}
                                </span>
                            )}
                        </div>
                    );
                },
                enableSorting: false,
            },
            {
                id: "actions",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} className="flex justify-end capitalize mr-3" title="common.actions" />
                ),
                cell: ({ row }) => (
                    <div className="mr-3 flex items-center justify-end">
                        <OnuActionsCell row={row} rebootBlocked={rebootBlocked} />
                    </div>
                ),
                enableSorting: false,
                enableHiding: false,
            },
        ];

        return showOlt ? columns : columns.filter((column) => column.id !== "onu_olt");
    }, [t, relative, duration, secondsSince, canShowOlt, canShowClient, showOlt, thresholdDbm, rebootBlocked]);
}
