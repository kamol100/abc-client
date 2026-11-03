"use client";

import Card from "@/components/card";
import { formatDashboardValue } from "@/components/dashboard/dashboard-constants";
import type { DashboardStaffInvoiceCollection } from "@/components/dashboard/dashboard-type";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

type Props = {
  staffName: string;
  data: DashboardStaffInvoiceCollection;
  isLoading: boolean;
  isRefreshing: boolean;
  isError: boolean;
};

const METRICS: Array<{ labelKey: string; key: "today_amount" | "this_month_amount" | "last_month_amount" }> = [
  { labelKey: "dashboard.metrics.today", key: "today_amount" },
  { labelKey: "dashboard.metrics.this_month", key: "this_month_amount" },
  { labelKey: "dashboard.metrics.last_month", key: "last_month_amount" },
];

function StaffInvoiceCollectionSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col p-4">
        <Skeleton className="h-5 w-40" />
      </div>
      <div className="space-y-2 px-4 py-3">
        {METRICS.map(({ key }) => (
          <div key={key} className="flex items-center justify-between">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-3.5 w-14" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardStaffInvoiceCollectionCard({
  staffName,
  data,
  isLoading,
  isRefreshing,
  isError,
}: Props) {
  const { t } = useTranslation();
  const heading = t("dashboard.cards.invoice_collection_by");

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-all hover:shadow-sm">
      {isLoading || isRefreshing ? (
        <StaffInvoiceCollectionSkeleton />
      ) : isError ? (
        <div className="flex h-full items-center justify-center p-4">
          <p className="text-sm text-destructive">{t("common.failed_to_load_data")}</p>
        </div>
      ) : (
        <div className="flex h-full min-w-0 flex-col animate-in fade-in duration-300">
          <div className="flex flex-1 flex-col p-4">
            <div className="flex min-h-8 min-w-0 items-center gap-1">
              <span className="shrink-0 text-sm font-semibold text-foreground">{heading}</span>
              <span className="min-w-0 truncate text-sm font-semibold text-foreground" title={staffName}>
                {staffName}
              </span>
            </div>
          </div>
          <div className="space-y-1.5 px-4 py-3">
            {METRICS.map(({ labelKey, key }) => (
              <div key={key} className="flex items-center justify-between gap-3 text-xs">
                <span className="text-muted-foreground">{t(labelKey)}:</span>
                <span className="font-semibold tabular-nums text-foreground">
                  {formatDashboardValue(data[key])}/-
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
