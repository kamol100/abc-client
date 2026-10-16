"use client";

import { FC, useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { FileText } from "lucide-react";
import { BkashIcon } from "@/components/bkash-payment/bkash-icon";
import RadioField from "@/components/form/radio-field";
import MyButton from "@/components/my-button";
import { MyDialog } from "@/components/my-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Form } from "@/components/ui/form";
import useApiMutation from "@/hooks/use-api-mutation";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { formatMoney, toNumber } from "@/lib/helper/helper";

const SubscriptionPaySchema = z.object({
  invoice_ids: z.array(z.string().uuid()).min(1, {
    message: "subscription.payment.errors.select_invoice",
  }),
  method: z.enum(["wallet", "bkash"]),
});

type SubscriptionPayInput = z.infer<typeof SubscriptionPaySchema>;

type PayableInvoice = {
  id: string;
  trackID: string | null;
  due_date: string | null;
  amount_due: number;
};

type PayableWallet = {
  balance: number;
  available: number;
};

type PayablePayload = {
  wallet: PayableWallet | null;
  invoices: PayableInvoice[];
};

const readAmount = (value: unknown): number => {
  if (typeof value === "number" || typeof value === "string") return toNumber(value);
  return 0;
};

const cents = (value: number) => Math.round(value * 100);

const readInvoices = (value: unknown): PayableInvoice[] => {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    if (typeof row.id !== "string" || row.id === "") return [];

    return [{
      id: row.id,
      trackID: typeof row.trackID === "string" ? row.trackID : null,
      due_date: typeof row.due_date === "string" ? row.due_date : null,
      amount_due: readAmount(row.amount_due),
    }];
  });
};

const readWallet = (value: unknown): PayableWallet | null => {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;

  return {
    balance: readAmount(row.balance),
    available: readAmount(row.available),
  };
};

interface SubscriptionPayDialogProps {
  open: boolean;
  invoiceId: string | null;
  onOpenChange: (open: boolean) => void;
}

