"use client";

import { useTranslation } from "react-i18next";
import DisplayCount from "@/components/display-count";
import { DashboardStatCard, DashboardStatRow } from "@/components/dashboard/items/DashboardAccentCard";
import { DASHBOARD_CARD_ACCENTS, type DashboardCardAccent } from "@/components/dashboard/dashboard-constants";
import type { DashboardTicketSummary } from "@/components/dashboard/dashboard-type";
import { toNumber } from "@/lib/helper/helper";

type Props = {
  data: DashboardTicketSummary;
  isLoading: boolean;
  isRefreshing: boolean;
  isError: boolean;
  accent?: DashboardCardAccent;
};

const METRICS: Array<{ labelKey: string; key: keyof DashboardTicketSummary }> = [
  { labelKey: "dashboard.metrics.open_ticket", key: "total_open_ticket" },
  { labelKey: "dashboard.metrics.in_progress", key: "total_in_progress_ticket" },
  { labelKey: "dashboard.metrics.resolved", key: "total_resolve_ticket" },
];

export default function DashboardSupportTicketCard({
  data,
  isLoading,
  isRefreshing,
  isError,
  accent = DASHBOARD_CARD_ACCENTS.ticket,
}: Props) {
  const { t } = useTranslation();
  // The big number is the sum of the three rows below it.
  const total = data ? METRICS.reduce((sum, { key }) => sum + toNumber(data[key] as number), 0) : 0;

  return (
    <DashboardStatCard
      accent={accent}
      label={t("dashboard.cards.support_ticket")}
      value={<DisplayCount amount={total} />}
      isLoading={isLoading || isRefreshing}
      isError={isError}
      skeletonRows={METRICS.length}
    >
      {data && METRICS.map(({ labelKey, key }) => (
        <DashboardStatRow key={key} label={t(labelKey)} value={data[key] as number} />
      ))}
    </DashboardStatCard>
  );
}
