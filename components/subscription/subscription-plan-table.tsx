"use client";

import { DataTable } from "@/components/data-table/data-table";
import type { DataTableToolbarConfig } from "@/components/data-table/toolbar/toolbar-config";
import { SubscriptionPlanColumns } from "@/components/subscription/subscription-plan-column";
import SubscriptionPlanForm from "@/components/subscription/subscription-plan-form";
import { SubscriptionPlanRow } from "@/components/subscription/subscription-plan-type";
import { usePermissions } from "@/context/app-provider";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { useTranslation } from "react-i18next";

export default function SubscriptionPlanTable() {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const { data, isLoading, isFetching, setCurrentPage } = useApiQuery<PaginatedApiResponse<SubscriptionPlanRow>>({
    queryKey: ["subscription-plans"],
    url: "subscription-plans",
  });
  const plans = data?.data?.data ?? [];
  const pagination = data?.data?.pagination;

  const toolbar: DataTableToolbarConfig = {
    title: t("subscription.plan.title"),
    features: {
      add: hasPermission("subscription-plans.create") ? SubscriptionPlanForm : undefined,
    },
  };

  return (
    <DataTable
      data={plans}
      columns={SubscriptionPlanColumns}
      pagination={pagination}
      setCurrentPage={setCurrentPage}
      isLoading={isLoading}
      isFetching={isFetching}
      toolbar={toolbar}
    />
  );
}
