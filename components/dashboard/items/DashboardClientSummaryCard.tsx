"use client";

import Card from "@/components/card";
import DisplayCount from "@/components/display-count";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import type { DashboardClientCount } from "@/components/dashboard/dashboard-type";
import { toNumber } from "@/lib/helper/helper";

type Props = {
  data: DashboardClientCount;
  isLoading: boolean;
  isRefreshing: boolean;
  isError: boolean;
};

const METRICS: Array<{ labelKey: string; key: keyof DashboardClientCount }> = [
  { labelKey: "dashboard.metrics.active", key: "active_clients" },
  { labelKey: "dashboard.metrics.inactive", key: "inactive_clients" },
  { labelKey: "dashboard.metrics.this_month", key: "new_clients_this_month" },
];

function ClientSummaryCardSkeleton() {
  return (
    <div className="flex h-full flex-col animate-in fade-in duration-300">
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-4 min-h-8">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-7 w-16" />
        </div>
      </div>
      <div className=" px-4 py-3 space-y-2">
        {METRICS.map(({ key }) => (
          <div key={key} className="flex items-center justify-between">
            <Skeleton className="h-3.5 w-16" />
            <Skeleton className="h-3.5 w-10" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardClientSummaryCard({ data, isLoading, isRefreshing, isError }: Props) {
  const { t } = useTranslation();

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-all hover:shadow-sm">
      {isLoading || isRefreshing ? (
        <ClientSummaryCardSkeleton />
      ) : isError ? (
        <div className="flex h-full items-center justify-center p-4">
          <p className="text-sm text-destructive">{t("common.failed_to_load_data")}</p>
        </div>
      ) : (
        <div className="flex h-full flex-col animate-in fade-in duration-300">
          <div className="flex flex-1 flex-col p-4">
            <div className="flex items-center justify-between gap-4 min-h-8">
              <p className="text-sm font-medium text-muted-foreground">
                {t("dashboard.cards.total_clients")}
              </p>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                <DisplayCount amount={data.total_clients} />
              </p>
            </div>
          </div>

          <div className=" px-4 py-3 space-y-1.5">
            {METRICS.map(({ labelKey, key }) => (
              <div key={key} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t(labelKey)}:</span>
                <span className="font-semibold text-foreground">
                  <DisplayCount amount={toNumber(data[key] as string) ?? 0} />
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
