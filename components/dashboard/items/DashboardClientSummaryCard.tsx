"use client";

import DisplayCount from "@/components/display-count";
import { useTranslation } from "react-i18next";
import type { DashboardClientCount } from "@/components/dashboard/dashboard-type";
import { toNumber } from "@/lib/helper/helper";
import { DashboardMetricCard, DashboardMetricRow, DashboardMetricRowSkeleton } from "./DashboardMetricCard";

type Props = {
  data: DashboardClientCount;
  isLoading: boolean;
  isRefreshing: boolean;
  isError: boolean;
};

const METRICS: Array<{ labelKey: string; key: keyof DashboardClientCount }> = [
  { labelKey: "dashboard.metrics.active", key: "active_clients" },
  { labelKey: "dashboard.metrics.inactive", key: "inactive_clients" },
  { labelKey: "dashboard.metrics.this_month", key: "new_clients_this_month" },
];

export default function DashboardClientSummaryCard({ data, isLoading, isRefreshing, isError }: Props) {
  const { t } = useTranslation();

  return (
    <DashboardMetricCard
      title={t("dashboard.cards.total_clients")}
      value={<DisplayCount amount={data?.total_clients ?? 0} />}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      isError={isError}
      skeletonBody={
        <>
          {METRICS.map(({ key }) => (
            <DashboardMetricRowSkeleton key={key} />
          ))}
        </>
      }
    >
      {data && METRICS.map(({ labelKey, key }) => (
        <DashboardMetricRow
          key={key}
          label={`${t(labelKey)}:`}
          value={<DisplayCount amount={toNumber(data[key] as string) ?? 0} />}
        />
      ))}
    </DashboardMetricCard>
  );
}
