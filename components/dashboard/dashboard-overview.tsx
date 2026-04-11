"use client";

import DashboardFilterSelect from "@/components/dashboard/dashboard-filter-select";
import {
  CLIENT_DATE_FILTER_OPTIONS,
  DATE_FILTER_OPTIONS,
} from "@/components/dashboard/dashboard-constants";
import { useDashboardData } from "@/components/dashboard/use-dashboard-data";
import type { DashboardDateFilter } from "@/components/dashboard/dashboard-type";
import DashboardSectionCard from "@/components/dashboard/items/DashboardSectionCard";
import DashboardTopDueInvoicesTable from "@/components/dashboard/items/DashboardTopDueInvoicesTable";
import DashboardZoneDueSummaryTable from "@/components/dashboard/items/DashboardZoneDueSummaryTable";
import DashboardRevenueChart from "@/components/dashboard/items/DashboardRevenueChart";

export default function DashboardOverview() {
  const {
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
        <DashboardSectionCard
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
              className="h-8 text-xs w-[130px]"
            />
          }
        />

        <DashboardSectionCard
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
              className="h-8 text-xs w-[130px]"
            />
          }
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
