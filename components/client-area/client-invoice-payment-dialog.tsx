"use client";

import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { MyDialog } from "@/components/my-dialog";
import PayInvoice from "@/components/pay/pay-invoice";
import type { ClientDashboardPayment } from "@/components/client-area/dashboard/client-dashboard-type";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ClientDashboardPayment | null;
  isLoading?: boolean;
  isError?: boolean;
};

export default function ClientInvoicePaymentDialog({
  open,
  onOpenChange,
  data,
  isLoading = false,
  isError = false,
}: Props) {
  const { t } = useTranslation();

  return (
    <MyDialog
      open={open}
      onOpenChange={onOpenChange}
      size="4xl"
      title="client_dashboard.payment.dialog_title"
      description="client_dashboard.payment.dialog_description"
      showFooter={false}
    >
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : isError || !data ? (
        <p className="py-2 text-sm text-destructive" role="alert">
          {t("common.failed_to_load_data")}
        </p>
      ) : (
        <PayInvoice data={data} />
      )}
    </MyDialog>
  );
}
