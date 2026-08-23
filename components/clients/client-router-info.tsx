"use client";

import { FC, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Loader2, Network, Radio, X } from "lucide-react";
import { toast } from "react-toastify";
import { useFetch } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientRow, getClientId, RouterInfo } from "./client-type";
import ClientSpeedWidget from "./client-speed-widget";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import MyButton from "@/components/my-button";

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

type PingState = "idle" | "loading" | "success" | "error";

interface ClientIpPingButtonProps {
    clientId: string;
    ipAddress?: string | null;
}

function ClientIpPingButton({ clientId, ipAddress }: ClientIpPingButtonProps) {
    const { t } = useTranslation();
    const [pingState, setPingState] = useState<PingState>("idle");
    const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hasIpAddress = Boolean(ipAddress);

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
        if (!hasIpAddress || !ipAddress || pingState === "loading") {
            return;
        }

        setPingState("loading");

        try {
            const result = await useFetch({
                url: `/client-ping/${clientId}?ip=${encodeURIComponent(ipAddress)}`,
            });
            const reachable = Boolean(
                result?.success && (result.data as { reachable?: boolean } | undefined)?.reachable
            );
            if (reachable) {
                setPingState("success");
                toast.success(t("client.basic_view.ping_success", { ip: ipAddress }));
            } else {
                setPingState("error");
                toast.error(t("client.basic_view.ping_failed", { ip: ipAddress }));
            }
        } catch {
            setPingState("error");
            toast.error(t("client.basic_view.ping_failed", { ip: ipAddress }));
        }

        scheduleReset();
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
        <MyButton
            variant="outline"
            size="icon"
            disabled={!hasIpAddress || pingState === "loading"}
            onClick={handlePing}
            tooltip={
                hasIpAddress
                    ? t("client.basic_view.ping")
                    : t("client.basic_view.ping_unavailable")
            }
        >
            {pingIcon}
        </MyButton>
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
    } = useApiQuery<ApiResponse<RouterInfo>>({
        queryKey: ['client-router-info', clientId],
        url: `client-router-info/${clientId}`,
        pagination: false,
    });

    const routerData: RouterInfo = routerInfo?.data ?? {};


    return (
        <div className="space-y-0 px-3 py-3">
            <InfoRow label={t("client.basic_view.up_down")}>
                <ClientSpeedWidget clientId={clientId} />
            </InfoRow>
            {isRouterInfoLoading ? <ClientRouterInfoSkeleton /> : (
                <>
                    <InfoRow label={t("client.ip_address.label")}>
                        <span className="inline-flex items-center gap-2">
                            {routerData?.ip_address ?? "—"}
                            {routerData?.ip_address && (
                                <div>
                                    <ClientIpPingButton
                                        clientId={clientId}
                                        ipAddress={routerData?.ip_address}
                                    />
                                </div>
                            )}
                        </span>
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
