"use client";

import DisplayCount from "@/components/display-count";
import {
    ClientActivity,
    ClientActivitySchema,
} from "@/components/clients/client-type";
import { Skeleton } from "@/components/ui/skeleton";
import { useSidebar } from "@/components/ui/sidebar";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toNumber } from "@/lib/helper/helper";
import { Ban, Wifi, WifiOff } from "lucide-react";

const DEFAULT_ACTIVITY: ClientActivity = {
    total: 0,
    online: 0,
    offline: 0,
    disabled: 0,
};

function ActivityCountSkeleton({ isMobile }: { isMobile: boolean }) {
    return (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {isMobile && (
                <div className="flex items-center gap-1">
                    <Skeleton className="h-4 w-14" />
                    <Skeleton className="h-4 w-10" />
                </div>
            )}
            {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center gap-1.5">
                    {isMobile ? (
                        <Skeleton className="h-4 w-4 shrink-0 rounded-sm" />
                    ) : (
                        <Skeleton className="h-4 w-12" />
                    )}
                    <Skeleton className="h-4 w-8" />
                </div>
            ))}
        </div>
    );
}

interface ActivityItemProps {
    label: string;
    icon?: React.ReactNode;
    value: number;
    valueClassName?: string;
    showIcon?: boolean;
}

function ActivityItem({ label, icon, value, valueClassName, showIcon }: ActivityItemProps) {
    return (
        <div className="flex items-center gap-1.5 text-sm" title={label}>
            {showIcon ? (
                <span className="inline-flex shrink-0" aria-label={label}>{icon}</span>
            ) : (
                <span className="text-muted-foreground">{label}</span>
            )}
            <DisplayCount
                amount={value}
                className={cn("font-semibold tabular-nums", valueClassName)}
            />
        </div>
    );
}

export default function ClientCount() {
    const { t } = useTranslation();
    const { isMobile } = useSidebar();

    const { data, isLoading, isFetching, isError } = useApiQuery<ApiResponse<unknown>>({
        queryKey: ["client-activity"],
        url: "client-activity",
        pagination: false,
    });

    const activity = useMemo(() => {
        const parsed = ClientActivitySchema.safeParse(data?.data);
        return parsed.success ? parsed.data : DEFAULT_ACTIVITY;
    }, [data?.data]);

    const offlineCount = useMemo(() => {
        const totalCount = toNumber(activity.total);
        const onlineCount = toNumber(activity.online);
        const disabledCount = toNumber(activity.disabled);

        return Math.max(0, totalCount - (onlineCount + disabledCount));
    }, [activity.disabled, activity.online, activity.total]);

    if (isLoading || isFetching) {
        return <ActivityCountSkeleton isMobile={isMobile} />;
    }

    return (
        <>
            {!isError && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    {isMobile && (
                        <span className="inline-flex items-center gap-1 text-sm">
                            <span>{t("client.title_plural")}</span>
                            <span className="inline-flex items-center font-semibold tabular-nums">
                                (<DisplayCount amount={toNumber(activity.total)} />)
                            </span>
                        </span>
                    )}
                    <ActivityItem
                        label={t("client.activity.online")}
                        icon={<Wifi className="h-4 w-4 text-green-600 dark:text-green-400" />}
                        value={activity.online}
                        valueClassName="text-green-600 dark:text-green-400"
                        showIcon={isMobile}
                    />
                    <ActivityItem
                        label={t("client.activity.offline")}
                        icon={<WifiOff className="h-4 w-4 text-destructive" />}
                        value={offlineCount}
                        valueClassName="text-destructive"
                        showIcon={isMobile}
                    />
                    <ActivityItem
                        label={t("client.activity.disabled")}
                        icon={<Ban className="h-4 w-4 text-muted-foreground" />}
                        value={activity.disabled}
                        valueClassName="text-muted-foreground"
                        showIcon={isMobile}
                    />
                </div>
            )}
        </>
    );
}
