"use client";

import { useTranslation } from "react-i18next";
import type { DashboardTicketSummary } from "@/components/dashboard/dashboard-type";
import { DashboardMetricCard, DashboardMetricRow, DashboardMetricRowSkeleton } from "./DashboardMetricCard";

type Props = {
  data: DashboardTicketSummary;
  isLoading: boolean;
  isRefreshing: boolean;
  isError: boolean;
};

const METRICS: Array<{ labelKey: string; key: keyof DashboardTicketSummary }> = [
  { labelKey: "dashboard.metrics.open_ticket", key: "total_open_ticket" },
  { labelKey: "dashboard.metrics.in_progress", key: "total_in_progress_ticket" },
  { labelKey: "dashboard.metrics.resolved", key: "total_resolve_ticket" },
];

export default function DashboardSupportTicketCard({ data, isLoading, isRefreshing, isError }: Props) {
  const { t } = useTranslation();

  return (
    <DashboardMetricCard
      title={t("dashboard.cards.support_ticket")}
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
          value={data[key] as number}
        />
      ))}
    </DashboardMetricCard>
  );
}
