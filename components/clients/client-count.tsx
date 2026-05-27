"use client";

import DisplayCount from "@/components/display-count";
import {
    ClientActivity,
    ClientActivitySchema,
} from "@/components/clients/client-type";
import { Skeleton } from "@/components/ui/skeleton";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

const DEFAULT_ACTIVITY: ClientActivity = {
    total: 0,
    online: 0,
    offline: 0,
    disabled: 0,
};

function ActivityCountSkeleton() {
    return (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {Array.from({ length: 2 }).map((_, index) => (
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

    const { data, isLoading, isFetching, isError, error } = useApiQuery<ApiResponse<unknown>>({
        queryKey: ["client-activity"],
        url: "client-activity",
        pagination: false,
    });


    const activity = useMemo(() => {
        const parsed = ClientActivitySchema.safeParse(data?.data);
        return parsed.success ? parsed.data : DEFAULT_ACTIVITY;
    }, [data?.data]);

    if (isLoading || isFetching) {
        return <ActivityCountSkeleton />;
    }

    return (
        <>
            {!isError && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    {/* <ActivityItem label={t("client.activity.total")} value={activity.total} /> */}
                    <ActivityItem
                        label={t("client.activity.online")}
                        value={activity.online}
                        valueClassName="text-green-600 dark:text-green-400"
                    />
                    <ActivityItem
                        label={t("client.activity.offline")}
                        value={activity.offline}
                        valueClassName="text-destructive"
                    />
                </div>
            )}
        </>
    );
}
