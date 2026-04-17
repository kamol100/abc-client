"use client";

import { useTranslation } from "react-i18next";
import DisplayCount from "@/components/display-count";
import {
  DashboardMetricCard,
  DashboardMetricRow,
  DashboardMetricRowSkeleton,
} from "@/components/dashboard/items/DashboardMetricCard";
import type { ClientDashboardInvoiceSummary } from "./client-dashboard-type";

type Props = {
  data: ClientDashboardInvoiceSummary;
  isLoading: boolean;
  isRefreshing: boolean;
  isError: boolean;
};

const METRICS: Array<{ labelKey: string; key: keyof ClientDashboardInvoiceSummary }> = [
  { labelKey: "dashboard.metrics.due", key: "total_due_amount" },
  { labelKey: "dashboard.metrics.paid", key: "total_paid_amount" },
];

export default function ClientDashboardInvoiceCard({ data, isLoading, isRefreshing, isError }: Props) {
  const { t } = useTranslation();

  return (
    <DashboardMetricCard
      title={t("dashboard.cards.invoices")}
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
      {METRICS.map(({ labelKey, key }) => (
        <DashboardMetricRow
          key={key}
          label={`${t(labelKey)}:`}
          value={<DisplayCount amount={data[key]} abbreviate translation={false} />}
        />
      ))}
    </DashboardMetricCard>
  );
}
