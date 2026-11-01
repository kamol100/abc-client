"use client";

import { useMemo } from "react";
import useApiQuery, { type ApiResponse } from "@/hooks/use-api-query";
import {
  DashboardTicketSummarySchema,
  type DashboardTicketSummary,
} from "@/components/dashboard/dashboard-type";
import {
  ClientDashboardInfoSchema,
  ClientDashboardInvoiceSummarySchema,
  ClientDashboardUsageSchema,
  type ClientDashboardInfo,
  type ClientDashboardInvoiceSummary,
  type ClientDashboardUsage,
} from "@/components/client-area/dashboard/client-dashboard-type";
import { useClientInvoicePayment } from "@/components/client-area/use-client-invoice-payment";

const INVOICE_FALLBACK: ClientDashboardInvoiceSummary = {
  total_due_amount: 0,
  total_paid_amount: 0,
};

const TICKET_FALLBACK: DashboardTicketSummary = {
  total_open_ticket: 0,
  total_in_progress_ticket: 0,
  total_resolve_ticket: 0,
};

export function useClientDashboardData() {
  const {
    data: invoiceResponse,
    isLoading: isInvoiceLoading,
    isFetching: isInvoiceFetching,
    isError: isInvoiceError,
  } = useApiQuery<ApiResponse<unknown>>({
    queryKey: ["client-dashboard-invoice-summary"],
    url: "client-dashboard-invoice-summary",
    pagination: false,
  });

  const {
    data: ticketResponse,
    isLoading: isTicketLoading,
    isFetching: isTicketFetching,
    isError: isTicketError,
  } = useApiQuery<ApiResponse<unknown>>({
    queryKey: ["client-dashboard-ticket-summary"],
    url: "client-dashboard-ticket-summary",
    pagination: false,
  });

  const invoiceSummary = useMemo<ClientDashboardInvoiceSummary>(() => {
    const parsed = ClientDashboardInvoiceSummarySchema.safeParse(invoiceResponse?.data);
    return parsed.success ? parsed.data : INVOICE_FALLBACK;
  }, [invoiceResponse?.data]);

  const ticketSummary = useMemo<DashboardTicketSummary>(() => {
    const parsed = DashboardTicketSummarySchema.safeParse(ticketResponse?.data);
    return parsed.success ? parsed.data : TICKET_FALLBACK;
  }, [ticketResponse?.data]);

  const {
    payment,
    isLoading: isPaymentLoading,
    isFetching: isPaymentFetching,
    isError: isPaymentError,
  } = useClientInvoicePayment();

  const {
    data: usageResponse,
    isLoading: isUsageQueryLoading,
    isFetching: isUsageFetching,
    isError: isUsageQueryError,
  } = useApiQuery<ApiResponse<unknown>>({
    queryKey: ["client-dashboard-usage"],
    url: "client-dashboard-usage",
    pagination: false,
  });

  const usage = useMemo<ClientDashboardUsage | null>(() => {
    const parsed = ClientDashboardUsageSchema.safeParse(usageResponse?.data);
    return parsed.success ? parsed.data : null;
  }, [usageResponse?.data]);

  const {
    data: infoResponse,
    isLoading: isInfoQueryLoading,
    isError: isInfoQueryError,
  } = useApiQuery<ApiResponse<unknown>>({
    queryKey: ["client-dashboard-info"],
    url: "client-dashboard-info",
    pagination: false,
    staleTime: 10_000,
    retry: 0,
  });

  const info = useMemo<ClientDashboardInfo | null>(() => {
    const parsed = ClientDashboardInfoSchema.safeParse(infoResponse?.data);
    return parsed.success ? parsed.data : null;
  }, [infoResponse?.data]);

  return {
    invoiceSummary,
    isInvoiceLoading,
    isInvoiceFetching,
    isInvoiceError,

    ticketSummary,
    isTicketLoading,
    isTicketFetching,
    isTicketError,

    payment,
    isPaymentLoading,
    isPaymentFetching,
    isPaymentError,

    usage,
    isUsageLoading: isUsageQueryLoading,
    isUsageFetching,
    isUsageError: isUsageQueryError || (!isUsageQueryLoading && usageResponse !== undefined && usage === null),

    info,
    isInfoLoading: isInfoQueryLoading && !info,
    isInfoError: isInfoQueryError || (!isInfoQueryLoading && infoResponse !== undefined && info === null),
  };
}
