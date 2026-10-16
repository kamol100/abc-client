"use client";

import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import useInView from "@/hooks/use-in-view";
import { Skeleton } from "@/components/ui/skeleton";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { ClientIpPingButton } from "@/components/clients/client-router-info";

interface ClientOnlineStatus {
    ip_address?: string | null;
    router_mac_address?: string | null;
    uptime?: string | null;
    is_online?: boolean;
}

interface Props {
    clientId: string;
    inactive?: boolean;
}

const ClientOnlineStatusCell: FC<Props> = ({ clientId, inactive }) => {
    const { t } = useTranslation();
    const { ref, inView } = useInView();

    const { data, isLoading, isFetched } = useApiQuery<ApiResponse<ClientOnlineStatus>>({
        queryKey: ["client-online-status", clientId],
        url: `client-online-status/${clientId}`,
        pagination: false,
        enabled: inView,
        staleTime: 10_000,
    });

    const status = data?.data;
    const isOnline = status?.is_online === true;
    const onlineLabel = t(isOnline ? "client.basic_view.online" : "client.basic_view.offline");
    const OnlineIcon = isOnline ? Wifi : WifiOff;

    return (
        <div ref={ref} className="min-w-[130px]">
            {isLoading ? (
                <div className="flex flex-col gap-0.5">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                </div>
            ) : (
                <div className="flex flex-col gap-0.5">
                    <span className={cn("text-sm font-medium font-mono", inactive ? "text-destructive" : "text-foreground")}>
                        {t("client.online.ip")}: {status?.ip_address ? (<div className="inline-flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">
                                {status?.ip_address}
                            </span>
                            <ClientIpPingButton
                                clientId={clientId}
                                ipAddress={status.ip_address}
                                buttonVariant="ghost"
                            />
                        </div>) : ("-")}
                    </span>
                    <span className={cn("text-sm font-mono", inactive ? "text-destructive/80" : "text-muted-foreground")}>
                        {t("client.online.mac")}: {status?.router_mac_address || "—"}
                    </span>
                    <span className={cn("inline-flex items-center gap-1 text-xs font-mono", inactive ? "text-destructive/60" : "text-muted-foreground")}>
                        {t("client.online.uptime")}: {status?.uptime || "—"}
                        {isFetched && (
                            <OnlineIcon
                                className={cn(
                                    "h-3.5 w-3.5 shrink-0",
                                    isOnline ? "text-green-600 dark:text-green-400" : "text-destructive"
                                )}
                                aria-hidden={false}
                                aria-label={onlineLabel}
                            />
                        )}
                    </span>
                </div>
            )}
        </div>
    );
};

export default ClientOnlineStatusCell;
