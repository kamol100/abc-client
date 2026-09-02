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

const DEFAULT_ACTIVITY: ClientActivity = {
    total: 0,
    online: 0,
    offline: 0,
    disabled: 0,
};

function ActivityCountSkeleton({ showTotal }: { showTotal: boolean }) {
    return (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {Array.from({ length: showTotal ? 3 : 2 }).map((_, index) => (
                <div key={index} className="flex items-center gap-1.5">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-8" />
                </div>
            ))}
        </div>
    );
}

interface ActivityItemProps {
    label: string;
    value: number;
    valueClassName?: string;
}

function ActivityItem({ label, value, valueClassName }: ActivityItemProps) {
    return (
        <div className="flex items-center gap-1.5 text-sm">
            <span className="text-muted-foreground">{label}</span>
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
        return toNumber(activity.offline) + toNumber(activity.disabled);
    }, [activity.disabled, activity.offline]);

    if (isLoading || isFetching) {
        return <ActivityCountSkeleton showTotal={isMobile} />;
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
                        value={activity.online}
                        valueClassName="text-green-600 dark:text-green-400"
                    />
                    <ActivityItem
                        label={t("client.activity.offline")}
                        value={offlineCount}
                        valueClassName="text-destructive"
                    />
                </div>
            )}
        </>
    );
}
