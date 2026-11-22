"use client";

import { DataTable } from "@/components/data-table/data-table";
import type { DataTableToolbarConfig } from "@/components/data-table/toolbar/toolbar-config";
import { CompanySubscriptionColumns } from "@/components/subscription/company-subscription-column";
import CompanySubscriptionForm from "@/components/subscription/company-subscription-form";
import { CompanySubscriptionRow } from "@/components/subscription/company-subscription-type";
import { usePermissions } from "@/context/app-provider";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { useTranslation } from "react-i18next";

export default function CompanySubscriptionTable() {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const { data, isLoading, isFetching, setCurrentPage } = useApiQuery<PaginatedApiResponse<CompanySubscriptionRow>>({
    queryKey: ["company-subscriptions"],
    url: "company-subscriptions",
  });

  const toolbar: DataTableToolbarConfig = {
    title: t("subscription.company.title"),
    features: {
      add: hasPermission("company-subscriptions.create") ? CompanySubscriptionForm : undefined,
    },
  };

  return (
    <DataTable
      data={data?.data?.data ?? []}
      columns={CompanySubscriptionColumns}
      pagination={data?.data?.pagination}
      setCurrentPage={setCurrentPage}
      isLoading={isLoading}
      isFetching={isFetching}
      toolbar={toolbar}
    />
  );
}
