"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import DisplayCount from "@/components/display-count";
import { DashboardStatCard, DashboardStatRow } from "@/components/dashboard/items/DashboardAccentCard";
import DashboardStaffCollectionDetails from "@/components/dashboard/items/DashboardStaffCollectionDetails";
import { DASHBOARD_CARD_ACCENTS, type DashboardCardAccent } from "@/components/dashboard/dashboard-constants";
import type {
  DashboardStaffCollectionPeriod,
  DashboardStaffInvoiceCollection,
} from "@/components/dashboard/dashboard-type";
import MyButton from "@/components/my-button";
import { MyDialog } from "@/components/my-dialog";

type Props = {
  staffName: string;
  data: DashboardStaffInvoiceCollection;
  isLoading: boolean;
  isRefreshing: boolean;
  isError: boolean;
  accent?: DashboardCardAccent;
};

const METRICS: Array<{
  labelKey: string;
  key: "today_amount" | "this_month_amount" | "last_month_amount";
  period: DashboardStaffCollectionPeriod;
}> = [
  { labelKey: "dashboard.metrics.today", key: "today_amount", period: "today" },
  { labelKey: "dashboard.metrics.this_month", key: "this_month_amount", period: "this_month" },
  { labelKey: "dashboard.metrics.last_month", key: "last_month_amount", period: "last_month" },
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
  // The period whose collections are open. The last one stays in the title while the dialog closes.
  const [period, setPeriod] = useState<DashboardStaffCollectionPeriod | null>(null);
  const [open, setOpen] = useState(false);
  const openMetric = METRICS.find((metric) => metric.period === period);

  return (
    <>
      <DashboardStatCard
        accent={accent}
        label={t("dashboard.cards.invoice_collection_by")}
        value={staffName}
        valueTitle={staffName}
        isLoading={isLoading || isRefreshing}
        isError={isError}
        skeletonRows={METRICS.length}
      >
        {METRICS.map(({ labelKey, key, period: metricPeriod }) => {
          const amount = <DisplayCount amount={data[key]} translation={false} formatCurrency />;
          return (
            <DashboardStatRow
              key={key}
              label={t(labelKey)}
              value={
                data[key] > 0 ? (
                  // Same box as the plain amount, so the row keeps its height and width.
                  <MyButton
                    variant="link"
                    icon={false}
                    className="h-auto p-0 text-xs font-medium tabular-nums"
                    aria-label={t("dashboard.staff_collection.view", { period: t(labelKey) })}
                    onClick={() => {
                      setPeriod(metricPeriod);
                      setOpen(true);
                    }}
                  >
                    {amount}
                  </MyButton>
                ) : (
                  amount
                )
              }
            />
          );
        })}
      </DashboardStatCard>

      <MyDialog
        open={open}
        onOpenChange={setOpen}
        size="4xl"
        title="dashboard.staff_collection.title"
        titleValues={{ period: openMetric ? t(openMetric.labelKey) : "" }}
      >
        {period && <DashboardStaffCollectionDetails key={period} period={period} />}
      </MyDialog>
    </>
  );
}
