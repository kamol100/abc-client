"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { formatDateTime, formatDbm, useMonitoringFormat } from "@/components/monitoring/monitoring-format";
import { OnuActionsMenu } from "@/components/onu/onu-actions-cell";
import { formatDistance, rxClass, rxLowThreshold } from "@/components/onu/onu-power";
import OnuStatusBadge from "@/components/onu/onu-status-badge";
import { onuIdentity, onuLabel, type OnuSummary } from "@/components/onu/onu-type";
import { usePermissions, useSetting } from "@/context/app-provider";
import { cn } from "@/lib/utils";

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-sm">{children}</span>
        </div>
    );
}

interface Props {
    onus: OnuSummary[];
    /** The client of the page: every ONU here is bound to it. */
    client: { id: string; name: string };
}

/** The client's bound ONU(s) on the client page (GET /clients/{id} → `onus`). */
export default function ClientOnuSection({ onus, client }: Props) {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();
    const { relative } = useMonitoringFormat();
    const threshold = rxLowThreshold(useSetting("onu_rx_power_low_dbm"));
    const canShowOlt = hasPermission("olts.show");

    return (
        <div className="border-t pt-4">
            <div className="text-md mb-2 font-semibold">{t("onu.client_card.title")}:</div>
            {onus.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("onu.client_card.none")}</p>
            ) : (
                <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {onus.map((onu) => {
                        const identity = onuIdentity(onu);
                        const changedAt = onu.status === "online" ? onu.polled_at : onu.last_offline_at;
                        return (
                            <li key={onu.id} className="flex flex-col gap-3 rounded-lg border p-3">
                                <div className="flex items-start gap-2">
                                    <div className="flex min-w-0 flex-col">
                                        <span className="font-semibold tabular-nums">{onuLabel(onu)}</span>
                                        {identity && <span className="font-mono text-xs text-muted-foreground">{identity}</span>}
                                    </div>
                                    <OnuStatusBadge
                                        status={onu.status}
                                        cause={onu.last_down_cause}
                                        statusKnown={onu.status_known}
                                        unknownReason={onu.status_unknown_reason}
                                        asOf={onu.status_as_of ?? onu.polled_at}
                                        className="ml-auto"
                                    />
                                    <OnuActionsMenu onu={{ ...onu, client, client_bound: true }} />
                                </div>
                                {/* Readings from an old poll (status unknown) stay visible, muted. */}
                                <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-4", onu.status_known === false && "opacity-60")}>
                                    <Fact label={t("onu.columns.rx")}>
                                        <span
                                            className={cn(
                                                "tabular-nums",
                                                onu.status_known === false ? "text-muted-foreground" : rxClass(onu.rx_power_dbm, threshold)
                                            )}
                                        >
                                            {formatDbm(onu.rx_power_dbm)}
                                        </span>
                                    </Fact>
                                    {onu.olt_rx_power_dbm != null && (
                                        <Fact label={t("onu.columns.olt_rx")}>
                                            <span className="tabular-nums">{formatDbm(onu.olt_rx_power_dbm)}</span>
                                        </Fact>
                                    )}
                                    {onu.distance_m != null && (
                                        <Fact label={t("onu.columns.distance")}>
                                            <span className="tabular-nums">{formatDistance(onu.distance_m)}</span>
                                        </Fact>
                                    )}
                                    <Fact label={t(onu.status === "online" ? "onu.columns.last_seen" : "onu.columns.down_since")}>
                                        <span title={changedAt ? formatDateTime(changedAt) : undefined}>{relative(changedAt)}</span>
                                    </Fact>
                                </div>
                                {onu.olt && (
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">{t("onu.columns.olt")}:</span>{" "}
                                        {canShowOlt ? (
                                            <Link href={`/olts/view/${onu.olt.id}`} className="font-medium hover:underline">
                                                {onu.olt.name}
                                            </Link>
                                        ) : (
                                            onu.olt.name
                                        )}
                                        {onu.pon_port && <span className="text-muted-foreground"> · {onu.pon_port.name}</span>}
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
