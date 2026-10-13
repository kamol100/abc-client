"use client";

import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import DashboardFilterSelect from "@/components/dashboard/dashboard-filter-select";
import DisplayCount from "@/components/display-count";
import MyButton from "@/components/my-button";
import ClientNamePhoneCell from "@/components/clients/client-name-phone-cell";
import { getClientTerminationDateDisplay } from "@/components/clients/client-termination-date";
import MonitorStateBadge from "@/components/monitoring/monitor-state-badge";
import { formatDateTime, formatDbm } from "@/components/monitoring/monitoring-format";
import { isStale, type OnuDataFreshness } from "@/components/onu/onu-freshness";
import { rxClass } from "@/components/onu/onu-power";
import { UnknownStatusBadge } from "@/components/onu/onu-status-badge";
import { usePermissions } from "@/context/app-provider";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { cn } from "@/lib/utils";
import { isInactiveClient, OltClientRow, OltDetail } from "./olt-type";

const ALL_PORTS = "all";

interface Props {
    oltId: string;
    summary: OltDetail["clients"];
    ponPorts: OltDetail["pon_ports"];
    thresholdDbm: number;
    /** GET /olts/{id} `onu_data`; the clients response's own meta wins when present. */
    onuData?: OnuDataFreshness | null;
}

