"use client";

import { useTranslation } from "react-i18next";
import DisplayCount from "@/components/display-count";
import { DashboardStatCard, DashboardStatRow } from "@/components/dashboard/items/DashboardAccentCard";
import { DASHBOARD_CARD_ACCENTS, type DashboardCardAccent } from "@/components/dashboard/dashboard-constants";
import type { DashboardExpenseSummary } from "@/components/dashboard/dashboard-type";
import { toNumber } from "@/lib/helper/helper";

type Props = {
  data: DashboardExpenseSummary;
  isLoading: boolean;
  isRefreshing: boolean;
  isError: boolean;
  accent?: DashboardCardAccent;
};

const METRICS: Array<{ labelKey: string; key: keyof DashboardExpenseSummary }> = [
  { labelKey: "dashboard.metrics.today", key: "today_expense_amount" },
  { labelKey: "dashboard.metrics.this_month", key: "this_month_expense_amount" },
  { labelKey: "dashboard.metrics.last_month", key: "last_month_expense_amount" },
];

export default function DashboardExpenseSummaryCard({
  data,
  isLoading,
  isRefreshing,
  isError,
  accent = DASHBOARD_CARD_ACCENTS.expense,
}: Props) {
  const { t } = useTranslation();

  return (
    <DashboardStatCard
      accent={accent}
      label={t("dashboard.cards.expense")}
      value={<DisplayCount amount={data.total_expense_amount} translation={false} />}
      isLoading={isLoading || isRefreshing}
      isError={isError}
      skeletonRows={METRICS.length}
    >
      {METRICS.map(({ labelKey, key }) => (
        <DashboardStatRow
          key={key}
          label={t(labelKey)}
          value={<DisplayCount amount={toNumber(data[key] as string) ?? 0} translation={false} />}
        />
      ))}
    </DashboardStatCard>
  );
}