const SubscriptionPayDialog: FC<SubscriptionPayDialogProps> = ({
  open,
  invoiceId,
  onOpenChange,
}) => {
  const { t } = useTranslation();
  const initialized = useRef(false);
  const { data, isLoading } = useApiQuery<ApiResponse<PayablePayload>>({
    queryKey: ["my-subscription-payable"],
    url: "my-subscription/invoices/payable",
    pagination: false,
    enabled: open,
  });

  const invoices = useMemo(() => readInvoices(data?.data?.invoices), [data]);
  const wallet = useMemo(() => readWallet(data?.data?.wallet), [data]);

  const form = useForm<SubscriptionPayInput>({
    resolver: zodResolver(SubscriptionPaySchema),
    defaultValues: {
      invoice_ids: [],
      method: "wallet",
    },
  });

  const { handleSubmit, setValue, watch, setError } = form;
  const selectedIds = watch("invoice_ids");
  const method = watch("method");

  useEffect(() => {
    if (!open) {
      initialized.current = false;
      return;
    }
    if (initialized.current || isLoading || !data) return;

    const ids = invoices.map((invoice) => invoice.id);
    const next = ids.length > 1 && invoiceId && ids.includes(invoiceId) ? [invoiceId] : ids;
    setValue("invoice_ids", next);
    setValue("method", "wallet");
    initialized.current = true;
  }, [open, isLoading, data, invoices, invoiceId, setValue]);

  const selectedInvoices = useMemo(
    () => invoices.filter((invoice) => selectedIds.includes(invoice.id)),
    [invoices, selectedIds],
  );
  const totalCents = selectedInvoices.reduce((sum, invoice) => sum + cents(invoice.amount_due), 0);
  const total = totalCents / 100;
  const available = wallet?.available ?? 0;
  const insufficient = method === "wallet" && wallet != null && totalCents > cents(available);
  const walletBlocked = method === "wallet" && (wallet == null || insufficient || totalCents <= 0);

  const toggleInvoice = (id: string, checked: boolean) => {
    const next = checked
      ? [...selectedIds, id]
      : selectedIds.filter((selectedId) => selectedId !== id);
    setValue("invoice_ids", next, { shouldValidate: true });
  };

  const toggleAll = (checked: boolean) => {
    setValue("invoice_ids", checked ? invoices.map((invoice) => invoice.id) : [], {
      shouldValidate: true,
    });
  };

  const walletPay = useApiMutation<unknown, { invoice_ids: string[] }>({
    url: "my-subscription/invoices/pay/wallet",
    successMessage: "subscription.payment.success",
    invalidateKeys: "my-subscription-invoices,my-subscription,my-wallet,my-subscription-payable",
    onSuccess: () => onOpenChange(false),
  });

  const bkashPay = useApiMutation<{ bkashURL?: string }, { invoice_ids: string[]; callback: string }>({
    url: "my-subscription/invoices/pay/bkash",
    onSuccess: (result) => {
      if (result.bkashURL) {
        window.location.href = result.bkashURL;
        return;
      }
              setError("method", { message: "subscription.payment.errors.bkash" });
    },
  });

  const pending = walletPay.isPending || bkashPay.isPending;
  const singleInvoice = invoices.length === 1;

  const onSubmit = (values: SubscriptionPayInput) => {
    if (values.invoice_ids.length === 0) {
      setError("invoice_ids", { message: "subscription.payment.errors.select_invoice" });
      return;
    }
    if (values.method === "wallet") {
      if (wallet == null || totalCents > cents(wallet.available)) return;
      walletPay.mutate({ invoice_ids: values.invoice_ids });
      return;
    }

    bkashPay.mutate({
      invoice_ids: values.invoice_ids,
      callback: `${window.location.origin}/subscription?pid=${Date.now()}`,
    });
  };

  return (
    <MyDialog
      open={open}
      onOpenChange={onOpenChange}
      title="subscription.payment.title"
      size="xl"
      loading={pending}
      footer={({ close, loading }) => (
        <>
          <MyButton
            action="cancel"
            variant="outline"
            size="default"
            onClick={close}
            disabled={loading}
            title="common.cancel"
          />
          {invoices.length > 0 && (
            <MyButton
              action="save"
              variant="default"
              size="default"
              onClick={handleSubmit(onSubmit)}
              loading={loading}
              disabled={walletBlocked || selectedIds.length === 0}
              icon={method !== "bkash"}
              title={method === "bkash" ? undefined : "subscription.payment.submit"}
            >
              {method === "bkash" ? (
                <>
                  <BkashIcon />
                  {t("subscription.payment.submit")}
                </>
              ) : null}
            </MyButton>
          )}
        </>
      )}
    >
      {isLoading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">{t("common.loading")}</p>
      ) : invoices.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground">
          <FileText className="h-10 w-10" />
          <p>{t("subscription.payment.empty")}</p>
        </div>
      ) : (
        <Form {...form}>
          <div className="space-y-4">
            <div className="rounded-md border">
              {!singleInvoice && (
                <div className="flex items-center gap-3 border-b bg-muted/50 px-3 py-2">
                  <Checkbox
                    checked={selectedIds.length === invoices.length}
                    onCheckedChange={(checked) => toggleAll(checked === true)}
                  />
                  <span className="text-sm font-medium">{t("subscription.payment.select_all")}</span>
                </div>
              )}
              <div className="max-h-48 divide-y overflow-y-auto">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center gap-3 px-3 py-2">
                    {!singleInvoice && (
                      <Checkbox
                        checked={selectedIds.includes(invoice.id)}
                        onCheckedChange={(checked) => toggleInvoice(invoice.id, checked === true)}
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{invoice.trackID ?? "—"}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {t("subscription.payment.due_date")}: {invoice.due_date ?? "—"}
                      </p>
                    </div>
                    <span className="whitespace-nowrap text-sm font-medium text-destructive">
                      ৳{formatMoney(invoice.amount_due)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-md bg-destructive/10 p-3 text-center">
              <p className="text-xs text-muted-foreground">{t("subscription.payment.total")}</p>
              <p className="text-base font-bold text-destructive">৳{formatMoney(total)}</p>
            </div>

            <RadioField
              name="method"
              label={{ labelText: "subscription.payment.method" }}
              options={[
                { label: "subscription.payment.wallet", value: "wallet" },
                { label: "subscription.payment.bkash", value: "bkash" },
              ]}
              defaultValue="wallet"
              direction="col"
            />

            {method === "wallet" && wallet == null && (
              <p className="text-sm text-destructive" role="alert">
                {t("subscription.payment.errors.no_wallet")}
              </p>
            )}
            {method === "wallet" && wallet != null && (
              <p className="text-sm text-muted-foreground">
                {t("subscription.payment.balance", { available: formatMoney(wallet.available) })}
              </p>
            )}
            {form.formState.errors.invoice_ids?.message && (
              <p className="text-sm text-destructive" role="alert">
                {t(String(form.formState.errors.invoice_ids.message))}
              </p>
            )}
            {form.formState.errors.method?.message && (
              <p className="text-sm text-destructive" role="alert">
                {t(String(form.formState.errors.method.message))}
              </p>
            )}
            {insufficient && (
              <p className="text-sm text-destructive" role="alert">
                {t("subscription.payment.errors.insufficient", {
                  available: formatMoney(available),
                  required: formatMoney(total),
                })}
              </p>
            )}
          </div>
        </Form>
      )}
    </MyDialog>
  );
};

export default SubscriptionPayDialog;
