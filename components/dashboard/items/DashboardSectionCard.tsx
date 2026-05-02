"use client";

import Card from "@/components/card";
import DashboardCardSkeleton from "@/components/dashboard/dashboard-card-skeleton";
import DisplayCount from "@/components/display-count";
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
  formatCurrency?: boolean;
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
  formatCurrency = false,
}: Props) {
  const { t } = useTranslation();

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-all hover:shadow-sm">
      {isLoading || isRefreshing ? (
        <DashboardCardSkeleton />
      ) : isError ? (
        <div className="flex h-full items-center justify-center p-4">
          <p className="text-sm text-destructive">{t("common.failed_to_load_data")}</p>
        </div>
      ) : (
        <div className="flex h-full flex-col animate-in fade-in duration-300">
          <div className="flex flex-1 flex-col p-4">
            <div className="flex items-start justify-between gap-4 min-h-8">
              <p className="text-xl font-bold text-foreground">{t(titleKey)}</p>
              {filter && <div className="-mt-1 -mr-1">{filter}</div>}
            </div>

            <div className="flex flex-1 items-center pt-2">
              <p className="text-xl font-bold tracking-tight text-foreground">
                <DisplayCount amount={totalValue} formatCurrency={formatCurrency} />
              </p>
            </div>
          </div>

          <div className="border-t bg-muted/40 px-4 py-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">{t(firstMetricKey)}:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-500">
                  <DisplayCount amount={firstMetricValue} formatCurrency={formatCurrency} />
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">{t(secondMetricKey)}:</span>
                <span className="font-semibold text-rose-600 dark:text-rose-500">
                  <DisplayCount amount={secondMetricValue} formatCurrency={formatCurrency} />
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
