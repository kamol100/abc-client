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
  DashboardExpenseReportSchema,
  DashboardExpenseSummarySchema,
  DashboardFundSummarySchema,
  DashboardGraphSchema,
  DashboardInvoiceReportSchema,
  DashboardInvoiceSummarySchema,
  DashboardInvoicePaidSummarySchema,
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
  const [invoiceDateFilter, setInvoiceDateFilter] = useState<DashboardDateFilter>("this_month");
  const [expenseDateFilter, setExpenseDateFilter] = useState<DashboardDateFilter>("this_month");
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

  const invoiceParams = useMemo(() => ({ date_filter: invoiceDateFilter }), [invoiceDateFilter]);
  const expenseParams = useMemo(() => ({ date_filter: expenseDateFilter }), [expenseDateFilter]);
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
    queryKey: ["dashboard-client-count"],
    url: "dashboard-client-count",
    pagination: false,
  });

  const {
    data: invoiceSummaryResponse,
    isLoading: isInvoiceSummaryLoading,
    isFetching: isInvoiceSummaryFetching,
    isError: isInvoiceSummaryError,
  } = useApiQuery<ApiResponse<unknown>>({
    queryKey: ["dashboard-invoice-summary"],
    url: "dashboard-invoice-summary",
    pagination: false,
  });

  const {
    data: invoiceDueSummaryResponse,
    isLoading: isInvoiceDueSummaryLoading,
    isFetching: isInvoiceDueSummaryFetching,
    isError: isInvoiceDueSummaryError,
  } = useApiQuery<ApiResponse<unknown>>({
    queryKey: ["dashboard-invoice-due-summary"],
    url: "dashboard-invoice-due-summary",
    pagination: false,
  });

  const {
    data: invoicePaidSummaryResponse,
    isLoading: isInvoicePaidSummaryLoading,
    isFetching: isInvoicePaidSummaryFetching,
    isError: isInvoicePaidSummaryError,
  } = useApiQuery<ApiResponse<unknown>>({
    queryKey: ["dashboard-invoice-paid-summary"],
    url: "dashboard-invoice-paid-summary",
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
    data: expenseResponse,
    isLoading: isExpenseLoading,
    isFetching: isExpenseFetching,
    isError: isExpenseError,
  } = useApiQuery<ApiResponse<unknown>>({
    queryKey: ["dashboard-expense-report", expenseDateFilter],
    url: "dashboard-expense-report",
    params: expenseParams,
    pagination: false,
  });

  const {
    data: expenseSummaryResponse,
    isLoading: isExpenseSummaryLoading,
    isFetching: isExpenseSummaryFetching,
    isError: isExpenseSummaryError,
  } = useApiQuery<ApiResponse<unknown>>({
    queryKey: ["dashboard-expense-summary"],
    url: "dashboard-expense-summary",
    pagination: false,
  });

  const {
    data: fundSummaryResponse,
    isLoading: isFundSummaryLoading,
    isFetching: isFundSummaryFetching,
    isError: isFundSummaryError,
  } = useApiQuery<ApiResponse<unknown>>({
    queryKey: ["dashboard-fund-summary"],
    url: "dashboard-fund-summary",
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

  const invoiceSummary = useMemo(() => {
    const parsed = DashboardInvoiceSummarySchema.safeParse(invoiceSummaryResponse?.data);
    return parsed.success
      ? parsed.data
      : { total_invoice_amount: 0, this_month_invoice_amount: 0, last_month_invoice_amount: 0 };
  }, [invoiceSummaryResponse?.data]);

  const invoiceDueSummary = useMemo(() => {
    const parsed = DashboardInvoiceSummarySchema.safeParse(invoiceDueSummaryResponse?.data);
    return parsed.success
      ? parsed.data
      : { total_invoice_amount: 0, this_month_invoice_amount: 0, last_month_invoice_amount: 0 };
  }, [invoiceDueSummaryResponse?.data]);

  const invoicePaidSummary = useMemo(() => {
    const parsed = DashboardInvoicePaidSummarySchema.safeParse(invoicePaidSummaryResponse?.data);
    return parsed.success
      ? parsed.data
      : { total_paid_amount: 0, today_paid_amount: 0, this_month_paid_amount: 0, last_month_paid_amount: 0 };
  }, [invoicePaidSummaryResponse?.data]);

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

  const expenseReport = useMemo(() => {
    const parsed = DashboardExpenseReportSchema.safeParse(expenseResponse?.data);
    return parsed.success
      ? parsed.data
      : { total_expense: 0, pending_expense: 0, approved_expense: 0 };
  }, [expenseResponse?.data]);

  const expenseSummary = useMemo(() => {
    const parsed = DashboardExpenseSummarySchema.safeParse(expenseSummaryResponse?.data);
    return parsed.success
      ? parsed.data
      : { total_expense_amount: 0, today_expense_amount: 0, this_month_expense_amount: 0, last_month_expense_amount: 0 };
  }, [expenseSummaryResponse?.data]);

  const fundSummary = useMemo(() => {
    const parsed = DashboardFundSummarySchema.safeParse(fundSummaryResponse?.data);
    return parsed.success
      ? parsed.data
      : { total_fund_amount: 0, total_cash_amount: 0, total_bkash_amount: 0 };
  }, [fundSummaryResponse?.data]);

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

  return {
    clientCount,
    isClientLoading,
    isClientFetching,
    isClientError,

    invoiceSummary,
    isInvoiceSummaryLoading,
    isInvoiceSummaryFetching,
    isInvoiceSummaryError,

    invoiceDueSummary,
    isInvoiceDueSummaryLoading,
    isInvoiceDueSummaryFetching,
    isInvoiceDueSummaryError,

    invoicePaidSummary,
    isInvoicePaidSummaryLoading,
    isInvoicePaidSummaryFetching,
    isInvoicePaidSummaryError,

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

    expenseDateFilter,
    setExpenseDateFilter,
    expenseReport,
    isExpenseLoading,
    isExpenseFetching,
    isExpenseError,

    expenseSummary,
    isExpenseSummaryLoading,
    isExpenseSummaryFetching,
    isExpenseSummaryError,

    fundSummary,
    isFundSummaryLoading,
    isFundSummaryFetching,
    isFundSummaryError,

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
