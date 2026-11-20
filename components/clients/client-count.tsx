"use client";

import DisplayCount from "@/components/display-count";
import {
    ClientActivity,
    ClientActivitySchema,
} from "@/components/clients/client-type";
import { Skeleton } from "@/components/ui/skeleton";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { cn } from "@/lib/utils";
import { useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { toNumber } from "@/lib/helper/helper";
import { Ban, Wifi, WifiOff } from "lucide-react";

const DEFAULT_ACTIVITY: ClientActivity = {
    total: 0,
    online: 0,
    offline: 0,
    disabled: 0,
};

interface ActivityItemProps {
    label: string;
    icon: ReactNode;
    value: number;
    valueClassName?: string;
    pending: boolean;
}

function CountValue({
    amount,
    className,
    pending,
}: {
    amount: number;
    className?: string;
    pending: boolean;
}) {
    return (
        <span className="inline-flex h-5 items-center justify-center">
            {pending ? (
                <Skeleton className="h-4 w-6" />
            ) : (
                <DisplayCount
                    amount={amount}
                    className={cn("font-semibold tabular-nums", className)}
                />
            )}
        </span>
    );
}

function ActivityItem({ label, icon, value, valueClassName, pending }: ActivityItemProps) {
    return (
        <div className="flex h-5 shrink-0 items-center gap-1.5 text-sm" title={label}>
            <span className="inline-flex shrink-0 md:hidden" aria-label={label}>
                {icon}
            </span>
            <span className="hidden text-muted-foreground md:inline">{label}</span>
            <CountValue amount={value} className={valueClassName} pending={pending} />
        </div>
    );
}

export default function ClientCount() {
    const { t } = useTranslation();

    const { data, isLoading, isFetching, isError } = useApiQuery<ApiResponse<unknown>>({
        queryKey: ["client-activity"],
        url: "client-activity",
        pagination: false,
    });

    const activity = useMemo(() => {
        const parsed = ClientActivitySchema.safeParse(data?.data);
        return parsed.success ? parsed.data : null;
    }, [data?.data]);

    const pending = (isLoading || isFetching) && !activity;

    if (isError && !activity) return null;

    const counts = activity ?? DEFAULT_ACTIVITY;
    const offlineCount = Math.max(
        0,
        toNumber(counts.total) - (toNumber(counts.online) + toNumber(counts.disabled)),
    );

    return (
        <div
            data-testid="client-activity"
            className="flex min-h-5 flex-wrap items-center gap-x-4 gap-y-1"
        >
            <span className="inline-flex h-5 shrink-0 items-center gap-1 text-sm md:hidden">
                <span>{t("client.title_plural")}</span>
                <span className="inline-flex items-center font-semibold tabular-nums">
                    (<CountValue amount={toNumber(counts.total)} pending={pending} />)
                </span>
            </span>
            <ActivityItem
                label={t("client.activity.online")}
                icon={<Wifi className="h-4 w-4 theme-tone-success" />}
                value={counts.online}
                valueClassName="theme-tone-success"
                pending={pending}
            />
            <ActivityItem
                label={t("client.activity.offline")}
                icon={<WifiOff className="h-4 w-4 text-destructive" />}
                value={offlineCount}
                valueClassName="text-destructive"
                pending={pending}
            />
            <ActivityItem
                label={t("client.activity.disabled")}
                icon={<Ban className="h-4 w-4 text-muted-foreground" />}
                value={counts.disabled}
                valueClassName="text-muted-foreground"
                pending={pending}
            />
        </div>
    );
}
