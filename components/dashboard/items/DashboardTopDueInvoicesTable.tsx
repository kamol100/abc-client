"use client";

import Card from "@/components/card";
import { DataTable } from "@/components/data-table/data-table";
import { useDashboardTopDueInvoiceColumns } from "@/components/dashboard/dashboard-top-due-invoice-columns";
import DashboardTopDueInvoiceFilterSchema from "@/components/dashboard/dashboard-top-due-invoice-filter-schema";
import type { DashboardTopDueInvoice } from "@/components/dashboard/dashboard-type";
import { toNumber } from "@/lib/helper/helper";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import DisplayCount from "../../display-count";

type Props = {
  invoices: DashboardTopDueInvoice[];
  totalAmount: number;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  setFilter: (query: string) => void;
};

export default function DashboardTopDueInvoicesTable({
  invoices,
  totalAmount,
  isLoading,
  isFetching,
  isError,
  setFilter,
}: Props) {
  const { t } = useTranslation();
  const columns = useDashboardTopDueInvoiceColumns();

  const toolbarOptions = useMemo(() => ({ filter: DashboardTopDueInvoiceFilterSchema() }), []);

  const toolbarTitle = useMemo(() => {
    const title = t("dashboard.top_due_invoice.title");
    if (!isLoading && invoices.length > 0) return `${title} (${invoices.length})`;
    return title;
  }, [t, isLoading, invoices.length]);

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
