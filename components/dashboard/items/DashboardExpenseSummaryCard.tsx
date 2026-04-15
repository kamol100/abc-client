"use client";

import Card from "@/components/card";
import DisplayCount from "@/components/display-count";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import type { DashboardExpenseSummary } from "@/components/dashboard/dashboard-type";
import { toNumber } from "@/lib/helper/helper";

type Props = {
  data: DashboardExpenseSummary;
  isLoading: boolean;
  isRefreshing: boolean;
  isError: boolean;
};

const METRICS: Array<{ labelKey: string; key: keyof DashboardExpenseSummary }> = [
  { labelKey: "dashboard.metrics.today", key: "today_expense_amount" },
  { labelKey: "dashboard.metrics.this_month", key: "this_month_expense_amount" },
  { labelKey: "dashboard.metrics.last_month", key: "last_month_expense_amount" },
];

function ExpenseSummaryCardSkeleton() {
  return (
    <div className="flex h-full flex-col animate-in fade-in duration-300">
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-4 min-h-8">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-7 w-16" />
        </div>
      </div>
      <div className="px-4 py-3 space-y-2">
        {METRICS.map(({ key }) => (
          <div key={key} className="flex items-center justify-between">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-3.5 w-10" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardExpenseSummaryCard({ data, isLoading, isRefreshing, isError }: Props) {
  const { t } = useTranslation();

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-all hover:shadow-sm">
      {isLoading || isRefreshing ? (
        <ExpenseSummaryCardSkeleton />
      ) : isError ? (
        <div className="flex h-full items-center justify-center p-4">
          <p className="text-sm text-destructive">{t("common.failed_to_load_data")}</p>
        </div>
      ) : (
        <div className="flex h-full flex-col animate-in fade-in duration-300">
          <div className="flex flex-1 flex-col p-4">
            <div className="flex items-center justify-between gap-4 min-h-8">
              <p className="text-xl font-bold text-primary">
                {t("dashboard.cards.expense")}
              </p>
              <p className="text-xl font-bold tracking-tight text-foreground">
                <DisplayCount amount={data.total_expense_amount} abbreviate translation={false} />
              </p>
            </div>
          </div>

          <div className="px-4 py-3 space-y-1.5">
            {METRICS.map(({ labelKey, key }) => (
              <div key={key} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t(labelKey)}:</span>
                <span className="font-semibold text-foreground">
                  <DisplayCount amount={toNumber(data[key] as string) ?? 0} abbreviate translation={false} />
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
