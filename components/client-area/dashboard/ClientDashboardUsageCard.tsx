"use client";

import { useTranslation } from "react-i18next";
import {
  DashboardMetricCard,
  DashboardMetricRow,
  DashboardMetricRowSkeleton,
} from "@/components/dashboard/items/DashboardMetricCard";
import { formatTrafficAmount } from "@/components/client-area/traffic-report/traffic-report-format";
import type { ClientDashboardUsage } from "@/components/client-area/dashboard/client-dashboard-type";

type Props = {
  data: ClientDashboardUsage | null;
  isLoading: boolean;
  isRefreshing: boolean;
  isError: boolean;
};

const METRICS: Array<{ labelKey: string; key: keyof ClientDashboardUsage }> = [
  { labelKey: "client_dashboard.usage.today", key: "today" },
  { labelKey: "client_dashboard.usage.this_month", key: "this_month" },
  { labelKey: "client_dashboard.usage.last_month", key: "last_month" },
];

export default function ClientDashboardUsageCard({ data, isLoading, isRefreshing, isError }: Props) {
  const { t } = useTranslation();

  return (
    <DashboardMetricCard
      title={t("client_dashboard.usage.title")}
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
      {data
        ? METRICS.map(({ labelKey, key }) => {
            const figure = data[key];
            const amount = formatTrafficAmount(figure.total_bytes, figure.available);

            return (
              <DashboardMetricRow
                key={key}
                label={`${t(labelKey)}:`}
                value={amount ?? t("client_dashboard.usage.unavailable")}
              />
            );
          })
        : null}
    </DashboardMetricCard>
  );
}
