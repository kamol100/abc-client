"use client";

import dynamic from "next/dynamic";
import { useFetch } from "@/app/actions";
import MyButton from "@/components/my-button";
import { MyDialog } from "@/components/my-dialog";
import InputField from "@/components/form/input-field";
import TextareaField from "@/components/form/textarea-field";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { parseApiError } from "@/lib/helper/helper";
import { cn } from "@/lib/utils";
import {
  ClientWalletRechargeFormInput,
  ClientWalletRechargeFormSchema,
  WalletRechargeFormInput,
  WalletRechargeFormSchema,
} from "@/components/wallets/wallet-type";
import { BkashIcon } from "@/components/bkash-payment/bkash-icon";
import RadioField from "@/components/form/radio-field";
import { Skeleton } from "@/components/ui/skeleton";
import { INVOICE_PAYMENT_FUNDS_API, paymentFundAccess } from "@/components/invoices/payment-fund-access";
import { usePermissions, useProfile } from "@/context/app-provider";

// `loading` gives the dropdown its own Suspense boundary and holds its space, so the
// dialog does not jump (or hide what opened it) while the dropdown code loads.
const SelectDropdown = dynamic(() => import("@/components/select-dropdown"), {
  loading: () => (
    <div className="space-y-2" aria-hidden>
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-9 w-full rounded-md" />
    </div>
  ),
});
const pad2 = (value: number): string => value.toString().padStart(2, "0");

export const BkashWalletForm: FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const submitRef = useRef<HTMLInputElement>(null);

  const form = useForm<WalletRechargeFormInput>({
    resolver: zodResolver(WalletRechargeFormSchema),
    mode: "onChange",
    defaultValues: { balance: 0 },
  });

  const rechargeMutation = useMutation({
    mutationFn: async (payload: WalletRechargeFormInput) => {
      const now = new Date();
      const pid = Date.now();
      const invoice = `RC-${pad2(now.getHours())}${pad2(now.getMinutes())}`;
      const host = window.location.hostname;
      const origin = window.location.origin;

      const result = await useFetch({
        url: "/bkash-balance-recharge/create",
        method: "POST",
        data: {
          ...payload,
          amount: payload.balance,
          pid,
          invoice,
          host,
          callback: `${origin}/my-wallets?pid=${pid}`,
        },
      });

      if (!result?.success) {
        throw result;
      }

      return result?.data as { bkashURL?: string };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["my-wallet"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-transactions"] });
      if (data?.bkashURL) {
        window.location.href = data.bkashURL;
        return;
      }
      toast.success(t("wallet.messages.redirecting_to_payment"));
      router.replace("/my-wallets");
    },
    onError: (error) => {
      toast.error(t(String(parseApiError(error) || "wallet.messages.recharge_failed")));
    },
  });
  //Bkash Wallet Recharge Dialog
  return (
    <MyDialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          form.reset({ balance: 0 });
        }
      }}
      size="md"
      title="wallet.recharge_title"
      trigger={
        <MyButton size="default" variant="default">
          <BkashIcon />
          {t("wallet.recharge_with_bkash")}
        </MyButton>
      }
      footer={({ close }) => (
        <>
          <MyButton type="button" variant="outline" onClick={close}>
            {t("common.cancel")}
          </MyButton>
          <MyButton
            type="button"
            variant="default"
            onClick={() => submitRef.current?.click()}
            loading={rechargeMutation.isPending}
          >
            <BkashIcon />
            {t("wallet.pay_with_bkash")}
          </MyButton>
        </>
      )}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit((values) => rechargeMutation.mutate(values))}>
          <div className="py-4">
            <InputField
              name="balance"
              type="number"
              label={{ labelText: "wallet.amount.label", mandatory: true }}
              placeholder="wallet.amount.placeholder"
            />
          </div>
          <input ref={submitRef} type="submit" className="hidden" />
        </form>
      </Form>
    </MyDialog>
  );
};

/** Who the advance is for, shown at the top of the dialog. */
interface WalletClientInfo {
  name?: string | null;
  phone?: string | null;
  pppoe_username?: string | null;
}

