"use client";

import { useMemo, useState } from "react";
import { Banknote } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DataTable } from "@/components/data-table/data-table";
import type { DataTableToolbarConfig } from "@/components/data-table/toolbar/toolbar-config";
import { DashboardStaffCollectionColumns } from "@/components/dashboard/dashboard-staff-collection-columns";
import DashboardStaffCollectionFilterSchema from "@/components/dashboard/dashboard-staff-collection-filter-schema";
import type {
  DashboardStaffCollectionDetail,
  DashboardStaffCollectionPeriod,
} from "@/components/dashboard/dashboard-type";
import SummaryChip from "@/components/summary-chip";
import useApiQuery, { type ApiResponse } from "@/hooks/use-api-query";
import { toNumber } from "@/lib/helper/helper";

type CollectionListPayload = {
  data: DashboardStaffCollectionDetail[];
  pagination: Pagination;
  reports?: { amount?: number | string } | null;
};

const QUERY_KEY = "dashboard-staff-invoice-collection-details";

/** The logged-in staff's collections of one period: the rows behind one line of the card. */
export default function DashboardStaffCollectionDetails({ period }: { period: DashboardStaffCollectionPeriod }) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<string | null>(null);
  const params = useMemo(
    () => ({ ...(filter ? Object.fromEntries(new URLSearchParams(filter)) : {}), period }),
    [filter, period],
  );

  const { data, isLoading, isFetching, isError, setCurrentPage } = useApiQuery<ApiResponse<CollectionListPayload>>({
    queryKey: [QUERY_KEY],
    url: "dashboard-staff-invoice-collection-details",
    params,
  });

  const rows = data?.data?.data ?? [];
  const pagination = data?.data?.pagination;
  const filterSchema = useMemo(() => ({ filter: DashboardStaffCollectionFilterSchema() }), []);

  const toolbar: DataTableToolbarConfig = {
    // Always rendered, so the toolbar does not move when the total arrives.
    center: [
      {
        key: "total",
        node: (
          <SummaryChip
            icon={Banknote}
            label="dashboard.staff_collection.total"
            amount={toNumber(data?.data?.reports?.amount)}
            isLoading={isLoading}
          />
        ),
      },
    ],
    page: null, // Not a company list page: inline filter, no ⚙.
    features: {
      layoutToggle: false,
      filter: filterSchema,
    },
  };

  if (isError) {
    return <p className="py-6 text-center text-sm text-destructive">{t("common.failed_to_load_data")}</p>;
  }

  return (
    <DataTable
      data={rows}
      columns={DashboardStaffCollectionColumns}
      setFilter={setFilter}
      toolbar={toolbar}
      pagination={pagination}
      setCurrentPage={setCurrentPage}
      isLoading={isLoading}
      isFetching={isFetching}
      queryKey={QUERY_KEY}
    />
  );
}
