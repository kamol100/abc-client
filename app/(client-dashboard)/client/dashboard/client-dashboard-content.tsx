"use client";

import DashboardSupportTicketCard from "@/components/dashboard/items/DashboardSupportTicketCard";
import ClientDashboardInvoiceCard from "@/components/client-area/dashboard/ClientDashboardInvoiceCard";
import { useClientDashboardData } from "@/components/client-area/dashboard/use-client-dashboard-data";

export default function ClientDashboardContent() {
  const {
    invoiceSummary,
    isInvoiceLoading,
    isInvoiceFetching,
    isInvoiceError,

    ticketSummary,
    isTicketLoading,
    isTicketFetching,
    isTicketError,
  } = useClientDashboardData();

  return (
    <div className="space-y-4 pr-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <ClientDashboardInvoiceCard
          data={invoiceSummary}
          isLoading={isInvoiceLoading}
          isRefreshing={isInvoiceFetching}
          isError={isInvoiceError}
        />
        <DashboardSupportTicketCard
          data={ticketSummary}
          isLoading={isTicketLoading}
          isRefreshing={isTicketFetching}
          isError={isTicketError}
        />
      </div>
    </div>
  );
}