/** "Clients:" section of the OLT page: counters, PON port filter and the paginated client list. */
export default function OltClientsTable({ oltId, summary, ponPorts, thresholdDbm, onuData }: Props) {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();
    const [ponPort, setPonPort] = useState(ALL_PORTS);
    const canShowClient = hasPermission("clients.show");

    const params = useMemo(() => (ponPort === ALL_PORTS ? undefined : { pon_port: ponPort }), [ponPort]);
    const { data, isLoading, isFetching, setCurrentPage } = useApiQuery<PaginatedApiResponse<OltClientRow>>({
        queryKey: ["olt-clients", oltId],
        url: `olts/${oltId}/clients`,
        params,
    });

    // ONU statuses from an old poll (OLT down, stale, never polled): clients show "Unknown", readings muted.
    const payload = data?.data as { meta?: { onu_data?: OnuDataFreshness | null }; onu_data?: OnuDataFreshness | null } | undefined;
    const freshness = payload?.meta?.onu_data ?? payload?.onu_data ?? onuData ?? null;
    const statusUnknown = (online: boolean | null | undefined) => online === null || online === undefined || isStale(freshness);

    const columns: ColumnDef<OltClientRow>[] = [
        {
            id: "sid",
            header: ({ column }) => <DataTableColumnHeader column={column} title="client.table.sid" />,
            cell: ({ row }) => <span className="text-sm font-semibold">{row.original.sid ?? "—"}</span>,
        },
        {
            id: "id_name_phone",
            header: ({ column }) => <DataTableColumnHeader column={column} title="client.table.id_name_phone" />,
            cell: ({ row }) => (
                <ClientNamePhoneCell
                    client={{
                        name: row.original.name,
                        pppoe_username: row.original.pppoe_username,
                        phone: row.original.phone,
                        status: isInactiveClient(row.original.status) ? 0 : 1,
                    }}
                />
            ),
        },
        {
            id: "onu",
            header: ({ column }) => <DataTableColumnHeader column={column} title="olt.clients.onu_rx" />,
            cell: ({ row }) => {
                const onu = row.original.onu;
                if (!onu) return <span className="text-sm text-muted-foreground">{t("olt.clients.no_onu")}</span>;
                const muted = statusUnknown(row.original.online);
                return (
                    <div className={cn("flex flex-col gap-0.5 text-sm", muted && "opacity-60")}>
                        <span className="font-semibold">{onu.name}</span>
                        <span className={cn("tabular-nums", muted ? "text-muted-foreground" : rxClass(onu.rx_power_dbm, thresholdDbm))}>
                            {formatDbm(onu.rx_power_dbm)}
                        </span>
                    </div>
                );
            },
        },
        {
            id: "connection_package",
            header: ({ column }) => <DataTableColumnHeader column={column} title="client.table.connection_package" />,
            cell: ({ row }) => {
                const termination = getClientTerminationDateDisplay(row.original.termination_date);
                const text = !termination
                    ? "—"
                    : termination.kind === "unparsed"
                        ? termination.text
                        : `${termination.date} ${t(
                              termination.kind === "expired" ? "client.table.termination_expired_days" : "client.table.termination_days",
                              { count: termination.days }
                          )}`;
                return (
                    <div className="flex flex-col gap-0.5 text-sm">
                        <span className={cn("whitespace-nowrap font-semibold", termination?.kind === "expired" && "text-destructive")}>
                            {text}
                        </span>
                        <span>{row.original.package?.name ?? "—"}</span>
                    </div>
                );
            },
        },
        {
            id: "bill_payment",
            header: ({ column }) => <DataTableColumnHeader column={column} title="client.table.bill_payment" />,
            cell: ({ row }) => {
                const due = row.original.due_amount ?? 0;
                return (
                    <div className="flex flex-col gap-0.5 text-sm">
                        <span className={cn("font-semibold", due > 0 && "text-destructive")}>
                            {t("client.table.total_due")}: <DisplayCount amount={due} formatCurrency />
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {t("client.table.deadline")}: {row.original.payment_deadline || "—"}
                        </span>
                    </div>
                );
            },
        },
        {
            id: "online_info",
            header: ({ column }) => <DataTableColumnHeader column={column} title="client.table.online_info" />,
            cell: ({ row }) => {
                const { online, onu } = row.original;
                if (onu && statusUnknown(online)) {
                    return <UnknownStatusBadge reason={freshness?.reason} asOf={freshness?.as_of ?? null} />;
                }
                const since = online ? onu?.last_online_at : onu?.last_offline_at;
                return (
                    <div className="flex flex-col items-start gap-1">
                        <MonitorStateBadge
                            state={online ? "up" : "down"}
                            label={t(online ? "olt.clients.online" : "olt.clients.offline")}
                        />
                        {since && (
                            <span className="text-xs text-muted-foreground">
                                {t("olt.clients.since", { time: formatDateTime(since) })}
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            id: "actions",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} className="flex justify-end capitalize mr-3" title="common.actions" />
            ),
            cell: ({ row }) => (
                <div className="mr-3 flex justify-end">
                    {canShowClient ? (
                        <MyButton
                            variant="outline"
                            size="icon"
                            url={`/clients/view/${row.original.id}`}
                            aria-label={t("olt.clients.view_client")}
                            tooltip={t("olt.clients.view_client")}
                        >
                            <Eye className="h-4 w-4" />
                        </MyButton>
                    ) : (
                        <span className="text-muted-foreground">—</span>
                    )}
                </div>
            ),
        },
    ];

    const counters = [
        { key: "total", value: summary.total, className: "" },
        { key: "online", value: summary.online ?? "—", className: summary.online == null ? "text-muted-foreground" : "text-green-700 dark:text-green-400" },
        { key: "offline", value: summary.offline ?? "—", className: summary.offline == null ? "text-muted-foreground" : "text-destructive" },
        ...(summary.unknown ? [{ key: "unknown", value: summary.unknown, className: "text-muted-foreground" }] : []),
        { key: "disabled", value: summary.disabled, className: "text-muted-foreground" },
    ];

    return (
        <section className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <h2 className="text-base font-semibold">{t("olt.clients.title")}:</h2>
                {counters.map((counter) => (
                    <span key={counter.key} className="text-sm">
                        <span className="text-muted-foreground">{t(`olt.clients.${counter.key}`)}</span>{" "}
                        <strong className={cn("tabular-nums", counter.className)}>{counter.value}</strong>
                    </span>
                ))}
                <div className="flex items-center gap-2 text-sm sm:ml-auto">
                    <span>{t("olt.clients.pon_port")}</span>
                    <DashboardFilterSelect
                        value={ponPort}
                        onValueChange={setPonPort}
                        placeholderKey="olt.clients.all_ports"
                        ariaLabel={t("olt.clients.pon_port")}
                        className="h-8 w-36"
                        options={[
                            { value: ALL_PORTS, labelKey: "olt.clients.all_ports" },
                            ...ponPorts.map((port) => ({ value: String(port.id), label: port.name })),
                        ]}
                    />
                </div>
            </div>
            <DataTable
                data={data?.data?.data ?? []}
                columns={columns}
                toolbar={false}
                pagination={data?.data?.pagination}
                setCurrentPage={setCurrentPage}
                isLoading={isLoading}
                isFetching={isFetching}
                queryKey="olt-clients"
            />
        </section>
    );
}
