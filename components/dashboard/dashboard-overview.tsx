"use client";

import { useDashboardData } from "@/components/dashboard/use-dashboard-data";
import DashboardClientSummaryCard from "@/components/dashboard/items/DashboardClientSummaryCard";
import DashboardInvoiceSummaryCard from "@/components/dashboard/items/DashboardInvoiceSummaryCard";
import DashboardInvoicePaidSummaryCard from "@/components/dashboard/items/DashboardInvoicePaidSummaryCard";
import DashboardExpenseSummaryCard from "@/components/dashboard/items/DashboardExpenseSummaryCard";
import DashboardFundSummaryCard from "@/components/dashboard/items/DashboardFundSummaryCard";
import DashboardSupportTicketCard from "@/components/dashboard/items/DashboardSupportTicketCard";
import DashboardTopDueInvoicesTable from "@/components/dashboard/items/DashboardTopDueInvoicesTable";
import DashboardZoneDueSummaryTable from "@/components/dashboard/items/DashboardZoneDueSummaryTable";
import DashboardRevenueChart from "@/components/dashboard/items/DashboardRevenueChart";
import DashboardProductStockCard from "@/components/dashboard/items/DashboardProductStockCard";

export default function DashboardOverview() {
  const {
    clientCount,
    isClientLoading,
    isClientFetching,
    isClientError,

    invoiceSummary,
    isInvoiceSummaryLoading,
    isInvoiceSummaryFetching,
    isInvoiceSummaryError,

    invoicePaidSummary,
    isInvoicePaidSummaryLoading,
    isInvoicePaidSummaryFetching,
    isInvoicePaidSummaryError,

    invoiceDueSummary,
    isInvoiceDueSummaryLoading,
    isInvoiceDueSummaryFetching,
    isInvoiceDueSummaryError,

    expenseSummary,
    isExpenseSummaryLoading,
    isExpenseSummaryFetching,
    isExpenseSummaryError,

    fundSummary,
    isFundSummaryLoading,
    isFundSummaryFetching,
    isFundSummaryError,

    ticketSummary,
    isTicketSummaryLoading,
    isTicketSummaryFetching,
    isTicketSummaryError,

    graph,
    yearFilter,
    setYearFilter,
    isGraphLoading,
    isGraphFetching,
    isGraphError,

    topDueInvoiceData,
    handleTopDueInvoiceFilter,
    isTopDueInvoiceLoading,
    isTopDueInvoiceFetching,
    isTopDueInvoiceError,

    zoneWiseTopDueInvoice,
    handleZoneWiseDueFilter,
    isZoneWiseTopDueInvoiceLoading,
    isZoneWiseTopDueInvoiceFetching,
    isZoneWiseTopDueInvoiceError,
  } = useDashboardData();

  return (
    <div className="space-y-4 pr-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <DashboardClientSummaryCard
          data={clientCount}
          isLoading={isClientLoading}
          isRefreshing={isClientFetching}
          isError={isClientError}
        />

        <DashboardInvoiceSummaryCard
          data={invoiceSummary}
          isLoading={isInvoiceSummaryLoading}
          isRefreshing={isInvoiceSummaryFetching}
          isError={isInvoiceSummaryError}
        />

        <DashboardInvoicePaidSummaryCard
          data={invoicePaidSummary}
          isLoading={isInvoicePaidSummaryLoading}
          isRefreshing={isInvoicePaidSummaryFetching}
          isError={isInvoicePaidSummaryError}
        />

        <DashboardInvoiceSummaryCard
          data={invoiceDueSummary}
          isLoading={isInvoiceDueSummaryLoading}
          isRefreshing={isInvoiceDueSummaryFetching}
          isError={isInvoiceDueSummaryError}
          titleKey="dashboard.cards.invoices_due"
        />

        <DashboardExpenseSummaryCard
          data={expenseSummary}
          isLoading={isExpenseSummaryLoading}
          isRefreshing={isExpenseSummaryFetching}
          isError={isExpenseSummaryError}
        />

        <DashboardFundSummaryCard
          data={fundSummary}
          isLoading={isFundSummaryLoading}
          isRefreshing={isFundSummaryFetching}
          isError={isFundSummaryError}
        />

        <DashboardSupportTicketCard
          data={ticketSummary}
          isLoading={isTicketSummaryLoading}
          isRefreshing={isTicketSummaryFetching}
          isError={isTicketSummaryError}
        />

        <DashboardProductStockCard />
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <DashboardTopDueInvoicesTable
          invoices={topDueInvoiceData.top_due_invoices}
          totalAmount={topDueInvoiceData.total_amount}
          isLoading={isTopDueInvoiceLoading}
          isFetching={isTopDueInvoiceFetching}
          isError={isTopDueInvoiceError}
          setFilter={handleTopDueInvoiceFilter}
        />
        <DashboardZoneDueSummaryTable
          dueItems={zoneWiseTopDueInvoice.zone_wise_due}
          totalAmount={zoneWiseTopDueInvoice.total_amount}
          isLoading={isZoneWiseTopDueInvoiceLoading}
          isFetching={isZoneWiseTopDueInvoiceFetching}
          isError={isZoneWiseTopDueInvoiceError}
          setFilter={handleZoneWiseDueFilter}
        />
      </div>

      <DashboardRevenueChart
        graph={graph}
        yearFilter={yearFilter}
        setYearFilter={setYearFilter}
        isLoading={isGraphLoading}
        isFetching={isGraphFetching}
        isError={isGraphError}
      />
    </div>
  );
}
