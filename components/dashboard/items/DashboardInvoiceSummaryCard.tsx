"use client";

import { useTranslation } from "react-i18next";
import DisplayCount from "@/components/display-count";
import { DashboardStatCard, DashboardStatRow } from "@/components/dashboard/items/DashboardAccentCard";
import { DASHBOARD_CARD_ACCENTS, type DashboardCardAccent } from "@/components/dashboard/dashboard-constants";
import type { DashboardInvoiceSummary } from "@/components/dashboard/dashboard-type";
import { toNumber } from "@/lib/helper/helper";

type Props = {
  data: DashboardInvoiceSummary;
  isLoading: boolean;
  isRefreshing: boolean;
  isError: boolean;
  titleKey?: string;
  accent?: DashboardCardAccent;
};

const METRICS: Array<{ labelKey: string; key: keyof DashboardInvoiceSummary }> = [
  { labelKey: "dashboard.metrics.this_month", key: "this_month_invoice_amount" },
  { labelKey: "dashboard.metrics.last_month", key: "last_month_invoice_amount" },
];

export default function DashboardInvoiceSummaryCard({
  data,
  isLoading,
  isRefreshing,
  isError,
  titleKey = "dashboard.cards.invoices",
  accent = DASHBOARD_CARD_ACCENTS.invoice,
}: Props) {
  const { t } = useTranslation();

  return (
    <DashboardStatCard
      accent={accent}
      label={t(titleKey)}
      value={<DisplayCount amount={data.total_invoice_amount} translation={false} />}
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
