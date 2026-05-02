import React from "react";
import Card from "@/components/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface DashboardMetricCardProps {
  title: React.ReactNode;
  value?: React.ReactNode;
  action?: React.ReactNode;
  isLoading?: boolean;
  isRefreshing?: boolean;
  isError?: boolean;
  children?: React.ReactNode;
  skeletonBody?: React.ReactNode;
}

export function DashboardMetricCard({
  title,
  value,
  action,
  isLoading,
  isRefreshing,
  isError,
  children,
  skeletonBody,
}: DashboardMetricCardProps) {
  const { t } = useTranslation();

  if (isLoading || isRefreshing) {
    return (
      <Card className="flex h-full flex-col overflow-hidden transition-all hover:shadow-sm">
        <div className="flex flex-1 flex-col p-4 animate-in fade-in duration-300">
          <div className={cn("flex items-center justify-between gap-3", skeletonBody && "pb-2")}>
            <Skeleton className="h-5 w-24" />
            <div className="flex items-center gap-2">
              {value !== undefined && <Skeleton className="h-7 w-20" />}
              {action && <Skeleton className="h-7 w-7" />}
            </div>
          </div>
          {skeletonBody && (
            <div className="mt-auto space-y-2 pt-3">
              {skeletonBody}
            </div>
          )}
        </div>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="flex h-full flex-col overflow-hidden transition-all hover:shadow-sm">
        <div className="flex h-full items-center justify-center p-4 min-h-[120px]">
          <p className="text-sm text-destructive">{t("common.failed_to_load_data")}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-all hover:shadow-sm">
      <div className="flex flex-1 flex-col p-4 animate-in fade-in duration-300">
        <div className={cn("flex items-center justify-between gap-3", children && "pb-2")}>
          <div className="text-xl font-bold text-foreground">{title}</div>
          <div className="flex items-center gap-2">
            {value !== undefined && (
              <div className="text-xl font-bold tracking-tight text-foreground">
                {value}
              </div>
            )}
            {action && <div>{action}</div>}
          </div>
        </div>
        {children && (
          <div className="mt-auto space-y-2 pt-3">
            {children}
          </div>
        )}
      </div>
    </Card>
  );
}

export function DashboardMetricRow({ label, value, className }: { label: React.ReactNode; value: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center justify-between text-xs", className)}>
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

export function DashboardMetricRowSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-3 w-12" />
    </div>
  );
}
