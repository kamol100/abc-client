"use client";

import Card from "@/components/card";
import { DataTable } from "@/components/data-table/data-table";
import DashboardCardSkeleton from "@/components/dashboard/dashboard-card-skeleton";
import DashboardChartSkeleton from "@/components/dashboard/dashboard-chart-skeleton";
import DashboardFilterSelect from "@/components/dashboard/dashboard-filter-select";
import { useDashboardZoneWiseTopInvoiceDueColumns } from "@/components/dashboard/dashboard-zone-wise-top-invoice-due-columns";
import DashboardZoneWiseTopInvoiceDueFilterSchema, {
  DASHBOARD_ZONE_WISE_TOP_DUE_INVOICE_DEFAULT_LIMIT,
} from "@/components/dashboard/dashboard-zone-wise-top-invoice-due-filter-schema";
import { useDashboardTopDueInvoiceColumns } from "@/components/dashboard/dashboard-top-due-invoice-columns";
import DashboardTopDueInvoiceFilterSchema, {
  DASHBOARD_TOP_DUE_INVOICE_DEFAULT_LIMIT,
} from "@/components/dashboard/dashboard-top-due-invoice-filter-schema";
import {
  DashboardClientCountSchema,
  DashboardDateFilter,
  DashboardGraphSchema,
  DashboardInvoiceReportSchema,
  DashboardResellerCountSchema,
  DashboardTopDueInvoice,
  DashboardTopDueInvoiceResponseSchema,
  DashboardZoneWiseTopInvoiceDueItem,
  DashboardZoneWiseTopInvoiceDueSchema,
} from "@/components/dashboard/dashboard-type";
import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { keepPreviousData } from "@tanstack/react-query";
import { formatMoney, toNumber } from "@/lib/helper/helper";
import { Loader2 } from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import DisplayCount from "../display-count";

const CLIENT_DATE_FILTER_OPTIONS: ReadonlyArray<{ value: DashboardDateFilter; labelKey: string }> = [
  { value: "all", labelKey: "dashboard.filters.date.all" },
  { value: "this_month", labelKey: "dashboard.filters.date.this_month" },
  { value: "last_month", labelKey: "dashboard.filters.date.last_month" },
  { value: "this_week", labelKey: "dashboard.filters.date.this_week" },
  { value: "last_week", labelKey: "dashboard.filters.date.last_week" },
  { value: "last_15_days", labelKey: "dashboard.filters.date.last_15_days" },
  { value: "today", labelKey: "dashboard.filters.date.today" },
  { value: "this_year", labelKey: "dashboard.filters.date.this_year" },
  { value: "last_year", labelKey: "dashboard.filters.date.last_year" },
];

const DATE_FILTER_OPTIONS: ReadonlyArray<{ value: DashboardDateFilter; labelKey: string }> = [
  { value: "this_month", labelKey: "dashboard.filters.date.this_month" },
  { value: "last_month", labelKey: "dashboard.filters.date.last_month" },
  { value: "this_week", labelKey: "dashboard.filters.date.this_week" },
  { value: "last_week", labelKey: "dashboard.filters.date.last_week" },
  { value: "last_15_days", labelKey: "dashboard.filters.date.last_15_days" },
  { value: "today", labelKey: "dashboard.filters.date.today" },
  { value: "this_year", labelKey: "dashboard.filters.date.this_year" },
  { value: "last_year", labelKey: "dashboard.filters.date.last_year" },
];

const CHART_COLORS = ["#2563eb", "#22c55e", "#f59e0b", "#d946ef", "#ef4444"] as const;

function formatValue(value: number): string {
  return formatMoney(value, 0);
}

