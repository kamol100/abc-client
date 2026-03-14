"use client";

import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Network } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientRow, RouterInfo } from "./client-type";
import ClientSpeedWidget from "./client-speed-widget";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";

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
    const {
        data: routerInfo,
        isLoading: isRouterInfoLoading,
    } = useApiQuery<ApiResponse<RouterInfo>>({
        queryKey: ['client-router-info', client.id],
        url: `client-router-info/${client.id}`,
        pagination: false,
    });

    const routerData: RouterInfo = routerInfo?.data ?? {};


    return (
        <div className="space-y-0 px-3 py-3">
            <InfoRow label={t("client.basic_view.up_down")}>
                <ClientSpeedWidget clientId={client.id.toString()} />
            </InfoRow>
            {isRouterInfoLoading ? <ClientRouterInfoSkeleton /> : (
                <>
                    <InfoRow label={t("client.ip_address.label")}>{routerData?.ip_address ?? "—"}</InfoRow>
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
