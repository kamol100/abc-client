"use client";

import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { MyDrawer } from "@/components/my-drawer";
import { Skeleton } from "@/components/ui/skeleton";
import LoadError from "@/components/monitoring/load-error";
import { formatDateTime, useMonitoringFormat } from "@/components/monitoring/monitoring-format";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { eventStatus } from "./olt-ports";
import { PortStatusBadge } from "./olt-port-status-badge";
import type { OltPortEvent } from "./olt-type";

export interface HistoryPort {
    type: "pon" | "uplink";
    id: number;
    name: string;
}

interface Props {
    oltId: string;
    /** The port whose history is open; null = closed. */
    port: HistoryPort | null;
    onClose: () => void;
}

/** Right-side drawer with a port's state changes (GET /olts/{id}/port-events), newest first. */
export default function OltPortHistory({ oltId, port, onClose }: Props) {
    const { t } = useTranslation();
    const { duration, relative } = useMonitoringFormat();
    const { data, isLoading, isFetching, error, refetch } = useApiQuery<ApiResponse<OltPortEvent[]>>({
        queryKey: ["olts", oltId, "port-events"],
        url: `olts/${oltId}/port-events`,
        params: { port_type: port?.type, port_id: port?.id },
        pagination: false,
        enabled: port !== null,
    });
    const events = Array.isArray(data?.data) ? data.data : [];

    return (
        <MyDrawer
            open={port !== null}
            onOpenChange={(open) => !open && onClose()}
            side="right"
            title="olt.ports.history.title"
            className="w-full sm:w-[460px]"
        >
            <p className="mb-3 text-sm font-semibold">{port?.name}</p>
            {isLoading ? (
                <div className="flex flex-col gap-2" aria-busy>
                    {[1, 2, 3, 4, 5].map((key) => (
                        <Skeleton key={key} className="h-16 w-full" />
                    ))}
                </div>
            ) : error ? (
                <LoadError error={error} onRetry={() => refetch()} loading={isFetching} />
            ) : events.length === 0 ? (
                <p className="rounded-md border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
                    {t("olt.ports.history.empty")}
                </p>
            ) : (
                <ol className="flex flex-col divide-y rounded-md border">
                    {events.map((event, index) => (
                        <li key={`${event.occurred_at}-${index}`} className="flex flex-col gap-1.5 px-3 py-2.5">
                            <div className="flex flex-wrap items-center gap-1.5">
                                <PortStatusBadge status={eventStatus(event.from_state)} />
                                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" aria-label={t("olt.ports.history.to")} />
                                <PortStatusBadge status={eventStatus(event.to_state)} />
                            </div>
                            <div className="flex flex-wrap justify-between gap-x-3 text-xs text-muted-foreground">
                                <span title={formatDateTime(event.occurred_at, true)}>{relative(event.occurred_at)}</span>
                                <span>
                                    {event.duration_seconds != null
                                        ? t("olt.ports.history.lasted", { duration: duration(event.duration_seconds) })
                                        : index === 0
                                            ? t("olt.ports.history.ongoing")
                                            : null}
                                </span>
                            </div>
                        </li>
                    ))}
                </ol>
            )}
        </MyDrawer>
    );
}
