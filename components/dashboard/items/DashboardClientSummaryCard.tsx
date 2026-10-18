"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import DisplayCount from "@/components/display-count";
import { DashboardMetricCard, DashboardMetricRow, DashboardMetricRowSkeleton } from "@/components/dashboard/items/DashboardMetricCard";
import type { DashboardClientCount } from "@/components/dashboard/dashboard-type";
import { usePermissions } from "@/context/app-provider";
import { toNumber } from "@/lib/helper/helper";

type Props = {
  data: DashboardClientCount;
  isLoading: boolean;
  isRefreshing: boolean;
  isError: boolean;
};

const NEW_CLIENTS_HREF = "/clients?created_at=this_month";

const METRICS: Array<{ labelKey: string; key: keyof DashboardClientCount }> = [
  { labelKey: "dashboard.metrics.active", key: "active_clients" },
  { labelKey: "dashboard.metrics.inactive", key: "inactive_clients" },
  { labelKey: "dashboard.metrics.new_clients", key: "new_clients_this_month" },
];

function NewClientsCount({ amount }: { amount: number }) {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const count = <DisplayCount amount={amount} />;

  if (amount <= 0 || !hasPermission("clients.access")) {
    return count;
  }

  const label = t("dashboard.metrics.view_new_clients");

  return (
    <Link
      href={NEW_CLIENTS_HREF}
      aria-label={label}
      title={label}
      className="rounded-sm text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {count}
    </Link>
  );
}

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
      {data && METRICS.map(({ labelKey, key }) => {
        const raw = data[key];
        const amount = toNumber(typeof raw === "number" || typeof raw === "string" ? raw : 0);

        return (
          <DashboardMetricRow
            key={key}
            label={`${t(labelKey)}:`}
            value={
              key === "new_clients_this_month"
                ? <NewClientsCount amount={amount} />
                : <DisplayCount amount={amount} />
            }
          />
        );
      })}
    </DashboardMetricCard>
  );
}
