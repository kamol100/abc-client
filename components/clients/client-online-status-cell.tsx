"use client";

import { createContext, FC, useContext, useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { ClientIpPingButton } from "@/components/clients/client-router-info";

interface ClientOnlineStatus {
    ip_address?: string | null;
    router_mac_address?: string | null;
    uptime?: string | null;
    is_online?: boolean;
}

interface ClientOnlineStatusContextValue {
    statuses: Record<string, ClientOnlineStatus>;
    isLoading: boolean;
}

const ClientOnlineStatusContext = createContext<ClientOnlineStatusContextValue>({
    statuses: {},
    isLoading: false,
});

const BATCH_LIMIT = 100;

export function ClientOnlineStatusProvider({
    clientIds,
    children,
}: {
    clientIds: string[];
    children: ReactNode;
}) {
    const ids = useMemo(
        () => Array.from(new Set(clientIds.filter((id) => id.length > 0))).sort().slice(0, BATCH_LIMIT),
        [clientIds],
    );

    const { data, isLoading, isFetching } = useApiQuery<ApiResponse<Record<string, ClientOnlineStatus>>>({
        queryKey: ["client-online-status-batch"],
        url: "client-online-status",
        params: ids.length > 0 ? { uuids: ids.join(",") } : undefined,
        pagination: false,
        enabled: ids.length > 0,
        staleTime: 10_000,
        retry: 0,
    });

    const value = useMemo<ClientOnlineStatusContextValue>(() => ({
        statuses: data?.data ?? {},
        isLoading: ids.length > 0 && (isLoading || isFetching) && !data,
    }), [data, ids.length, isFetching, isLoading]);

    return (
        <ClientOnlineStatusContext.Provider value={value}>
            {children}
        </ClientOnlineStatusContext.Provider>
    );
}

interface Props {
    clientId: string;
    inactive?: boolean;
}

const onlineStatusCellClass = "flex w-60 min-w-60 flex-col gap-0.5";

function OnlineStatusSkeleton() {
    return (
        <div className={onlineStatusCellClass} aria-busy="true">
            <div className="flex h-9 items-center">
                <Skeleton className="h-4 w-full" />
            </div>
            <div className="flex h-5 items-center">
                <Skeleton className="h-4 w-full" />
            </div>
            <div className="flex h-4 items-center">
                <Skeleton className="h-3 w-full" />
            </div>
        </div>
    );
}

const ClientOnlineStatusCell: FC<Props> = ({ clientId, inactive }) => {
    const { t } = useTranslation();
    const { statuses, isLoading } = useContext(ClientOnlineStatusContext);
    const status = statuses[clientId];
    const showSkeleton = isLoading && !status;

    if (showSkeleton) {
        return <OnlineStatusSkeleton />;
    }

    const isOnline = status?.is_online === true;
    const onlineLabel = t(isOnline ? "client.basic_view.online" : "client.basic_view.offline");
    const OnlineIcon = isOnline ? Wifi : WifiOff;
    const labelClass = inactive ? "text-destructive" : "text-foreground";
    const valueClass = inactive ? "text-destructive/80" : "text-muted-foreground";

    return (
        <div className={onlineStatusCellClass}>
            <div className="flex h-9 items-center gap-1 overflow-hidden">
                <span className={cn("shrink-0 text-sm font-medium font-mono", labelClass)}>
                    {t("client.online.ip")}:
                </span>
                {status?.ip_address ? (
                    <>
                        <span className="min-w-0 truncate text-xs text-muted-foreground">
                            {status.ip_address}
                        </span>
                        <div className="shrink-0">
                            <ClientIpPingButton
                                clientId={clientId}
                                ipAddress={status.ip_address}
                                buttonVariant="ghost"
                            />
                        </div>
                    </>
                ) : (
                    <span className={cn("text-sm font-medium font-mono", labelClass)}>-</span>
                )}
            </div>
            <div className="flex h-5 items-center overflow-hidden">
                <span className={cn("truncate text-sm font-mono", valueClass)}>
                    {t("client.online.mac")}: {status?.router_mac_address || "—"}
                </span>
            </div>
            <div className="flex h-4 items-center gap-1 overflow-hidden">
                <span className={cn("truncate text-xs font-mono", inactive ? "text-destructive/60" : "text-muted-foreground")}>
                    {t("client.online.uptime")}: {status?.uptime || "—"}
                </span>
                {status && (
                    <OnlineIcon
                        className={cn(
                            "h-3.5 w-3.5 shrink-0",
                            isOnline ? "text-green-600 dark:text-green-400" : "text-destructive"
                        )}
                        aria-hidden={false}
                        aria-label={onlineLabel}
                    />
                )}
            </div>
        </div>
    );
};

export default ClientOnlineStatusCell;
