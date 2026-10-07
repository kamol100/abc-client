"use client";

import DisplayCount from "@/components/display-count";
import { useTranslation } from "react-i18next";
import type { DashboardResellerCount } from "@/components/dashboard/dashboard-type";
import { toNumber } from "@/lib/helper/helper";
import { DashboardMetricCard, DashboardMetricRow, DashboardMetricRowSkeleton } from "@/components/dashboard/items/DashboardMetricCard";

type Props = {
  data: DashboardResellerCount;
  isLoading: boolean;
  isRefreshing: boolean;
  isError: boolean;
};

const METRICS: Array<{ labelKey: string; key: "active_clients" | "inactive_clients" | "new_resellers_this_month" }> = [
  { labelKey: "dashboard.metrics.active", key: "active_clients" },
  { labelKey: "dashboard.metrics.inactive", key: "inactive_clients" },
  { labelKey: "dashboard.metrics.this_month", key: "new_resellers_this_month" },
];

export default function DashboardResellerSummaryCard({ data, isLoading, isRefreshing, isError }: Props) {
  const { t } = useTranslation();

  return (
    <DashboardMetricCard
      title={
        <span className="inline-flex items-baseline">
          {t("dashboard.cards.total_resellers")}
          (<DisplayCount amount={data?.total_resellers ?? 0} />) :&nbsp;
          <span>{t("dashboard.metrics.client")}</span>
        </span>
      }
      value={
        <span className="inline-flex items-baseline gap-1.5">
          <DisplayCount amount={data?.total_reseller_clients ?? 0} />
        </span>
      }
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
          value={<DisplayCount amount={toNumber(data[key])} />}
        />
      ))}
    </DashboardMetricCard>
  );
}
