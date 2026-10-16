"use client";

import { FC, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Loader2, LogIn, Network, Radio, X } from "lucide-react";
import { toast } from "react-toastify";
import { useFetch } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientRow, getClientId, RouterInfo } from "@/components/clients/client-type";
import ClientSpeedWidget from "@/components/clients/client-speed-widget";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import MyButton, { type ButtonProps } from "@/components/my-button";

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
const PING_RESULT_DISPLAY_MS = 2000;
const ROUTER_INFO_STALE_MS = 30_000;
const CLIENT_DEVICE_PORT = 80;

type PingState = "idle" | "loading" | "success" | "error";

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

function ClientIpPingControl({
    clientId,
    ipAddress,
    buttonVariant = "outline",
}: ClientIpPingButtonProps) {
    const { t } = useTranslation();
    const [pingState, setPingState] = useState<PingState>("idle");
    const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pingIp = validIpAddress(ipAddress);
    const tooltipKey = pingIp ? "client.basic_view.ping" : "client.basic_view.ping_unavailable";
    const deviceUrl = pingIp ? clientDeviceUrl(pingIp) : null;
    const openLabel = deviceUrl
        ? t("client.basic_view.open_ip", { url: deviceUrl })
        : t("client.basic_view.ping_unavailable");

    useEffect(() => {
        return () => {
            if (resetTimeoutRef.current) {
                clearTimeout(resetTimeoutRef.current);
            }
        };
    }, []);

    const scheduleReset = () => {
        if (resetTimeoutRef.current) {
            clearTimeout(resetTimeoutRef.current);
        }

        resetTimeoutRef.current = setTimeout(() => {
            setPingState("idle");
        }, PING_RESULT_DISPLAY_MS);
    };

    const handlePing = async () => {
        if (!pingIp || pingState === "loading") {
            return;
        }

        setPingState("loading");

        try {
            const result = await useFetch({
                url: `/client-ping/${clientId}?ip=${encodeURIComponent(pingIp)}`,
            });
            const reachable = Boolean(
                result?.success && (result.data as { reachable?: boolean } | undefined)?.reachable
            );
            if (reachable) {
                setPingState("success");
                toast.success(t("client.basic_view.ping_success", { ip: pingIp }));
            } else {
                setPingState("error");
                toast.error(t("client.basic_view.ping_failed", { ip: pingIp }));
            }
        } catch {
            setPingState("error");
            toast.error(t("client.basic_view.ping_failed", { ip: pingIp }));
        }

        scheduleReset();
    };

    const handleOpenDevice = () => {
        if (!deviceUrl) {
            return;
        }

        window.open(deviceUrl, "_blank", "noopener,noreferrer");
    };

    const pingIcon =
        pingState === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
        ) : pingState === "success" ? (
            <Check className="h-4 w-4 text-green-600" />
        ) : pingState === "error" ? (
            <X className="h-4 w-4 text-destructive" />
        ) : (
            <Radio className="h-4 w-4" />
        );

    return (
        <div className="flex items-center gap-2">
            <MyButton
                type="button"
                variant={buttonVariant}
                size="icon"
                disabled={!pingIp || pingState === "loading"}
                onClick={handlePing}
                tooltip={tooltipKey}
                aria-label={t(tooltipKey)}
            >
                {pingIcon}
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
                            <Badge variant="default" className="gap-1 bg-green-600 hover:bg-green-700">
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