interface ClientWalletRechargeDialogProps {
  clientUuid: string;
  client: WalletClientInfo | null | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ClientInfoItem: FC<{ label: string; value?: string | null; className?: string }> = ({
  label,
  value,
  className,
}) => (
  <div className="min-w-0">
    <dt className="text-xs text-muted-foreground">{label}</dt>
    <dd className={cn("truncate text-sm font-medium", className)}>{value || "—"}</dd>
  </div>
);

export const ClientWalletRechargeDialog: FC<ClientWalletRechargeDialogProps> = ({
  clientUuid,
  client,
  open,
  onOpenChange,
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const submitRef = useRef<HTMLInputElement>(null);
  const { hasPermission } = usePermissions();
  const { profile } = useProfile();
  // The same fund rules as collecting an invoice payment (the API checks them too).
  const { assignedFundId, lockFund, blockSubmit, showUnassignedWarning } = paymentFundAccess({
    staff: profile.staff,
    canChangeFund: hasPermission("invoices.change-fund"),
    canUseBkashFund: hasPermission("invoices.bkash-fund-access"),
  });

  const defaultValues = useMemo<ClientWalletRechargeFormInput>(
    () => ({
      clientUuid: clientUuid,
      balance: 0,
      // The staff member's own fund, when they have one; otherwise empty, so the placeholder shows.
      fund_id: assignedFundId ?? undefined,
      confirmation_sms: 0,
      note: "",
    }),
    [clientUuid, assignedFundId]
  );

  const form = useForm<ClientWalletRechargeFormInput>({
    resolver: zodResolver(ClientWalletRechargeFormSchema),
    mode: "onChange",
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, defaultValues, form]);

  const rechargeMutation = useMutation({
    mutationFn: async (payload: ClientWalletRechargeFormInput) => {
      const result = await useFetch({
        url: "/client-wallet-recharge",
        method: "POST",
        data: payload,
      });
      if (!result?.success) {
        throw result;
      }
      return result?.data;
    },
    onSuccess: () => {
      // The advance also creates an invoice, a payment and a fund deposit.
      for (const key of ["client-wallets", "clients", "invoices", "payments", "wallet-transactions", "funds"]) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
      toast.success(t("wallet.messages.client_recharge_success"));
      onOpenChange(false);
      form.reset(defaultValues);
    },
    onError: (error) => {
      toast.error(
        t(String(parseApiError(error) || "wallet.messages.client_recharge_failed"))
      );
    },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      form.reset(defaultValues);
    }
  };

  //Wallet Transaction Modal
  return (
    <MyDialog
      open={open}
      onOpenChange={handleOpenChange}
      size="md"
      title="wallet.advance_payment_title"
      footer={({ close }) => (
        <>
          <MyButton type="button" variant="outline" onClick={close}>
            {t("common.cancel")}
          </MyButton>
          <MyButton
            type="button"
            variant="default"
            action="save"
            onClick={() => submitRef.current?.click()}
            loading={rechargeMutation.isPending}
            disabled={blockSubmit}
          >
            {t("common.save")}
          </MyButton>
        </>
      )}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit((values) => rechargeMutation.mutate(values))}>
          <div className="space-y-4">
            <dl className="grid grid-cols-1 gap-3 rounded-md border bg-muted/40 p-3 sm:grid-cols-3">
              <ClientInfoItem label={t("common.name")} value={client?.name} className="capitalize" />
              <ClientInfoItem label={t("common.phone")} value={client?.phone} />
              <ClientInfoItem label={t("client.pppoe_username.label")} value={client?.pppoe_username} />
            </dl>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InputField
                name="balance"
                type="number"
                label={{ labelText: "wallet.amount.label", mandatory: true }}
                placeholder="wallet.amount.placeholder"
              />
              <div className="flex flex-col gap-2">
                <SelectDropdown
                  name="fund_id"
                  label={{ labelText: "wallet.fund.label", mandatory: true }}
                  placeholder="wallet.fund.placeholder"
                  api={INVOICE_PAYMENT_FUNDS_API}
                  isDisabled={lockFund}
                  isClearable={!lockFund}
                />
                {showUnassignedWarning && (
                  <p role="alert" className="text-sm text-destructive">
                    {t("invoice.bulk_pay.fund.errors.unassigned")}
                  </p>
                )}
              </div>
            </div>
            <RadioField
              name="confirmation_sms"
              label={{ labelText: "wallet.confirmation_sms.label" }}
              options={[
                { label: "common.yes", value: 1 },
                { label: "common.no", value: 0 },
              ]}
              direction="row"
              defaultValue="0"
            />
            <TextareaField
              name="note"
              rows={2}
              label={{ labelText: "wallet.note.label" }}
              placeholder="wallet.note.placeholder"
            />
          </div>
          <input ref={submitRef} type="submit" className="hidden" />
        </form>
      </Form>
    </MyDialog>
  );
};
