"use client";

import Card from "@/components/card";
import DashboardChartSkeleton from "@/components/dashboard/dashboard-chart-skeleton";
import {
  CHART_COLORS,
  formatDashboardValue,
} from "@/components/dashboard/dashboard-constants";
import type { DashboardGraph } from "@/components/dashboard/dashboard-type";
import DashboardFilterSelect from "@/components/dashboard/dashboard-filter-select";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

type Props = {
  graph: DashboardGraph;
  yearFilter: string;
  setYearFilter: (year: string) => void;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
};

export default function DashboardRevenueChart({
  graph,
  yearFilter,
  setYearFilter,
  isLoading,
  isFetching,
  isError,
}: Props) {
  const { t } = useTranslation();

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => {
      const value = String(currentYear - i);
      return { value, label: value };
    });
  }, []);

  const chartSeries = useMemo(
    () =>
      graph.series.map((item, index) => ({
        ...item,
        color: item.color ?? CHART_COLORS[index % CHART_COLORS.length],
        data: graph.months.map((_, monthIndex) => Number(item.data[monthIndex] ?? 0)),
      })),
    [graph.months, graph.series],
  );

  const chartMaxValue = useMemo(() => {
    const values = chartSeries.flatMap((item) => item.data);
    return Math.max(1, ...values, 0);
  }, [chartSeries]);

  const hasData = graph.months.length > 0 && chartSeries.length > 0;

  return (
    <Card className="p-4 md:p-5">
      {isLoading ? (
        <DashboardChartSkeleton />
      ) : isError ? (
        <p className="text-sm text-destructive">{t("common.failed_to_load_data")}</p>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold">{t("dashboard.graph.title")}</h2>
              {isFetching && (
                <Loader2
                  className="h-4 w-4 animate-spin text-muted-foreground"
                  aria-label={t("common.loading")}
                />
              )}
            </div>
            <DashboardFilterSelect
              value={yearFilter}
              options={yearOptions}
              onValueChange={setYearFilter}
              placeholderKey="dashboard.filters.year.label"
              className="w-full md:w-44"
            />
          </div>

          {hasData ? (
            <div className="overflow-x-auto pb-1">
              <div className="min-w-[680px] space-y-2">
                <div className="flex h-72 items-end gap-3 rounded-md border bg-muted/10 p-3">
                  {graph.months.map((month, monthIndex) => (
                    <div
                      key={`${month}-${monthIndex}`}
                      className="flex h-full min-w-[48px] flex-1 flex-col items-center gap-2"
                    >
                      <div className="flex h-full w-full items-end justify-center gap-1">
                        {chartSeries.map((series) => {
                          const value = Number(series.data[monthIndex] ?? 0);
                          const barHeight =
                            value <= 0 ? 0 : Math.max((value / chartMaxValue) * 100, 3);
                          return (
                            <div
                              key={`${series.name}-${month}-${monthIndex}`}
                              className="w-full max-w-4 rounded-sm transition-all"
                              style={{
                                backgroundColor: series.color ?? CHART_COLORS[0],
                                height: `${barHeight}%`,
                              }}
                              title={`${series.name}: ${formatDashboardValue(value)}`}
                            />
                          );
                        })}
                      </div>
                      <span className="w-full truncate text-center text-xs text-muted-foreground">
                        {month}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  {chartSeries.map((series) => (
                    <div key={series.name} className="flex items-center gap-2 text-sm">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: series.color ?? CHART_COLORS[0] }}
                      />
                      <span>{series.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t("dashboard.graph.empty")}</p>
          )}
        </div>
      )}
    </Card>
  );
}
