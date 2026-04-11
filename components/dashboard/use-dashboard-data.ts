import useApiQuery, { type ApiResponse } from "@/hooks/use-api-query";
import { keepPreviousData } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import DashboardTopDueInvoiceFilterSchema, {
  DASHBOARD_TOP_DUE_INVOICE_DEFAULT_LIMIT,
} from "./dashboard-top-due-invoice-filter-schema";
import DashboardZoneWiseTopInvoiceDueFilterSchema, {
  DASHBOARD_ZONE_WISE_TOP_DUE_INVOICE_DEFAULT_LIMIT,
} from "./dashboard-zone-wise-top-invoice-due-filter-schema";
import {
  DashboardClientCountSchema,
  type DashboardDateFilter,
  DashboardGraphSchema,
  DashboardInvoiceReportSchema,
  DashboardResellerCountSchema,
  DashboardTopDueInvoiceResponseSchema,
  DashboardZoneWiseTopInvoiceDueSchema,
} from "./dashboard-type";

function parseFilterParams(raw: string | null, defaultLimit: number): Record<string, unknown> {
  if (!raw) return { limit: defaultLimit };
  const parsed = Object.fromEntries(new URLSearchParams(raw)) as Record<string, string>;
  const limit =
    parsed.limit && !Number.isNaN(Number(parsed.limit)) ? Number(parsed.limit) : defaultLimit;
  return { limit };
}

export function useDashboardData() {
  const [clientDateFilter, setClientDateFilter] = useState<DashboardDateFilter>("all");
  const [newClientDateFilter, setNewClientDateFilter] = useState<DashboardDateFilter>("this_month");
  const [invoiceDateFilter, setInvoiceDateFilter] = useState<DashboardDateFilter>("this_month");
  const [yearFilter, setYearFilter] = useState(() => String(new Date().getFullYear()));
  const [topDueInvoiceFilter, setTopDueInvoiceFilter] = useState<string | null>(null);
  const [zoneWiseTopDueInvoiceFilter, setZoneWiseTopDueInvoiceFilter] = useState<string | null>(null);

  const handleTopDueInvoiceFilter = useCallback(
    (query: string) => setTopDueInvoiceFilter(query === "" ? null : query),
    [],
  );
  const handleZoneWiseDueFilter = useCallback(
    (query: string) => setZoneWiseTopDueInvoiceFilter(query === "" ? null : query),
    [],
  );

  const clientParams = useMemo(() => ({ date_filter: clientDateFilter }), [clientDateFilter]);
  const newClientParams = useMemo(
    () => ({ date_filter: newClientDateFilter }),
    [newClientDateFilter],
  );
  const invoiceParams = useMemo(() => ({ date_filter: invoiceDateFilter }), [invoiceDateFilter]);
  const chartParams = useMemo(() => ({ year_filter: yearFilter }), [yearFilter]);

  const topDueInvoiceParams = useMemo(() => {
    const base = parseFilterParams(topDueInvoiceFilter, DASHBOARD_TOP_DUE_INVOICE_DEFAULT_LIMIT);
    if (topDueInvoiceFilter) {
      const parsed = Object.fromEntries(new URLSearchParams(topDueInvoiceFilter)) as Record<string, string>;
      if (parsed.zone_id) base.zone_id = parsed.zone_id;
    }
    return base;
  }, [topDueInvoiceFilter]);

  const zoneWiseTopDueInvoiceParams = useMemo(
    () => parseFilterParams(zoneWiseTopDueInvoiceFilter, DASHBOARD_ZONE_WISE_TOP_DUE_INVOICE_DEFAULT_LIMIT),
    [zoneWiseTopDueInvoiceFilter],
  );

  const topDueInvoiceToolbarOptions = useMemo(
    () => ({ filter: DashboardTopDueInvoiceFilterSchema() }),
    [],
  );
  const zoneWiseTopDueInvoiceToolbarOptions = useMemo(
    () => ({ filter: DashboardZoneWiseTopInvoiceDueFilterSchema() }),
    [],
  );

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
    return parsed.success
      ? parsed.data
      : { total_clients: 0, active_clients: 0, inactive_clients: 0, new_clients_this_month: 0, new_clients: 0 };
  }, [clientResponse?.data]);

  const newClientCount = useMemo(() => {
    const parsed = DashboardClientCountSchema.safeParse(newClientResponse?.data);
    return parsed.success
      ? parsed.data
      : { total_clients: 0, active_clients: 0, inactive_clients: 0, new_clients_this_month: 0, new_clients: 0 };
  }, [newClientResponse?.data]);

  const resellerCount = useMemo(() => {
    const parsed = DashboardResellerCountSchema.safeParse(resellerResponse?.data);
    return parsed.success
      ? parsed.data
      : { total_clients: 0, active_clients: 0, inactive_clients: 0 };
  }, [resellerResponse?.data]);

  const invoiceReport = useMemo(() => {
    const parsed = DashboardInvoiceReportSchema.safeParse(invoiceResponse?.data);
    return parsed.success
      ? parsed.data
      : {
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
    return parsed.success ? parsed.data : { months: [], series: [] };
  }, [graphResponse?.data]);

  const topDueInvoiceData = useMemo(() => {
    const parsed = DashboardTopDueInvoiceResponseSchema.safeParse(topDueInvoiceResponse?.data);
    return parsed.success ? parsed.data : { total_amount: 0, top_due_invoices: [] };
  }, [topDueInvoiceResponse?.data]);

  const zoneWiseTopDueInvoice = useMemo(() => {
    const parsed = DashboardZoneWiseTopInvoiceDueSchema.safeParse(zoneWiseTopDueInvoiceResponse?.data);
    return parsed.success ? parsed.data : { total_amount: 0, zone_wise_due: [] };
  }, [zoneWiseTopDueInvoiceResponse?.data]);

  const newClientsTotal = newClientCount.new_clients || newClientCount.new_clients_this_month || 0;

  return {
    clientDateFilter,
    setClientDateFilter,
    clientCount,
    isClientLoading,
    isClientFetching,
    isClientError,

    newClientDateFilter,
    setNewClientDateFilter,
    newClientCount,
    newClientsTotal,
    isNewClientLoading,
    isNewClientFetching,
    isNewClientError,

    resellerCount,
    isResellerLoading,
    isResellerFetching,
    isResellerError,

    invoiceDateFilter,
    setInvoiceDateFilter,
    invoiceReport,
    isInvoiceLoading,
    isInvoiceFetching,
    isInvoiceError,

    graph,
    yearFilter,
    setYearFilter,
    isGraphLoading,
    isGraphFetching,
    isGraphError,

    topDueInvoiceData,
    handleTopDueInvoiceFilter,
    topDueInvoiceToolbarOptions,
    isTopDueInvoiceLoading,
    isTopDueInvoiceFetching,
    isTopDueInvoiceError,

    zoneWiseTopDueInvoice,
    handleZoneWiseDueFilter,
    zoneWiseTopDueInvoiceToolbarOptions,
    isZoneWiseTopDueInvoiceLoading,
    isZoneWiseTopDueInvoiceFetching,
    isZoneWiseTopDueInvoiceError,
  };
}
