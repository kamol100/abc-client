"use client";

import { useTranslation } from "react-i18next";
import DisplayCount from "@/components/display-count";
import { DashboardStatCard, DashboardStatRow } from "@/components/dashboard/items/DashboardAccentCard";
import { DASHBOARD_CARD_ACCENTS, type DashboardCardAccent } from "@/components/dashboard/dashboard-constants";
import type { DashboardStaffInvoiceCollection } from "@/components/dashboard/dashboard-type";

type Props = {
  staffName: string;
  data: DashboardStaffInvoiceCollection;
  isLoading: boolean;
  isRefreshing: boolean;
  isError: boolean;
  accent?: DashboardCardAccent;
};

const METRICS: Array<{ labelKey: string; key: "today_amount" | "this_month_amount" | "last_month_amount" }> = [
  { labelKey: "dashboard.metrics.today", key: "today_amount" },
  { labelKey: "dashboard.metrics.this_month", key: "this_month_amount" },
  { labelKey: "dashboard.metrics.last_month", key: "last_month_amount" },
];

export default function DashboardStaffInvoiceCollectionCard({
  staffName,
  data,
  isLoading,
  isRefreshing,
  isError,
  accent = DASHBOARD_CARD_ACCENTS.staffCollection,
}: Props) {
  const { t } = useTranslation();

  return (
    <DashboardStatCard
      accent={accent}
      label={t("dashboard.cards.invoice_collection_by")}
      value={staffName}
      valueTitle={staffName}
      isLoading={isLoading || isRefreshing}
      isError={isError}
      skeletonRows={METRICS.length}
    >
      {METRICS.map(({ labelKey, key }) => (
        <DashboardStatRow
          key={key}
          label={t(labelKey)}
          value={<DisplayCount amount={data[key]} translation={false} formatCurrency />}
        />
      ))}
    </DashboardStatCard>
  );
}
