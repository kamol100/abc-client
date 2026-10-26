"use client";

import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { CreditCard, Printer } from "lucide-react";
import MyButton from "@/components/my-button";
import ClientInvoicePaymentDialog from "@/components/client-area/client-invoice-payment-dialog";
import { useClientInvoicePayment } from "@/components/client-area/use-client-invoice-payment";
import InvoicePrintDialog from "@/components/invoices/invoice-print-dialog";
import type {
  InvoiceDetail,
  InvoiceRow,
} from "@/components/invoices/invoice-type";

interface Props {
  invoice: InvoiceRow;
}

const ClientInvoiceRowActions: FC<Props> = ({ invoice }) => {
  const { t } = useTranslation();
  const [payOpen, setPayOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const { payment, isLoading, isError } = useClientInvoicePayment(payOpen);

  const normalizedStatus =
    invoice.status === "partial_paid" ? "partial" : invoice.status;
  const canPay = normalizedStatus === "due" || normalizedStatus === "partial";
  const canPrint =
    normalizedStatus === "paid" || normalizedStatus === "partial";

  if (!canPay && !canPrint) {
    return <div className="text-right text-muted-foreground mr-2">-</div>;
  }

  return (
    <>
      <div className="flex items-center justify-end gap-2 mr-2">
        {canPay && (
          <MyButton
            variant="outline"
            size="icon"
            onClick={() => setPayOpen(true)}
            aria-label={t("invoice.actions.pay")}
          >
            <CreditCard className="h-4 w-4" />
          </MyButton>
        )}
        {canPrint && (
          <MyButton
            variant="outline"
            size="icon"
            onClick={() => setPrintOpen(true)}
            aria-label={t("invoice.actions.print")}
          >
            <Printer className="h-4 w-4" />
          </MyButton>
        )}
      </div>

      <ClientInvoicePaymentDialog
        open={payOpen}
        onOpenChange={setPayOpen}
        data={payment}
        isLoading={isLoading}
        isError={isError}
      />

      {printOpen && (
        <InvoicePrintDialog
          invoices={[invoice as InvoiceDetail]}
          open={printOpen}
          onOpenChange={setPrintOpen}
        />
      )}
    </>
  );
};

export default ClientInvoiceRowActions;
