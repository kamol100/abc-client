"use client";

import Card from "@/components/card";
import { DataTable } from "@/components/data-table/data-table";
import { useDashboardZoneWiseTopInvoiceDueColumns } from "@/components/dashboard/dashboard-zone-wise-top-invoice-due-columns";
import DashboardZoneWiseTopInvoiceDueFilterSchema from "@/components/dashboard/dashboard-zone-wise-top-invoice-due-filter-schema";
import type { DashboardZoneWiseTopInvoiceDueItem } from "@/components/dashboard/dashboard-type";
import { toNumber } from "@/lib/helper/helper";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import DisplayCount from "../../display-count";

type Props = {
  dueItems: DashboardZoneWiseTopInvoiceDueItem[];
  totalAmount: number;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  setFilter: (query: string) => void;
};

export default function DashboardZoneDueSummaryTable({
  dueItems,
  totalAmount,
  isLoading,
  isFetching,
  isError,
  setFilter,
}: Props) {
  const { t } = useTranslation();
  const columns = useDashboardZoneWiseTopInvoiceDueColumns();

  const toolbarOptions = useMemo(
    () => ({ filter: DashboardZoneWiseTopInvoiceDueFilterSchema() }),
    [],
  );

  const toolbarTitle = useMemo(() => {
    const title = t("dashboard.zone_wise_top_invoice_due.title");
    const count = !isLoading ? ` (${dueItems.length})` : "";
    return `${title}${count}`;
  }, [t, isLoading, dueItems.length]);

  return (
    <Card className="p-4 md:p-5">
      {isError ? (
        <p className="text-sm text-destructive">{t("common.failed_to_load_data")}</p>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {t("dashboard.zone_wise_top_invoice_due.total_amount")}
            </p>
            <p className="text-sm font-semibold">
              <DisplayCount amount={toNumber(totalAmount)} animate formatCurrency />
            </p>
          </div>
          <DataTable
            data={isLoading ? [] : dueItems}
            columns={columns}
            setFilter={setFilter}
            toolbarOptions={toolbarOptions}
            toggleColumns={true}
            isLoading={isLoading}
            isFetching={isFetching}
            queryKey="dashboard-zone-wise-top-invoice-due"
            toolbarTitle={toolbarTitle}
          />
        </div>
      )}
    </Card>
  );
}
