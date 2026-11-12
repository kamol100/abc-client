"use client";

import { FC, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { LogIn, Network, Radio, RefreshCw } from "lucide-react";
import { useFetch } from "@/app/actions";
import MyTooltip from "@/components/my-tooltip";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ClientRow, ClientUsage, getClientId, RouterInfo } from "@/components/clients/client-type";
import ClientSpeedWidget from "@/components/clients/client-speed-widget";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { formatDataUsage } from "@/lib/helper/helper";
import { cn } from "@/lib/utils";
import MyButton, { type ButtonProps } from "@/components/my-button";
import { MyDialog, useMyDialogClose } from "@/components/my-dialog";

type ClientWithRouter = Pick<ClientRow, "id" | "router_info" | "network">;

interface Props {
    client: ClientWithRouter;
}

const InfoRow: FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="flex items-start gap-2 py-1.5 text-sm">
        <span className="w-28 shrink-0 font-medium text-muted-foreground">{label}</span>
        <span className="shrink-0 font-medium text-foreground">:</span>
        <span className="min-w-0 break-words text-foreground">{children}</span>
    </div>
);

const ROUTER_INFO_ROW_COUNT = 7;
const ROUTER_INFO_STALE_MS = 30_000;
const CLIENT_USAGE_STALE_MS = 60_000;
const CLIENT_DEVICE_PORT = 80;
const PING_PLACEHOLDER_ROWS = 5;

interface PingReply {
    seq: number;
    host: string;
    time: string | null;
    size: string | null;
    ttl: string | null;
    status: "ok" | "timeout";
}

interface PingReport {
    reachable: boolean;
    sent: number;
    received: number;
    timeout: number;
    packet_loss: number;
    replies: PingReply[];
}

interface ClientIpPingButtonProps {
    clientId: string;
    ipAddress?: string | null;
    buttonVariant?: ButtonProps["variant"];
}

function isValidIpv4(ip: string): boolean {
    const octets = ip.split(".");
    if (octets.length !== 4) {
        return false;
    }

    return octets.every((octet) => {
        if (!/^\d{1,3}$/.test(octet)) {
            return false;
        }

        const value = Number(octet);
        return value >= 0 && value <= 255;
    });
}

function isValidIpv6(ip: string): boolean {
    if (!ip.includes(":")) {
        return false;
    }

    try {
        return new URL(`http://[${ip}]`).hostname.includes(":");
    } catch {
        return false;
    }
}

function validIpAddress(value?: string | null): string | null {
    if (typeof value !== "string") {
        return null;
    }

    const ip = value.trim();
    if (!ip || (!isValidIpv4(ip) && !isValidIpv6(ip))) {
        return null;
    }

    return ip;
}

