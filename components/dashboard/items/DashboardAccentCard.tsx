"use client";

import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import Card from "@/components/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardCardAccent, DashboardCardTone } from "@/components/dashboard/dashboard-constants";
import { cn } from "@/lib/utils";

const TONE_CLASS: Record<DashboardCardTone, string> = {
  1: "dashboard-tone-1",
  2: "dashboard-tone-2",
  3: "dashboard-tone-3",
  4: "dashboard-tone-4",
  5: "dashboard-tone-5",
};

/**
 * A dashboard summary card. Its color border (off, top edge, full outline) and its
 * color come from the active theme (cardBorder, cardColors in globals.css), so the
 * card itself only names its tone.
 */
export function DashboardAccentCard({
  accent,
  className,
  children,
}: {
  accent: DashboardCardAccent;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Card
      data-dashboard-card=""
      className={cn(
        "dashboard-accent-card flex h-full flex-col overflow-hidden transition-all hover:shadow-sm",
        TONE_CLASS[accent.tone],
        className,
      )}
    >
      {children}
    </Card>
  );
}

/** The card's fixed icon, tinted with the card's theme color. */
export function DashboardCardIcon({ accent, compact = false }: { accent: DashboardCardAccent; compact?: boolean }) {
  const Icon = accent.icon;
  return (
    <span className={cn("dashboard-card-icon", compact && "dashboard-card-icon-sm")} aria-hidden="true">
      <Icon className={compact ? "size-3.5" : "h-5 w-5"} />
    </span>
  );
}

/**
 * The dashboard summary card layout: icon tile, small label over the big value, then
 * the detail rows under a dashed line. The loading state keeps every line at its
 * loaded height, so nothing moves when the data arrives.
 */
export function DashboardStatCard({
  accent,
  label,
  value,
  valueTitle,
  isLoading,
  isError,
  skeletonRows = 0,
  compact = false,
  className,
  children,
}: {
  accent: DashboardCardAccent;
  label: ReactNode;
  value: ReactNode;
  /** Full text for a value that can be cut off (a name). */
  valueTitle?: string;
  isLoading: boolean;
  isError: boolean;
  /** Detail rows to hold space for while loading. */
  skeletonRows?: number;
  /** Smaller type and spacing, for the theme builder preview. */
  compact?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  const { t } = useTranslation();

  if (isError) {
    return (
      <DashboardAccentCard accent={accent} className={className}>
        <div className="flex h-full min-h-[120px] items-center justify-center p-4">
          <p className="text-sm text-destructive">{t("common.failed_to_load_data")}</p>
        </div>
      </DashboardAccentCard>
    );
  }

  return (
    <DashboardAccentCard accent={accent} className={className}>
      <div
        className={cn(
          "flex h-full flex-col",
          compact ? "gap-2 p-2.5" : "gap-3 p-4",
          !isLoading && "animate-in fade-in duration-300",
        )}
      >
        <div className={cn("flex min-w-0 items-center", compact ? "gap-2" : "gap-3")}>
          <DashboardCardIcon accent={accent} compact={compact} />
          {isLoading ? (
            <div className="grid min-w-0 flex-1">
              <span className="flex h-5 items-center">
                <Skeleton className="h-3.5 w-24" />
              </span>
              <span className="flex h-7 items-center">
                <Skeleton className="h-5 w-20" />
              </span>
            </div>
          ) : (
            <div className="grid min-w-0">
              <p className={cn("truncate text-muted-foreground", compact ? "text-[0.7rem]" : "text-sm")}>{label}</p>
              <p
                className={cn(
                  "truncate font-bold tracking-tight tabular-nums text-foreground",
                  compact ? "text-base leading-6" : "text-xl",
                )}
                title={valueTitle}
              >
                {value}
              </p>
            </div>
          )}
        </div>
        {isLoading
          ? skeletonRows > 0 && (
              <div className="mt-auto grid gap-1 border-t border-dashed pt-2.5">
                {Array.from({ length: skeletonRows }, (_, index) => (
                  <div key={index} className="flex h-4 items-center justify-between">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                ))}
              </div>
            )
          : children && (
              <div className={cn("mt-auto grid border-t border-dashed", compact ? "gap-0.5 pt-1.5" : "gap-1 pt-2.5")}>
                {children}
              </div>
            )}
      </div>
    </DashboardAccentCard>
  );
}

/** One detail row: label on the left, value on the right. */
export function DashboardStatRow({ label, value, className }: { label: ReactNode; value: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center justify-between gap-3 text-xs", className)}>
      <span className="min-w-0 truncate text-muted-foreground">{label}</span>
      <span className="shrink-0 font-medium tabular-nums text-foreground">{value}</span>
    </div>
  );
}
