"use client";

import Card from "@/components/card";
import DashboardCardSkeleton from "@/components/dashboard/dashboard-card-skeleton";
import { formatDashboardValue } from "@/components/dashboard/dashboard-constants";
import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";

type Props = {
  titleKey: string;
  totalValue: number;
  firstMetricKey: string;
  firstMetricValue: number;
  secondMetricKey: string;
  secondMetricValue: number;
  isLoading: boolean;
  isRefreshing: boolean;
  isError: boolean;
  filter?: ReactNode;
};

export default function DashboardSectionCard({
  titleKey,
  totalValue,
  firstMetricKey,
  firstMetricValue,
  secondMetricKey,
  secondMetricValue,
  isLoading,
  isRefreshing,
  isError,
  filter,
}: Props) {
  const { t } = useTranslation();

  return (
    <Card className="h-full p-4">
      {isLoading || isRefreshing ? (
        <DashboardCardSkeleton />
      ) : isError ? (
        <p className="text-sm text-destructive">{t("common.failed_to_load_data")}</p>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex justify-between w-full">
              <p className="text-sm text-muted-foreground">{t(titleKey)}</p>
              <p className="text-xl font-semibold">{formatDashboardValue(totalValue)}</p>
            </div>
          </div>

          {filter}

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between gap-2 text-green-600">
              <span>{t(firstMetricKey)}</span>
              <span className="font-medium">{formatDashboardValue(firstMetricValue)}</span>
            </div>
            <div className="flex items-center justify-between gap-2 text-red-500">
              <span>{t(secondMetricKey)}</span>
              <span className="font-medium">{formatDashboardValue(secondMetricValue)}</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