function clientDeviceUrl(ip: string): string {
    const host = ip.includes(":") ? `[${ip}]` : ip;
    return `http://${host}:${CLIENT_DEVICE_PORT}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function textOrNull(value: unknown): string | null {
    return typeof value === "string" && value.trim() !== "" ? value : null;
}

function wholeNumber(value: unknown, fallback: number): number {
    const number = typeof value === "number" || typeof value === "string" ? Number(value) : Number.NaN;
    return Number.isFinite(number) ? number : fallback;
}

function readPingReport(value: unknown): PingReport | null {
    if (typeof value !== "object" || value === null) {
        return null;
    }

    const record = value as Record<string, unknown>;
    const replies: PingReply[] = [];

    if (Array.isArray(record.replies)) {
        for (const item of record.replies) {
            if (typeof item !== "object" || item === null) {
                continue;
            }

            const row = item as Record<string, unknown>;
            const host = textOrNull(row.host);
            if (!host) {
                continue;
            }

            replies.push({
                seq: wholeNumber(row.seq, replies.length + 1),
                host,
                time: textOrNull(row.time),
                size: textOrNull(row.size),
                ttl: textOrNull(row.ttl),
                status: row.status === "timeout" ? "timeout" : "ok",
            });
        }
    }

    const sent = wholeNumber(record.sent, replies.length);
    const received = wholeNumber(
        record.received,
        replies.filter((reply) => reply.status === "ok").length,
    );
    const timeout = wholeNumber(record.timeout, Math.max(0, sent - received));

    if (replies.length === 0 && typeof record.reachable !== "boolean" && record.sent === undefined) {
        return null;
    }

    return {
        reachable: typeof record.reachable === "boolean" ? record.reachable : received > 0,
        sent,
        received,
        timeout,
        packet_loss: wholeNumber(record.packet_loss, sent > 0 ? (timeout / sent) * 100 : 0),
        replies,
    };
}

function useClientRouterInfo(clientId: string, enabled = true) {
    return useApiQuery<ApiResponse<RouterInfo>>({
        queryKey: ["client-router-info", clientId],
        url: `client-router-info/${clientId}`,
        pagination: false,
        enabled: enabled && clientId.length > 0,
        staleTime: ROUTER_INFO_STALE_MS,
        retry: false,
    });
}

function ClientIpPingDialogBody({
    ipAddress,
    report,
    pinging,
    failed,
    onPingAgain,
}: {
    ipAddress: string;
    report: PingReport | null;
    pinging: boolean;
    failed: boolean;
    onPingAgain: () => void;
}) {
    const { t } = useTranslation();
    const close = useMyDialogClose();
    const showPlaceholder = pinging && !report;
    const showFailure = !pinging && (failed || (report !== null && report.replies.length === 0));
    const loss = report ? `${report.packet_loss.toFixed(2)}%` : null;

    return (
        <div className="overflow-hidden rounded-md border">
            <Table aria-busy={pinging}>
                <TableHeader>
                    <TableRow className="border-border bg-muted hover:bg-muted">
                        <TableHead className="h-9 w-14 text-center">{t("client.basic_view.ping_sl")}</TableHead>
                        <TableHead className="h-9 text-center">{t("client.basic_view.ping_ip")}</TableHead>
                        <TableHead className="h-9 text-center">{t("client.basic_view.ping_time")}</TableHead>
                        <TableHead className="h-9 text-center">{t("client.basic_view.ping_size")}</TableHead>
                        <TableHead className="h-9 w-16 text-center">{t("client.basic_view.ping_ttl")}</TableHead>
                        <TableHead className="h-9 w-24 text-center">{t("client.basic_view.ping_status")}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {showPlaceholder ? (
                        Array.from({ length: PING_PLACEHOLDER_ROWS }).map((_, index) => (
                            <TableRow key={index}>
                                <TableCell colSpan={6}>
                                    <Skeleton className="h-4 w-full" />
                                </TableCell>
                            </TableRow>
                        ))
                    ) : null}
                    {showFailure ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center text-destructive">
                                {t("client.basic_view.ping_failed", { ip: ipAddress })}
                            </TableCell>
                        </TableRow>
                    ) : null}
                    {report?.replies.map((reply) => (
                        <TableRow key={reply.seq}>
                            <TableCell className="text-center">{reply.seq}</TableCell>
                            <TableCell className="text-center">{reply.host}</TableCell>
                            <TableCell className="text-center">{reply.time ?? "—"}</TableCell>
                            <TableCell className="text-center">{reply.size ?? "—"}</TableCell>
                            <TableCell className="text-center">{reply.ttl ?? "—"}</TableCell>
                            <TableCell
                                className={cn(
                                    "text-center font-medium",
                                    reply.status === "ok"
                                        ? "text-green-600 dark:text-green-400"
                                        : "text-destructive",
                                )}
                            >
                                {reply.status === "ok"
                                    ? t("client.basic_view.ping_status_ok")
                                    : t("client.basic_view.ping_status_timeout")}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={6}>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                {report ? (
                                    <p className="text-sm">
                                        <span>{t("client.basic_view.ping_pinged")}: {report.sent}</span>
                                        <span className="text-muted-foreground"> || </span>
                                        <span className="font-medium text-green-600 dark:text-green-400">
                                            {t("client.basic_view.ping_ok")}: {report.received}
                                        </span>
                                        <span className="text-muted-foreground"> || </span>
                                        <span>{t("client.basic_view.ping_timeout")}: {report.timeout}</span>
                                        <span className="text-muted-foreground"> || </span>
                                        <span className="font-medium text-destructive">
                                            {t("client.basic_view.ping_loss")}: {loss}
                                        </span>
                                    </p>
                                ) : (
                                    <span className="sr-only">{pinging ? t("common.loading") : ""}</span>
                                )}
                                <div className="ml-auto flex items-center gap-2">
                                    <MyButton type="button" variant="outline" onClick={() => close?.()}>
                                        {t("common.cancel")}
                                    </MyButton>
                                    <MyButton
                                        type="button"
                                        variant="default"
                                        size="icon"
                                        loading={pinging}
                                        onClick={onPingAgain}
                                        aria-label={t("client.basic_view.ping_again")}
                                        tooltip="client.basic_view.ping_again"
                                    >
                                        {pinging ? null : <RefreshCw className="h-4 w-4" />}
                                    </MyButton>
                                </div>
                            </div>
                        </TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </div>
    );
}

function ClientIpPingControl({
    clientId,
    ipAddress,
    buttonVariant = "outline",
}: ClientIpPingButtonProps) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [pinging, setPinging] = useState(false);
    const [failed, setFailed] = useState(false);
    const [report, setReport] = useState<PingReport | null>(null);
    const requestIdRef = useRef(0);
    const pingIp = validIpAddress(ipAddress);
    const tooltipKey = pingIp ? "client.basic_view.ping" : "client.basic_view.ping_unavailable";
    const deviceUrl = pingIp ? clientDeviceUrl(pingIp) : null;
    const openLabel = deviceUrl
        ? t("client.basic_view.open_ip", { url: deviceUrl })
        : t("client.basic_view.ping_unavailable");

    const runPing = async () => {
        if (!pingIp) {
            return;
        }

        const requestId = ++requestIdRef.current;
        setPinging(true);
        setFailed(false);

        try {
            const result: unknown = await useFetch({
                url: `/client-ping/${clientId}?ip=${encodeURIComponent(pingIp)}`,
            });

            if (requestId !== requestIdRef.current) {
                return;
            }

            const parsed = isRecord(result) && result.success === true
                ? readPingReport(result.data)
                : null;
            if (!parsed) {
                setReport(null);
                setFailed(true);
                return;
            }

            setReport(parsed);
        } catch {
            if (requestId !== requestIdRef.current) {
                return;
            }

            setReport(null);
            setFailed(true);
        } finally {
            if (requestId === requestIdRef.current) {
                setPinging(false);
            }
        }
    };

    const openDialog = () => {
        if (!pingIp) {
            return;
        }

        setReport(null);
        setFailed(false);
        setOpen(true);
        void runPing();
    };

    const handleOpenChange = (next: boolean) => {
        if (!next) {
            requestIdRef.current += 1;
            setPinging(false);
        }

        setOpen(next);
    };

    const handleOpenDevice = () => {
        if (!deviceUrl) {
            return;
        }

        window.open(deviceUrl, "_blank", "noopener,noreferrer");
    };

    return (
        <div className="flex items-center gap-2">
            <MyButton
                type="button"
                variant={buttonVariant}
                size="icon"
                disabled={!pingIp}
                onClick={openDialog}
                tooltip={tooltipKey}
                aria-label={t(tooltipKey)}
                aria-haspopup="dialog"
            >
                <Radio className="h-4 w-4" />
            </MyButton>
            <MyButton
                type="button"
                variant={buttonVariant}
                size="icon"
                disabled={!deviceUrl}
                onClick={handleOpenDevice}
                tooltip={deviceUrl ? openLabel : "client.basic_view.ping_unavailable"}
                aria-label={openLabel}
            >
                <LogIn className="h-4 w-4" />
            </MyButton>
            <MyDialog
                open={open}
                onOpenChange={handleOpenChange}
                title="client.basic_view.ping_results"
                description="client.basic_view.ping_description"
                titleValues={{ ip: pingIp ?? "" }}
                size="3xl"
                showFooter={false}
            >
                {pingIp ? (
                    <ClientIpPingDialogBody
                        ipAddress={pingIp}
                        report={report}
                        pinging={pinging}
                        failed={failed}
                        onPingAgain={() => void runPing()}
                    />
                ) : null}
            </MyDialog>
        </div>
    );
}

export function ClientIpPingButton({
    clientId,
    ipAddress,
    buttonVariant = "outline",
}: ClientIpPingButtonProps) {
    const { t } = useTranslation();
    const hasLocalIp = ipAddress !== undefined;
    const { data, isLoading, isError } = useClientRouterInfo(clientId, !hasLocalIp);
    const resolvedIp = hasLocalIp ? ipAddress : data?.data?.ip_address;
    const showLoading = !hasLocalIp && clientId.length > 0 && isLoading && !isError;

    if (showLoading) {
        return (
            <MyButton
                type="button"
                variant={buttonVariant}
                size="icon"
                loading
                aria-busy
                aria-label={t("client.basic_view.ping")}
                tooltip="client.basic_view.ping"
            />
        );
    }

    return (
        <ClientIpPingControl
            clientId={clientId}
            ipAddress={resolvedIp}
            buttonVariant={buttonVariant}
        />
    );
}

function useClientUsage(clientId: string) {
    return useApiQuery<ApiResponse<ClientUsage>>({
        queryKey: ["client-usage", clientId],
        url: `client-usage/${clientId}`,
        pagination: false,
        enabled: clientId.length > 0,
        staleTime: CLIENT_USAGE_STALE_MS,
        retry: false,
    });
}

function ClientUsageFigures({ usage }: { usage: ClientUsage }) {
    const { t } = useTranslation();
    const figures = [
        { shortKey: "client.basic_view.usage_today_short", labelKey: "client.basic_view.usage_today", period: usage.today },
        { shortKey: "client.basic_view.usage_this_month_short", labelKey: "client.basic_view.usage_this_month", period: usage.this_month },
        { shortKey: "client.basic_view.usage_last_month_short", labelKey: "client.basic_view.usage_last_month", period: usage.last_month },
    ].filter((figure) => figure.period.available);

    if (figures.length === 0) {
        return null;
    }

    return (
        <span className="inline-flex flex-wrap items-center gap-1">
            {figures.map((figure) => {
                const amount = formatDataUsage(figure.period.total_bytes);
                const tooltip = t("client.basic_view.usage_amount", {
                    period: t(figure.labelKey),
                    amount,
                });

                return (
                    <MyTooltip key={figure.shortKey} content={<span>{tooltip}</span>}>
                        <Badge variant="secondary" className="gap-1 text-xs" aria-label={tooltip}>
                            <span>{t(figure.shortKey)}</span>
                            <span>{amount}</span>
                        </Badge>
                    </MyTooltip>
                );
            })}
        </span>
    );
}

function ClientDataUsage({ clientId }: { clientId: string }) {
    const { t } = useTranslation();
    const { data, isLoading, isError } = useClientUsage(clientId);
    const usage = data?.data;
    const showLoading = clientId.length > 0 && isLoading && !isError;
    const hasVisibleUsage = Boolean(
        usage?.collected
        && [usage.today, usage.this_month, usage.last_month].some((period) => period?.available)
    );

    if (!showLoading && !hasVisibleUsage) {
        return null;
    }

    return (
        <InfoRow label={t("client.basic_view.data_usage")}>
            {showLoading ? (
                <span className="inline-flex flex-wrap gap-1" aria-busy="true">
                    <Skeleton className="h-5 w-14" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                </span>
            ) : usage ? (
                <ClientUsageFigures usage={usage} />
            ) : null}
        </InfoRow>
    );
}

function ClientRouterInfoSkeleton() {
    return (
        <div className="space-y-0 px-3 py-3">
            {Array.from({ length: ROUTER_INFO_ROW_COUNT }).map((_, i) => (
                <div key={i} className="flex items-center gap-2 py-1.5">
                    <Skeleton className="h-4 w-28 shrink-0" />
                    <Skeleton className="h-4 w-3 shrink-0" />
                    <Skeleton className="h-4 min-w-[80px] max-w-48 flex-1" />
                </div>
            ))}
        </div>
    );
}

const ClientRouterInfo: FC<Props> = ({ client }) => {
    const { t } = useTranslation();
    const clientId = getClientId(client) ?? "";
    const {
        data: routerInfo,
        isLoading: isRouterInfoLoading,
        isError: isRouterInfoError,
    } = useClientRouterInfo(clientId);

    const routerData: RouterInfo = routerInfo?.data ?? {};
    const showRouterInfoLoading = clientId.length > 0 && isRouterInfoLoading && !isRouterInfoError;

    return (
        <div className="space-y-0 px-3 py-3">
            <InfoRow label={t("client.basic_view.up_down")}>
                <ClientSpeedWidget clientId={clientId} />
            </InfoRow>
            <ClientDataUsage clientId={clientId} />
            {showRouterInfoLoading ? <ClientRouterInfoSkeleton /> : (
                <>
                    <InfoRow label={t("client.ip_address.label")}>
                        {routerData?.ip_address?.trim() ? routerData.ip_address : "—"}
                    </InfoRow>
                    <InfoRow label={t("client.basic_view.router_mac")}>
                        {routerData?.user_mac_address ?? "—"}
                    </InfoRow>
                    <InfoRow label={t("client.basic_view.uptime")}>{routerData?.uptime ?? "—"}</InfoRow>
                    <InfoRow label={t("client.basic_view.last_logout")}>
                        {routerData?.last_logout ?? "—"}
                    </InfoRow>
                    <InfoRow label={t("client.basic_view.is_online")}>
                        {routerData?.is_online ? (
                            <Badge variant="default" className="theme-badge-success-solid gap-1">
                                <Network className="h-3.5 w-3.5" />
                                {t("client.basic_view.online")}
                            </Badge>
                        ) : (
                            <Badge variant="destructive">{t("client.basic_view.offline")}</Badge>
                        )}
                    </InfoRow>
                </>
            )}
            <InfoRow label={t("client.network.label")}>{client?.network?.name ?? "—"}</InfoRow>
        </div>
    );
};

export default ClientRouterInfo;
