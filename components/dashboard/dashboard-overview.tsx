"use client";

import DashboardFilterSelect from "@/components/dashboard/dashboard-filter-select";
import { DATE_FILTER_OPTIONS } from "@/components/dashboard/dashboard-constants";
import { useDashboardData } from "@/components/dashboard/use-dashboard-data";
import type { DashboardDateFilter } from "@/components/dashboard/dashboard-type";
import DashboardSectionCard from "@/components/dashboard/items/DashboardSectionCard";
import DashboardClientSummaryCard from "@/components/dashboard/items/DashboardClientSummaryCard";
import DashboardInvoiceSummaryCard from "@/components/dashboard/items/DashboardInvoiceSummaryCard";
import DashboardInvoicePaidSummaryCard from "@/components/dashboard/items/DashboardInvoicePaidSummaryCard";
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

        <DashboardSectionCard
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

        <DashboardSectionCard
          titleKey="dashboard.cards.total_invoice"
          totalValue={invoiceReport.total_after_discount}
          firstMetricKey="dashboard.metrics.paid"
          firstMetricValue={invoiceReport.total_amount_paid}
          secondMetricKey="dashboard.metrics.due"
          secondMetricValue={invoiceReport.total_amount_due}
          isLoading={isInvoiceLoading}
          isRefreshing={isInvoiceFetching}
          isError={isInvoiceError}
          formatCurrency={true}
          filter={
            <DashboardFilterSelect
              value={invoiceDateFilter}
              options={DATE_FILTER_OPTIONS}
              onValueChange={(value) => setInvoiceDateFilter(value as DashboardDateFilter)}
              placeholderKey="dashboard.filters.date.label"
              className="h-8 text-xs w-[130px]"
            />
          }
        />

        <DashboardSectionCard
          titleKey="dashboard.cards.total_expense"
          totalValue={expenseReport.total_expense}
          firstMetricKey="dashboard.metrics.approved"
          firstMetricValue={expenseReport.approved_expense}
          secondMetricKey="dashboard.metrics.pending"
          secondMetricValue={expenseReport.pending_expense}
          isLoading={isExpenseLoading}
          isRefreshing={isExpenseFetching}
          isError={isExpenseError}
          formatCurrency={true}
          filter={
            <DashboardFilterSelect
              value={expenseDateFilter}
              options={DATE_FILTER_OPTIONS}
              onValueChange={(value) => setExpenseDateFilter(value as DashboardDateFilter)}
              placeholderKey="dashboard.filters.date.label"
              className="h-8 text-xs w-[130px]"
            />
          }
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
