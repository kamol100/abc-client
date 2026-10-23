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

const ClientOnlineStatusCell: FC<Props> = ({ clientId, inactive }) => {
    const { t } = useTranslation();
    const { statuses, isLoading } = useContext(ClientOnlineStatusContext);
    const status = statuses[clientId];
    const showSkeleton = isLoading && !status;
    const isOnline = status?.is_online === true;
    const onlineLabel = t(isOnline ? "client.basic_view.online" : "client.basic_view.offline");
    const OnlineIcon = isOnline ? Wifi : WifiOff;

    return (
        <div className="min-w-[130px]">
            {showSkeleton ? (
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
                                {status.ip_address}
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
                    </span>
                </div>
            )}
        </div>
    );
};

export default ClientOnlineStatusCell;
