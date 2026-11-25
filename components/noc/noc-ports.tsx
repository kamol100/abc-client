"use client";

import Link from "next/link";
import { ChevronDown, Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatDateTime, useMonitoringFormat } from "@/components/monitoring/monitoring-format";
import { notPolledReasonKey, NocSummary } from "@/components/noc/noc-type";

interface Props {
    monitoring: NonNullable<NocSummary["port_monitoring"]>;
    canShowOlt: boolean;
}

/** "Port monitoring is off or out of date for N of M OLTs", expandable to the OLTs and why. */
export default function NotPolledNotice({ monitoring, canShowOlt }: Props) {
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
