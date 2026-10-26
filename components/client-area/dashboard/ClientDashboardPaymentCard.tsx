"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import DisplayCount from "@/components/display-count";
import { BkashIcon } from "@/components/bkash-payment/bkash-icon";
import {
  DashboardMetricCard,
  DashboardMetricRowSkeleton,
} from "@/components/dashboard/items/DashboardMetricCard";
import { MyButton } from "@/components/my-button";
import { MyDialog } from "@/components/my-dialog";
import PayInvoice from "@/components/pay/pay-invoice";
import { toNumber } from "@/lib/helper/helper";
import type { ClientDashboardPayment } from "@/components/client-area/dashboard/client-dashboard-type";

type Props = {
  data: ClientDashboardPayment | null;
  isLoading: boolean;
  isRefreshing: boolean;
  isError: boolean;
};

export default function ClientDashboardPaymentCard({
  data,
  isLoading,
  isRefreshing,
  isError,
}: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const due = toNumber(data?.total_due);
  const canPay = due > 0 && (data?.invoice.length ?? 0) > 0;

  return (
    <>
      <DashboardMetricCard
        title={t("client_dashboard.payment.title")}
        value={
          canPay ? (
            <DisplayCount amount={due} formatCurrency />
          ) : (
            <span className="text-sm font-medium text-muted-foreground">
              {t("client_dashboard.payment.no_due")}
            </span>
          )
        }
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        isError={isError}
        skeletonBody={<DashboardMetricRowSkeleton />}
      >
        <MyButton
          type="button"
          variant="default"
          size="default"
          className="w-full"
          icon={false}
          disabled={!canPay}
          onClick={() => setOpen(true)}
        >
          <BkashIcon />
          {t("pay.result.pay_bkash")}
        </MyButton>
      </DashboardMetricCard>
      {data ? (
        <MyDialog
          open={open}
          onOpenChange={setOpen}
          size="4xl"
          title="client_dashboard.payment.dialog_title"
          description="client_dashboard.payment.dialog_description"
          showFooter={false}
        >
          <PayInvoice data={data} />
        </MyDialog>
      ) : null}
    </>
  );
}
