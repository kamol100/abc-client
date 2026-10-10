"use client";

import { DataTable } from "@/components/data-table/data-table";
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

  return (
    <DataTable
      data={plans}
      columns={SubscriptionPlanColumns}
      pagination={pagination}
      setCurrentPage={setCurrentPage}
      isLoading={isLoading}
      isFetching={isFetching}
      form={hasPermission("subscription-plans.create") ? SubscriptionPlanForm : undefined}
      toolbarTitle={t("subscription.plan.title")}
    />
  );
}