type DashboardCardProps = {
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

function DashboardCard({
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
}: DashboardCardProps) {
  const { t } = useTranslation();

  return (
    <Card className="h-full p-4">
      {(isLoading || isRefreshing) ? (
        <DashboardCardSkeleton />
      ) : isError ? (
        <p className="text-sm text-destructive">{t("common.failed_to_load_data")}</p>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex justify-between w-full">
              <p className="text-sm text-muted-foreground">{t(titleKey)}</p>
              <p className="text-xl font-semibold">{formatValue(totalValue)}</p>
            </div>
          </div>

          {filter}

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between gap-2 text-green-600">
              <span>{t(firstMetricKey)}</span>
              <span className="font-medium">{formatValue(firstMetricValue)}</span>
            </div>
            <div className="flex items-center justify-between gap-2 text-red-500">
              <span>{t(secondMetricKey)}</span>
              <span className="font-medium">{formatValue(secondMetricValue)}</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

type TopDueInvoiceTableProps = {
  invoices: DashboardTopDueInvoice[];
  totalAmount: number;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  setFilter: (query: string) => void;
  toolbarOptions: { filter: FieldConfig[] };
  toolbarTitle: string;
};

function TopDueInvoiceTable({
  invoices,
  totalAmount,
  isLoading,
  isFetching,
  isError,
  setFilter,
  toolbarOptions,
  toolbarTitle,
}: TopDueInvoiceTableProps) {
  const { t } = useTranslation();
  const columns = useDashboardTopDueInvoiceColumns();

  return (
    <Card className="p-4 md:p-5">
      {isError ? (
        <p className="text-sm text-destructive">{t("common.failed_to_load_data")}</p>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">{t("dashboard.top_due_invoice.total_amount")}</p>
            <p className="text-sm font-semibold">
              <DisplayCount amount={toNumber(totalAmount)} animate formatCurrency />
            </p>
          </div>
          <DataTable
            data={isLoading ? [] : invoices}
            columns={columns}
            setFilter={setFilter}
            toolbarOptions={toolbarOptions}
            toggleColumns={true}
            isLoading={isLoading}
            isFetching={isFetching}
            queryKey="dashboard-top-due-invoices"
            toolbarTitle={toolbarTitle}
          />
        </div>
      )}
    </Card>
  );
}

type ZoneWiseTopInvoiceDueTableProps = {
  dueItems: DashboardZoneWiseTopInvoiceDueItem[];
  totalAmount: number;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  setFilter: (query: string) => void;
  toolbarOptions: { filter: FieldConfig[] };
  toolbarTitle: string;
};

function ZoneWiseTopInvoiceDueTable({
  dueItems,
  totalAmount,
  isLoading,
  isFetching,
  isError,
  setFilter,
  toolbarOptions,
  toolbarTitle,
}: ZoneWiseTopInvoiceDueTableProps) {
  const { t } = useTranslation();
  const columns = useDashboardZoneWiseTopInvoiceDueColumns();

  return (
    <Card className="p-4 md:p-5">
      {isError ? (
        <p className="text-sm text-destructive">{t("common.failed_to_load_data")}</p>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {t("dashboard.zone_wise_top_invoice_due.total_amount")}
            </p>
            <p className="text-sm font-semibold">
              <DisplayCount amount={toNumber(totalAmount)} animate formatCurrency />
            </p>
          </div>
          <DataTable
            data={isLoading ? [] : dueItems}
            columns={columns}
            setFilter={setFilter}
            toolbarOptions={toolbarOptions}
            toggleColumns={true}
            isLoading={isLoading}
            isFetching={isFetching}
            queryKey="dashboard-zone-wise-top-invoice-due"
            toolbarTitle={toolbarTitle}
          />
        </div>
      )}
    </Card>
  );
}

export default function DashboardOverview() {
  const { t } = useTranslation();
  const [clientDateFilter, setClientDateFilter] = useState<DashboardDateFilter>("all");
  const [newClientDateFilter, setNewClientDateFilter] = useState<DashboardDateFilter>("this_month");
  const [invoiceDateFilter, setInvoiceDateFilter] = useState<DashboardDateFilter>("this_month");
  const [yearFilter, setYearFilter] = useState(() => String(new Date().getFullYear()));
  const [topDueInvoiceFilter, setTopDueInvoiceFilter] = useState<string | null>(null);
  const [zoneWiseTopDueInvoiceFilter, setZoneWiseTopDueInvoiceFilter] = useState<string | null>(
    null,
  );

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, index) => {
      const value = String(currentYear - index);
      return { value, label: value };
    });
  }, []);

  const clientParams = useMemo(() => ({ date_filter: clientDateFilter }), [clientDateFilter]);
  const newClientParams = useMemo(
    () => ({ date_filter: newClientDateFilter }),
    [newClientDateFilter],
  );
  const invoiceParams = useMemo(() => ({ date_filter: invoiceDateFilter }), [invoiceDateFilter]);
  const chartParams = useMemo(() => ({ year_filter: yearFilter }), [yearFilter]);
  const topDueInvoiceToolbarOptions = useMemo(
    () => ({ filter: DashboardTopDueInvoiceFilterSchema() }),
    [],
  );
  const zoneWiseTopDueInvoiceToolbarOptions = useMemo(
    () => ({ filter: DashboardZoneWiseTopInvoiceDueFilterSchema() }),
    [],
  );
  const topDueInvoiceParams = useMemo(() => {
    const defaultLimit = DASHBOARD_TOP_DUE_INVOICE_DEFAULT_LIMIT;
    if (!topDueInvoiceFilter) {
      return { limit: defaultLimit };
    }
    const parsed = Object.fromEntries(new URLSearchParams(topDueInvoiceFilter)) as Record<
      string,
      string
    >;
    const limitRaw = parsed.limit;
    const limit =
      limitRaw && !Number.isNaN(Number(limitRaw)) ? Number(limitRaw) : defaultLimit;
    const next: Record<string, unknown> = { limit };
    if (parsed.zone_id) {
      next.zone_id = parsed.zone_id;
    }
    return next;
  }, [topDueInvoiceFilter]);
  const zoneWiseTopDueInvoiceParams = useMemo(() => {
    const defaultLimit = DASHBOARD_ZONE_WISE_TOP_DUE_INVOICE_DEFAULT_LIMIT;
    if (!zoneWiseTopDueInvoiceFilter) {
      return { limit: defaultLimit };
    }
    const parsed = Object.fromEntries(new URLSearchParams(zoneWiseTopDueInvoiceFilter)) as Record<
      string,
      string
    >;
    const limitRaw = parsed.limit;
    const limit =
      limitRaw && !Number.isNaN(Number(limitRaw)) ? Number(limitRaw) : defaultLimit;
    return { limit };
  }, [zoneWiseTopDueInvoiceFilter]);

  const {
    data: clientResponse,
    isLoading: isClientLoading,
    isFetching: isClientFetching,
    isError: isClientError,
  } = useApiQuery<ApiResponse<unknown>>({
    queryKey: ["dashboard-client-count", clientDateFilter],
    url: "dashboard-client-count",
    params: clientParams,
    pagination: false,
  });

  const {
    data: newClientResponse,
    isLoading: isNewClientLoading,
    isFetching: isNewClientFetching,
    isError: isNewClientError,
  } = useApiQuery<ApiResponse<unknown>>({
    queryKey: ["dashboard-new-client-count", newClientDateFilter],
    url: "dashboard-new-client-count",
    params: newClientParams,
    pagination: false,
  });

  const {
    data: resellerResponse,
    isLoading: isResellerLoading,
    isFetching: isResellerFetching,
    isError: isResellerError,
  } = useApiQuery<ApiResponse<unknown>>({
    queryKey: ["dashboard-reseller-count"],
    url: "dashboard-reseller-count",
    pagination: false,
  });

  const {
    data: invoiceResponse,
    isLoading: isInvoiceLoading,
    isFetching: isInvoiceFetching,
    isError: isInvoiceError,
  } = useApiQuery<ApiResponse<unknown>>({
    queryKey: ["dashboard-invoice-report", invoiceDateFilter],
    url: "dashboard-invoice-report",
    params: invoiceParams,
    pagination: false,
  });

  const {
    data: graphResponse,
    isLoading: isGraphLoading,
    isFetching: isGraphFetching,
    isError: isGraphError,
  } = useApiQuery<ApiResponse<unknown>>({
    queryKey: ["dashboard-graph-chart", yearFilter],
    url: "dashboard-graph-chart",
    params: chartParams,
    pagination: false,
  });

  const {
    data: topDueInvoiceResponse,
    isLoading: isTopDueInvoiceLoading,
    isFetching: isTopDueInvoiceFetching,
    isError: isTopDueInvoiceError,
  } = useApiQuery<ApiResponse<unknown>>({
    queryKey: ["dashboard-top-due-invoices", topDueInvoiceFilter ?? ""],
    url: "dashboard-top-due-invoices",
    params: topDueInvoiceParams,
    pagination: false,
    placeholderData: keepPreviousData,
  });
  const {
    data: zoneWiseTopDueInvoiceResponse,
    isLoading: isZoneWiseTopDueInvoiceLoading,
    isFetching: isZoneWiseTopDueInvoiceFetching,
    isError: isZoneWiseTopDueInvoiceError,
  } = useApiQuery<ApiResponse<unknown>>({
    queryKey: ["dashboard-zone-wise-top-invoice-due", zoneWiseTopDueInvoiceFilter ?? ""],
    url: "dashboard-zone-wise-top-invoice-due",
    params: zoneWiseTopDueInvoiceParams,
    pagination: false,
    placeholderData: keepPreviousData,
  });

  const clientCount = useMemo(() => {
    const parsed = DashboardClientCountSchema.safeParse(clientResponse?.data);
    if (parsed.success) return parsed.data;
    return {
      total_clients: 0,
      active_clients: 0,
      inactive_clients: 0,
      new_clients_this_month: 0,
      new_clients: 0,
    };
  }, [clientResponse?.data]);

  const newClientCount = useMemo(() => {
    const parsed = DashboardClientCountSchema.safeParse(newClientResponse?.data);
    if (parsed.success) return parsed.data;
    return {
      total_clients: 0,
      active_clients: 0,
      inactive_clients: 0,
      new_clients_this_month: 0,
      new_clients: 0,
    };
  }, [newClientResponse?.data]);

  const resellerCount = useMemo(() => {
    const parsed = DashboardResellerCountSchema.safeParse(resellerResponse?.data);
    if (parsed.success) return parsed.data;
    return {
      total_clients: 0,
      active_clients: 0,
      inactive_clients: 0,
    };
  }, [resellerResponse?.data]);

  const invoiceReport = useMemo(() => {
    const parsed = DashboardInvoiceReportSchema.safeParse(invoiceResponse?.data);
    if (parsed.success) return parsed.data;
    return {
      month: null,
      total_invoice: 0,
      total_discount: 0,
      total_after_discount: 0,
      total_amount_paid: 0,
      total_amount_due: 0,
      total_partial_paid: 0,
    };
  }, [invoiceResponse?.data]);

  const graph = useMemo(() => {
    const parsed = DashboardGraphSchema.safeParse(graphResponse?.data);
    if (parsed.success) return parsed.data;
    return {
      months: [],
      series: [],
    };
  }, [graphResponse?.data]);

  const topDueInvoiceData = useMemo(() => {
    const parsed = DashboardTopDueInvoiceResponseSchema.safeParse(topDueInvoiceResponse?.data);
    if (parsed.success) return parsed.data;
    return {
      total_amount: 0,
      top_due_invoices: [],
    };
  }, [topDueInvoiceResponse?.data]);
  const topDueInvoices = topDueInvoiceData.top_due_invoices;
  const zoneWiseTopDueInvoice = useMemo(() => {
    const parsed = DashboardZoneWiseTopInvoiceDueSchema.safeParse(zoneWiseTopDueInvoiceResponse?.data);
    if (parsed.success) return parsed.data;
    return {
      total_amount: 0,
      zone_wise_due: [],
    };
  }, [zoneWiseTopDueInvoiceResponse?.data]);

  const topDueInvoiceToolbarTitle = useMemo(() => {
    const title = t("dashboard.top_due_invoice.title");
    if (!isTopDueInvoiceLoading && topDueInvoices.length > 0) {
      return `${title} (${topDueInvoices.length})`;
    }
    return title;
  }, [t, isTopDueInvoiceLoading, topDueInvoices.length]);
  const zoneWiseTopDueInvoiceToolbarTitle = useMemo(() => {
    const title = t("dashboard.zone_wise_top_invoice_due.title");
    const itemCount = !isZoneWiseTopDueInvoiceLoading ? ` (${zoneWiseTopDueInvoice.zone_wise_due.length})` : "";

    return `${title}${itemCount}`;
  }, [t, isZoneWiseTopDueInvoiceLoading, zoneWiseTopDueInvoice.zone_wise_due.length]);

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

  const newClientsTotal = newClientCount.new_clients || newClientCount.new_clients_this_month || 0;
  const hasGraphData = graph.months.length > 0 && chartSeries.length > 0;

  return (
    <div className="space-y-4 pr-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          titleKey="dashboard.cards.total_clients"
          totalValue={clientCount.total_clients}
          firstMetricKey="dashboard.metrics.active"
          firstMetricValue={clientCount.active_clients}
          secondMetricKey="dashboard.metrics.inactive"
          secondMetricValue={clientCount.inactive_clients}
          isLoading={isClientLoading}
          isRefreshing={isClientFetching}
          isError={isClientError}
          filter={
            <DashboardFilterSelect
              value={clientDateFilter}
              options={CLIENT_DATE_FILTER_OPTIONS}
              onValueChange={(value) => setClientDateFilter(value as DashboardDateFilter)}
              placeholderKey="dashboard.filters.date.label"
            />
          }
        />

        <DashboardCard
          titleKey="dashboard.cards.new_clients"
          totalValue={newClientsTotal}
          firstMetricKey="dashboard.metrics.active"
          firstMetricValue={newClientCount.active_clients}
          secondMetricKey="dashboard.metrics.inactive"
          secondMetricValue={newClientCount.inactive_clients}
          isLoading={isNewClientLoading}
          isRefreshing={isNewClientFetching}
          isError={isNewClientError}
          filter={
            <DashboardFilterSelect
              value={newClientDateFilter}
              options={DATE_FILTER_OPTIONS}
              onValueChange={(value) => setNewClientDateFilter(value as DashboardDateFilter)}
              placeholderKey="dashboard.filters.date.label"
            />
          }
        />

        <DashboardCard
          titleKey="dashboard.cards.total_resellers"
          totalValue={resellerCount.total_clients}
          firstMetricKey="dashboard.metrics.active"
          firstMetricValue={resellerCount.active_clients}
          secondMetricKey="dashboard.metrics.inactive"
          secondMetricValue={resellerCount.inactive_clients}
          isLoading={isResellerLoading}
          isRefreshing={isResellerFetching}
          isError={isResellerError}
        />

        <DashboardCard
          titleKey="dashboard.cards.total_invoice"
          totalValue={invoiceReport.total_after_discount}
          firstMetricKey="dashboard.metrics.paid"
          firstMetricValue={invoiceReport.total_amount_paid}
          secondMetricKey="dashboard.metrics.due"
          secondMetricValue={invoiceReport.total_amount_due}
          isLoading={isInvoiceLoading}
          isRefreshing={isInvoiceFetching}
          isError={isInvoiceError}
          filter={
            <DashboardFilterSelect
              value={invoiceDateFilter}
              options={DATE_FILTER_OPTIONS}
              onValueChange={(value) => setInvoiceDateFilter(value as DashboardDateFilter)}
              placeholderKey="dashboard.filters.date.label"
            />
          }
        />
      </div>
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <TopDueInvoiceTable
          invoices={topDueInvoices}
          totalAmount={topDueInvoiceData.total_amount}
          isLoading={isTopDueInvoiceLoading}
          isFetching={isTopDueInvoiceFetching}
          isError={isTopDueInvoiceError}
          setFilter={(query) => setTopDueInvoiceFilter(query === "" ? null : query)}
          toolbarOptions={topDueInvoiceToolbarOptions}
          toolbarTitle={topDueInvoiceToolbarTitle}
        />
        <ZoneWiseTopInvoiceDueTable
          dueItems={zoneWiseTopDueInvoice.zone_wise_due}
          totalAmount={zoneWiseTopDueInvoice.total_amount}
          isLoading={isZoneWiseTopDueInvoiceLoading}
          isFetching={isZoneWiseTopDueInvoiceFetching}
          isError={isZoneWiseTopDueInvoiceError}
          setFilter={(query) => setZoneWiseTopDueInvoiceFilter(query === "" ? null : query)}
          toolbarOptions={zoneWiseTopDueInvoiceToolbarOptions}
          toolbarTitle={zoneWiseTopDueInvoiceToolbarTitle}
        />
      </div>

      <Card className="p-4 md:p-5">
        {isGraphLoading ? (
          <DashboardChartSkeleton />
        ) : isGraphError ? (
          <p className="text-sm text-destructive">{t("common.failed_to_load_data")}</p>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold">{t("dashboard.graph.title")}</h2>
                {isGraphFetching && (
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

            {hasGraphData ? (
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
                                title={`${series.name}: ${formatValue(value)}`}
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
    </div>
  );
}
