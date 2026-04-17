"use client";

import { useMemo } from "react";
import useApiQuery, { type ApiResponse } from "@/hooks/use-api-query";
import {
  DashboardTicketSummarySchema,
  type DashboardTicketSummary,
} from "@/components/dashboard/dashboard-type";
import {
  ClientDashboardInvoiceSummarySchema,
  type ClientDashboardInvoiceSummary,
} from "./client-dashboard-type";

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

  return {
    invoiceSummary,
    isInvoiceLoading,
    isInvoiceFetching,
    isInvoiceError,

    ticketSummary,
    isTicketLoading,
    isTicketFetching,
    isTicketError,
  };
}
