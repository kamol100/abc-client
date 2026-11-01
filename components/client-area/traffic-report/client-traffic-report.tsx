"use client";

import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { User } from "lucide-react";
import { useTranslation } from "react-i18next";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import Card from "@/components/card";
import MyButton from "@/components/my-button";
import { Skeleton } from "@/components/ui/skeleton";
import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";
import {
  formatTrafficAmount,
  formatUsageDate,
  formatUsageRecordedAt,
  usageRangeLength,
} from "@/components/client-area/traffic-report/traffic-report-format";
import type {
  TrafficReport,
  TrafficReportRow,
  UsageFigure,
} from "@/components/client-area/traffic-report/traffic-report-type";
import { cn } from "@/lib/utils";

const SUMMARY_CARDS = [
  {
    key: "this_week",
    labelKey: "traffic_report.this_week",
    className: "bg-chart-2 text-white",
  },
  {
    key: "this_month",
    labelKey: "traffic_report.this_month",
    className: "bg-destructive text-destructive-foreground",
  },
  {
    key: "last_month",
    labelKey: "traffic_report.last_month",
    className: "bg-chart-4 text-card-foreground",
  },
] as const;

function trafficReportFilterSchema(): FieldConfig[] {
  return [
    {
      type: "dateRange",
      name: "usage_date",
      placeholder: "traffic_report.date_range",
    },
  ];
}

function amountLabel(
  figure: UsageFigure | undefined,
  unavailable: string,
): string {
  if (!figure) return unavailable;
  return formatTrafficAmount(figure.total_bytes, figure.available) ?? unavailable;
}

function useTrafficColumns(language: string): ColumnDef<TrafficReportRow>[] {
  const { t } = useTranslation();

  return useMemo(
    () => [
      {
        accessorKey: "usage_date",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="common.date" />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm">
            {formatUsageRecordedAt(row.original.usage_date, language)}
          </span>
        ),
        enableHiding: false,
      },
      {
        accessorKey: "download_bytes",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="traffic_report.download" />
        ),
        cell: ({ row }) => (
          <span className="text-sm">{formatTrafficAmount(row.original.download_bytes, true)}</span>
        ),
      },
      {
        accessorKey: "upload_bytes",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="traffic_report.upload" />
        ),
        cell: ({ row }) => (
          <span className="text-sm">{formatTrafficAmount(row.original.upload_bytes, true)}</span>
        ),
      },
      {
        accessorKey: "total_bytes",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="traffic_report.total" />
        ),
        cell: ({ row }) => (
          <span className="text-sm font-medium">
            {formatTrafficAmount(row.original.total_bytes, true)}
          </span>
        ),
      },
    ],
    [language, t],
  );
}

