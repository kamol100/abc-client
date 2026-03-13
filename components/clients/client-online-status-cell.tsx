"use client";

import { FC } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import useInView from "@/hooks/use-in-view";
import { Skeleton } from "@/components/ui/skeleton";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";

interface ClientOnlineStatus {
    ip_address?: string | null;
    router_mac_address?: string | null;
    uptime?: string | null;
}

interface Props {
    clientId: number;
    inactive?: boolean;
}

const ClientOnlineStatusCell: FC<Props> = ({ clientId, inactive }) => {
    const { t } = useTranslation();
    const { ref, inView } = useInView();

    const { data, isLoading } = useApiQuery<ApiResponse<ClientOnlineStatus>>({
        queryKey: ["client-online-status", clientId],
        url: `client-online-status/${clientId}`,
        pagination: false,
        enabled: inView,
        staleTime: 10_000,
    });

    const status = data?.data;

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
                        {t("client.online.ip")}: {status?.ip_address || "—"}
                    </span>
                    <span className={cn("text-sm font-mono", inactive ? "text-destructive/80" : "text-muted-foreground")}>
                        {t("client.online.mac")}: {status?.router_mac_address || "—"}
                    </span>
                    <span className={cn("text-xs font-mono", inactive ? "text-destructive/60" : "text-muted-foreground")}>
                        {t("client.online.uptime")}: {status?.uptime || "—"}
                    </span>
                </div>
            )}
        </div>
    );
};

export default ClientOnlineStatusCell;
