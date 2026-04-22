"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Loader2, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MyButton } from "@/components/my-button";
import { formatMoney, toNumber } from "@/lib/helper/helper";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBkashPayment } from "@/components/bkash-payment/use-bkash-payment";
import type { ClientPaymentData } from "@/types/pay-types";
import DisplayCount from "@/components/display-count";
import Image from "next/image";

type PayInvoiceProps = {
  data: ClientPaymentData;
  onSearchAgain: () => void;
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-2 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

export default function PayInvoice({ data, onSearchAgain }: PayInvoiceProps) {
  const { t } = useTranslation();
  const hasInvoices = data.invoice.length > 0;
  const { startPayment, isCreating } = useBkashPayment();

  const totalDiscountByInvoiceId = useMemo(() => {
    const totals = new Map<string, number>();
    for (const inv of data.invoice) {
      totals.set(inv.id, toNumber(inv.discount) + toNumber(inv.line_total_discount));
    }
    return totals;
  }, [data.invoice]);

  const invoiceItemTotalByInvoiceId = useMemo(() => {
    const totals = new Map<string, number>();
    for (const inv of data.invoice) {
      totals.set(inv.id, toNumber(inv.after_discount_amount) + toNumber(inv.discount) + toNumber(inv.line_total_discount));
    }
    return totals;
  }, [data.invoice]);

  const invoiceTotal = useMemo(() => {
    return data.invoice.reduce((acc, inv) => acc + toNumber(inv.after_discount_amount) + toNumber(inv.discount) + toNumber(inv.line_total_discount), 0);
  }, [data.invoice]);
  const invoiceDiscountTotal = useMemo(() => {
    return data.invoice.reduce((acc, inv) => acc + toNumber(inv.discount) + toNumber(inv.line_total_discount), 0);
  }, [data.invoice]);

  const handlePayBkash = () => {
    if (!hasInvoices || Number(data.total_due) <= 0) return;
    const invoiceTrack = data.invoice.map((inv) => inv.invoice_id).join(",");
    startPayment({
      clientId: data.id,
      amount: data.total_due,
      invoiceTrack,
    });
  };
  return (
    <div className="mx-auto w-full max-w-3xl space-y-2">
      <Card>
        <CardContent className="space-y-2 pt-3 px-3">
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="space-y-1">
              <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <User className="size-3" />
                {t("pay.result.client_info")}
              </div>
              <InfoRow label={t("common.name")} value={data.name} />
              <InfoRow label={t("common.phone")} value={data.phone} />
              <InfoRow label={t("pay.result.package")} value={data?.package?.name} />
              {data?.package?.price != null && (
                <InfoRow
                  label={t("pay.result.price")}
                  value={formatMoney(data.package.price)}
                />
              )}
            </div>
          </div>
          <Separator />
          {hasInvoices ? (
            <div className="space-y-3">
              <div className="overflow-x-auto rounded-md border">
                <Table className=" text-xs">
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("pay.result.invoice_id")}</TableHead>
                      <TableHead>{t("pay.result.invoice_type")}</TableHead>
                      <TableHead>{t("pay.result.month")}</TableHead>
                      <TableHead className="text-right">{t("pay.result.discount")}</TableHead>
                      <TableHead className="text-right">{t("pay.result.amount")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.invoice.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-mono">#{invoice.invoice_id}</TableCell>
                        <TableCell>{invoice.invoice_type ?? "-"}</TableCell>
                        <TableCell>{t(`common.${invoice.month.toLowerCase()}`)}</TableCell>
                        <TableCell className="text-right">
                          <DisplayCount
                            amount={totalDiscountByInvoiceId.get(invoice.id) ?? 0}
                            formatCurrency
                          />
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          <DisplayCount
                            amount={invoiceItemTotalByInvoiceId.get(invoice.id) ?? 0}
                            formatCurrency
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="rounded-md border py-8 text-center text-sm text-muted-foreground">
              {t("pay.result.no_invoices")}
            </div>
          )}
          <div className="ml-auto w-full max-w-sm rounded-md border bg-muted/20 p-3">
            <div className="mb-2 text-sm font-semibold">{t("pay.result.summary")}</div>
            <div className="space-y-1.5">
              <InfoRow label={t("pay.result.invoice_total")} value={<DisplayCount amount={invoiceTotal} formatCurrency />} />
              <InfoRow
                label={t("pay.result.total_discount")}
                value={<DisplayCount amount={invoiceDiscountTotal} formatCurrency />}
              />
              <Separator />
              <InfoRow
                label={t("pay.result.total_due")}
                value={<DisplayCount amount={toNumber(data.total_due)} formatCurrency />}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex flex-col gap-2 sm:flex-row">
        <MyButton
          type="button"
          variant="outline"
          size="default"
          className="w-full sm:flex-1"
          onClick={onSearchAgain}
          icon={false}
        >
          <ArrowLeft className="size-4" />
          {t("pay.result.back")}
        </MyButton>
        <MyButton
          type="button"
          variant="default"
          size="default"
          className="w-full sm:flex-1 inline-flex items-center justify-center gap-2"
          onClick={handlePayBkash}
          disabled={isCreating || !hasInvoices || Number(data.total_due) <= 0}
          icon={false}
        >
          {isCreating ? (
            <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
          ) : (
            <Image
              src="/static/bkash.png"
              alt=""
              width={22}
              height={22}
              className="size-[22px] shrink-0 object-contain"
            />
          )}
          {isCreating ? t("pay.bkash.creating") : t("pay.result.pay_bkash")}
        </MyButton>
      </div>
    </div>
  );
}
