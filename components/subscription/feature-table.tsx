"use client";

import { DataTable } from "@/components/data-table/data-table";
import { FeatureColumns } from "@/components/subscription/feature-column";
import FeatureForm from "@/components/subscription/feature-form";
import { FeatureRow } from "@/components/subscription/feature-type";
import { usePermissions } from "@/context/app-provider";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { useTranslation } from "react-i18next";

export default function FeatureTable() {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const { data, isLoading, isFetching, setCurrentPage } = useApiQuery<PaginatedApiResponse<FeatureRow>>({
    queryKey: ["features"],
    url: "features",
  });

  return (
    <DataTable
      data={data?.data?.data ?? []}
      columns={FeatureColumns}
      pagination={data?.data?.pagination}
      setCurrentPage={setCurrentPage}
      isLoading={isLoading}
      isFetching={isFetching}
      form={hasPermission("features.create") ? FeatureForm : undefined}
      toolbarTitle={t("subscription.feature.title")}
    />
  );
}