function SummaryCards({
  report,
  isLoading,
}: {
  report: TrafficReport | undefined;
  isLoading: boolean;
}) {
  const { t } = useTranslation();
  const unavailable = t("traffic_report.unavailable");

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {SUMMARY_CARDS.map((card) => (
          <Skeleton key={card.key} className="h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {SUMMARY_CARDS.map((card) => {
        const figure = report?.summaries[card.key];
        return (
          <div
            key={card.key}
            className={cn("flex items-center gap-4 rounded-lg px-4 py-4", card.className)}
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-background/25">
              <User className="h-7 w-7" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide">
                {t(card.labelKey)}
              </p>
              <p className="text-2xl font-semibold tracking-tight">
                {amountLabel(figure, unavailable)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PeriodChart({
  report,
  isLoading,
  language,
}: {
  report: TrafficReport | undefined;
  isLoading: boolean;
  language: string;
}) {
  const { t } = useTranslation();

  const chart = useMemo(() => {
    const series = report?.series ?? [];
    const max = series.reduce(
      (highest, point) => Math.max(highest, point.download_bytes, point.upload_bytes),
      0,
    );
    return { series, max };
  }, [report?.series]);

  if (isLoading) {
    return <Skeleton className="h-64 rounded-lg" />;
  }

  if (!report) return null;

  const unavailable = t("traffic_report.unavailable");
  const period = report.period;
  const download = formatTrafficAmount(period.download_bytes, period.available) ?? unavailable;
  const upload = formatTrafficAmount(period.upload_bytes, period.available) ?? unavailable;
  const total = formatTrafficAmount(period.total_bytes, period.available) ?? unavailable;
  const rangeDays = usageRangeLength(period.from, period.to);
  const showGaps = period.available && chart.series.length > 0 && chart.series.length < rangeDays;
  const chartHeight = 140;
  const groupWidth = 36;
  const width = Math.max(chart.series.length * groupWidth, groupWidth);
  const labelStep = chart.series.length > 16 ? Math.ceil(chart.series.length / 12) : 1;

  const barHeight = (bytes: number) => {
    if (bytes <= 0 || chart.max <= 0) return 0;
    return Math.max((bytes / chart.max) * chartHeight, 1);
  };

  return (
    <Card className="space-y-4 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">{t("traffic_report.chart_title")}</h2>
          <p className="text-sm text-muted-foreground">
            {formatUsageDate(period.from, language)} – {formatUsageDate(period.to, language)}
          </p>
        </div>
        <dl className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <dt className="text-muted-foreground">{t("traffic_report.download")}</dt>
            <dd className="font-semibold">{download}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t("traffic_report.upload")}</dt>
            <dd className="font-semibold">{upload}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t("traffic_report.total")}</dt>
            <dd className="font-semibold">{total}</dd>
          </div>
        </dl>
      </div>

      {period.available && !period.complete ? (
        <p className="text-sm text-muted-foreground">{t("traffic_report.incomplete")}</p>
      ) : null}

      {!period.available ? (
        <p className="text-sm text-muted-foreground">{unavailable}</p>
      ) : chart.series.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("traffic_report.empty")}</p>
      ) : (
        <div className="space-y-3">
          <div className="overflow-x-auto">
            <svg
              viewBox={`0 0 ${width} ${chartHeight + 28}`}
              className="h-48 min-w-[640px]"
              role="img"
              aria-label={t("traffic_report.chart_title")}
            >
              {chart.series.map((point, index) => {
                const downloadHeight = barHeight(point.download_bytes);
                const uploadHeight = barHeight(point.upload_bytes);
                const x = index * groupWidth;
                const showLabel = index % labelStep === 0;
                return (
                  <g key={point.usage_date}>
                    <rect
                      x={x + 6}
                      y={chartHeight - downloadHeight}
                      width={10}
                      height={downloadHeight}
                      className="fill-chart-2"
                    >
                      <title>
                        {`${formatUsageDate(point.usage_date, language)} ${t("traffic_report.download")} ${formatTrafficAmount(point.download_bytes, true)}`}
                      </title>
                    </rect>
                    <rect
                      x={x + 18}
                      y={chartHeight - uploadHeight}
                      width={10}
                      height={uploadHeight}
                      className="fill-chart-5"
                    >
                      <title>
                        {`${formatUsageDate(point.usage_date, language)} ${t("traffic_report.upload")} ${formatTrafficAmount(point.upload_bytes, true)}`}
                      </title>
                    </rect>
                    {showLabel ? (
                      <text
                        x={x + groupWidth / 2}
                        y={chartHeight + 18}
                        textAnchor="middle"
                        className="fill-muted-foreground text-[9px]"
                      >
                        {point.usage_date.slice(8)}
                      </text>
                    ) : null}
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-chart-2" />
              {t("traffic_report.download")}
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-chart-5" />
              {t("traffic_report.upload")}
            </span>
          </div>
          {showGaps ? (
            <p className="text-xs text-muted-foreground">{t("traffic_report.omitted_days")}</p>
          ) : null}
        </div>
      )}
    </Card>
  );
}

export default function ClientTrafficReport() {
  const { t, i18n } = useTranslation();
  const columns = useTrafficColumns(i18n.language);
  const [filterValue, setFilter] = useState<string | null>(null);

  const params = useMemo(() => {
    if (!filterValue) return undefined;
    return Object.fromEntries(new URLSearchParams(filterValue)) as Record<string, string>;
  }, [filterValue]);

  const toolbarOptions = useMemo(
    () => ({ filter: trafficReportFilterSchema() }),
    [],
  );

  const { data, isLoading, isFetching, isError, refetch, setCurrentPage } =
    useApiQuery<ApiResponse<TrafficReport>>({
      queryKey: ["client-traffic-report"],
      url: "client-traffic-report",
      params,
    });

  const report = data?.data;
  const rows = report?.data ?? [];
  const pagination = report?.pagination;

  if (isError && !report) {
    return (
      <Card className="space-y-3 p-4">
        <p className="text-sm text-destructive" role="alert">
          {t("common.failed_to_load_data")}
        </p>
        <MyButton type="button" variant="outline" onClick={() => refetch()}>
          {t("traffic_report.retry")}
        </MyButton>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-foreground">{t("traffic_report.title")}</h1>
      <SummaryCards report={report} isLoading={isLoading} />
      <PeriodChart report={report} isLoading={isLoading} language={i18n.language} />
      <DataTable
        data={rows}
        columns={columns}
        toolbarOptions={toolbarOptions}
        toggleColumns
        pagination={pagination}
        setCurrentPage={setCurrentPage}
        isLoading={isLoading || isFetching}
        isFetching={isFetching}
        setFilter={setFilter}
        queryKey="client-traffic-report"
      />
    </div>
  );
}
