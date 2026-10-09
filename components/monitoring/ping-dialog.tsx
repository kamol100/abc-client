"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Radio } from "lucide-react";
import { MyDialog } from "@/components/my-dialog";
import MyButton from "@/components/my-button";
import { usePermissions } from "@/context/app-provider";
import useApiMutation from "@/hooks/use-api-mutation";
import { cn } from "@/lib/utils";
import MonitorStateBadge from "./monitor-state-badge";
import { formatPct } from "./monitoring-format";
import type { PingResult } from "./monitoring-type";

// A ping is a check like any other: it can change the device state wherever it is shown.
const INVALIDATE_KEYS = "olts,device-monitoring,device-checks,noc";

interface Props {
    deviceId: string;
    deviceName: string;
}

/** Ping icon button that opens the Ping dialog and pings right away. Hidden without `devices.ping`. */
export default function PingDialog({ deviceId, deviceName }: Props) {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();
    const [open, setOpen] = useState(false);
    const { mutate: ping, data: result, isPending, isError, reset } = useApiMutation<PingResult>({
        url: `/devices/${deviceId}/ping`,
        method: "POST",
        invalidateKeys: INVALIDATE_KEYS,
        defaultErrorMessage: "monitoring.ping.failed",
    });

    if (!hasPermission("devices.ping")) return null;

    const handleOpenChange = (next: boolean) => {
        setOpen(next);
        if (next) {
            reset();
            ping();
        }
    };

    const ms = (value: number | null) => (value == null ? "—" : Number(value).toFixed(1));

    return (
        <>
            <MyButton
                type="button"
                variant="outline"
                size="icon"
                aria-label={t("monitoring.ping.button")}
                tooltip={t("monitoring.ping.button")}
                onClick={() => handleOpenChange(true)}
            >
                <Radio className="h-4 w-4" />
            </MyButton>
            <MyDialog
                open={open}
                onOpenChange={handleOpenChange}
                title="monitoring.ping.title"
                titleValues={{ name: deviceName }}
                size="md"
                footer={({ close }) => (
                    <>
                        <MyButton type="button" variant="outline" size="default" onClick={close}>
                            {t("monitoring.ping.close")}
                        </MyButton>
                        <MyButton
                            type="button"
                            variant="default"
                            size="default"
                            loading={isPending}
                            onClick={() => ping()}
                        >
                            {!isPending && <Radio className="h-4 w-4" />}
                            {t("monitoring.ping.again")}
                        </MyButton>
                    </>
                )}
            >
                <div aria-live="polite" className="text-sm">
                    {isPending ? (
                        <p role="status" className="flex items-center gap-2 py-6 text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {t("monitoring.ping.running")}
                        </p>
                    ) : result ? (
                        <div className="flex flex-col gap-2.5">
                            <div className="flex flex-wrap items-center gap-2.5">
                                <MonitorStateBadge state={result.result} />
                                {result.sent > 0 && (
                                    <span>
                                        {t("monitoring.ping.summary", {
                                            sent: result.sent,
                                            received: result.received,
                                            loss: formatPct(result.loss_pct, true),
                                        })}
                                    </span>
                                )}
                            </div>
                            {result.reason && (
                                <p className="text-muted-foreground">
                                    {t(`monitoring.ping.reason.${result.reason}`, { defaultValue: result.reason })}
                                </p>
                            )}
                            {result.rtt_avg_ms != null && (
                                <p className="text-muted-foreground">
                                    {t("monitoring.ping.rtt", {
                                        min: ms(result.rtt_min_ms),
                                        avg: ms(result.rtt_avg_ms),
                                        max: ms(result.rtt_max_ms),
                                    })}
                                </p>
                            )}
                            {result.replies.length > 0 && (
                                <ol className="rounded-md border border-border px-3 py-2.5 font-mono text-xs leading-relaxed">
                                    {result.replies.map((reply) => (
                                        <li key={reply.seq} className={cn(reply.rtt_ms == null && "text-destructive")}>
                                            {reply.rtt_ms == null
                                                ? t("monitoring.ping.timed_out", { seq: reply.seq })
                                                : t("monitoring.ping.reply", { seq: reply.seq, ms: ms(reply.rtt_ms) })}
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </div>
                    ) : isError ? (
                        <p className="py-6 text-destructive">{t("monitoring.ping.failed")}</p>
                    ) : null}
                </div>
            </MyDialog>
        </>
    );
}
