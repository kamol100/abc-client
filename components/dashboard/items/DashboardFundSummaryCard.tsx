"use client";

import { useTranslation } from "react-i18next";
import DisplayCount from "@/components/display-count";
import { DashboardStatCard, DashboardStatRow } from "@/components/dashboard/items/DashboardAccentCard";
import { DASHBOARD_CARD_ACCENTS, type DashboardCardAccent } from "@/components/dashboard/dashboard-constants";
import type { DashboardFundSummary } from "@/components/dashboard/dashboard-type";
import { toNumber } from "@/lib/helper/helper";

type Props = {
  data: DashboardFundSummary;
  isLoading: boolean;
  isRefreshing: boolean;
  isError: boolean;
  accent?: DashboardCardAccent;
};

const METRICS: Array<{ labelKey: string; key: keyof DashboardFundSummary }> = [
  { labelKey: "dashboard.metrics.cash_amount", key: "total_cash_amount" },
  { labelKey: "dashboard.metrics.bkash_amount", key: "total_bkash_amount" },
];

export default function DashboardFundSummaryCard({
  data,
  isLoading,
  isRefreshing,
  isError,
  accent = DASHBOARD_CARD_ACCENTS.fund,
}: Props) {
  const { t } = useTranslation();

  return (
    <DashboardStatCard
      accent={accent}
      label={t("dashboard.cards.fund")}
      value={<DisplayCount amount={data.total_fund_amount} translation={false} formatCurrency />}
      isLoading={isLoading || isRefreshing}
      isError={isError}
      skeletonRows={METRICS.length}
    >
      {METRICS.map(({ labelKey, key }) => (
        <DashboardStatRow
          key={key}
          label={t(labelKey)}
          value={<DisplayCount amount={toNumber(data[key] as string) ?? 0} translation={false} formatCurrency />}
        />
      ))}
    </DashboardStatCard>
  );
}
