"use client";

import { Suspense } from "react";
import DashboardSupportTicketCard from "@/components/dashboard/items/DashboardSupportTicketCard";
import ClientDashboardInvoiceCard from "@/components/client-area/dashboard/ClientDashboardInvoiceCard";
import ClientDashboardPaymentCard from "@/components/client-area/dashboard/ClientDashboardPaymentCard";
import { useClientDashboardData } from "@/components/client-area/dashboard/use-client-dashboard-data";
import ClientDashboardInfo from "@/components/client-area/dashboard/ClientDashboardInfo";
import BkashPaymentResultNotice from "@/components/bkash-payment/bkash-payment-result-notice";

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

    payment,
    isPaymentLoading,
    isPaymentFetching,
    isPaymentError,

    info,
    isInfoLoading,
    isInfoError,
  } = useClientDashboardData();

  return (
    <div className="space-y-4 pr-3">
      <Suspense fallback={null}>
        <BkashPaymentResultNotice />
      </Suspense>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <ClientDashboardInvoiceCard
          data={invoiceSummary}
          isLoading={isInvoiceLoading}
          isRefreshing={isInvoiceFetching}
          isError={isInvoiceError}
        />
        <ClientDashboardPaymentCard
          data={payment}
          isLoading={isPaymentLoading}
          isRefreshing={isPaymentFetching}
          isError={isPaymentError}
        />
        <DashboardSupportTicketCard
          data={ticketSummary}
          isLoading={isTicketLoading}
          isRefreshing={isTicketFetching}
          isError={isTicketError}
        />
      </div>
      <ClientDashboardInfo
        data={info}
        isLoading={isInfoLoading}
        isError={isInfoError}
      />
    </div>
  );
}
