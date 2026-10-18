"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import DisplayCount from "@/components/display-count";
import { DashboardMetricCard, DashboardMetricRow, DashboardMetricRowSkeleton } from "@/components/dashboard/items/DashboardMetricCard";
import type { DashboardResellerCount } from "@/components/dashboard/dashboard-type";
import { usePermissions } from "@/context/app-provider";
import { toNumber } from "@/lib/helper/helper";

type Props = {
  data: DashboardResellerCount;
  isLoading: boolean;
  isRefreshing: boolean;
  isError: boolean;
};

const NEW_RESELLER_CLIENTS_HREF = "/reports/reseller-clients?created_at=this_month";

const METRICS: Array<{ labelKey: string; key: "active_clients" | "inactive_clients" | "new_clients_this_month" }> = [
  { labelKey: "dashboard.metrics.active", key: "active_clients" },
  { labelKey: "dashboard.metrics.inactive", key: "inactive_clients" },
  { labelKey: "dashboard.metrics.new_client", key: "new_clients_this_month" },
];

function NewResellerClientsCount({ amount }: { amount: number }) {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const count = <DisplayCount amount={amount} />;

  if (amount <= 0 || !hasPermission("resellers.clients.report")) {
    return count;
  }

  const label = t("dashboard.metrics.view_new_clients");

  return (
    <Link
      href={NEW_RESELLER_CLIENTS_HREF}
      aria-label={label}
      title={label}
      className="rounded-sm text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {count}
    </Link>
  );
}

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
      {data && METRICS.map(({ labelKey, key }) => {
        const amount = toNumber(data[key]);

        return (
          <DashboardMetricRow
            key={key}
            label={`${t(labelKey)}:`}
            value={
              key === "new_clients_this_month"
                ? <NewResellerClientsCount amount={amount} />
                : <DisplayCount amount={amount} />
            }
          />
        );
      })}
    </DashboardMetricCard>
  );
}
