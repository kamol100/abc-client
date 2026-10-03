"use client";

import { useFetch } from "@/app/actions";
import { ClientRow, getClientId } from "@/components/clients/client-type";
import DisplayMoney from "@/components/display-money";
import InputField from "@/components/form/input-field";
import MyButton from "@/components/my-button";
import { MyDialog } from "@/components/my-dialog";
import { Form } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import {
  calculateRechargeCost,
  hasSufficientWalletBalance,
  parsePositiveAmount,
} from "@/components/wallets/reseller-recharge-cost";
import {
  ResellerClientRechargeFormInput,
  ResellerClientRechargeFormSchema,
  ResellerClientRechargePayload,
  WalletRechargeFormInput,
  WalletRechargeFormSchema,
} from "@/components/wallets/wallet-type";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { useMyWallet } from "@/hooks/use-my-wallet";
import { parseApiError } from "@/lib/helper/helper";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format, isValid, parse } from "date-fns";
import { useRouter } from "next/navigation";
import { FC, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
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

interface ResellerRechargeDialogProps {
  client: ClientRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SummaryItemProps = {
  label: string;
  value: ReactNode;
};

const SummaryItem: FC<SummaryItemProps> = ({ label, value }) => (
  <div className="min-w-0 space-y-0.5">
    <dt className="text-xs text-muted-foreground">{label}</dt>
    <dd className="break-words text-sm font-medium text-foreground">{value}</dd>
  </div>
);

function displayText(value: string | null | undefined, empty: string): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : empty;
}

function formatTerminationDate(value: string | null | undefined, empty: string): string {
  const trimmed = value?.trim();
  if (!trimmed) return empty;

  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed);
  const date = isoMatch
    ? new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]))
    : parse(trimmed, "dd-MMM-yy", new Date());

  if (!isValid(date)) return trimmed;
  return format(date, "dd MMM yyyy");
}

function MoneyValue({
  amount,
  empty,
}: {
  amount: number | string | null | undefined;
  empty: string;
}) {
  if (amount == null || amount === "") return empty;
  const parsed = Number(amount);
  if (!Number.isFinite(parsed)) return empty;

  return (
    <DisplayMoney
      amount={parsed}
      formatCurrency
      className="font-medium tabular-nums"
    />
  );
}

export const ResellerRechargeDialog: FC<ResellerRechargeDialogProps> = ({
  client,
  open,
  onOpenChange,
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const submitRef = useRef<HTMLInputElement>(null);
  const clientId = getClientId(client) ?? "";
  const emptyValue = t("wallet.empty_value");

  const clientDetails = useApiQuery<ApiResponse<ClientRow>>({
    queryKey: ["clients", clientId, "recharge"],
    url: `clients/${clientId}`,
    pagination: false,
    enabled: open && clientId.length > 0,
  });
  const details = clientDetails.data?.data;
  const packageInfo = details?.package ?? client.package;
  const buyingPrice = packageInfo?.buying_price;
  const address =
    details?.current_address ??
    client.current_address ??
    details?.permanent_address ??
    client.permanent_address;

  const {
    balance: walletBalance,
    isSuccess: walletLoaded,
    isLoading: walletLoading,
    isError: walletError,
  } = useMyWallet(open);

  const defaultValues = useMemo<ResellerClientRechargeFormInput>(
    () => ({
      clientUuid: clientId,
      days: 1,
    }),
    [clientId],
  );

  const form = useForm<ResellerClientRechargeFormInput>({
    resolver: zodResolver(ResellerClientRechargeFormSchema),
    mode: "onChange",
    defaultValues,
  });

  const daysValue = form.watch("days");
  const dayCount = parsePositiveAmount(daysValue);
  const rechargeCost = calculateRechargeCost(buyingPrice, daysValue);
  const walletReady = walletLoaded && !walletLoading;
  const sufficientBalance = hasSufficientWalletBalance(
    rechargeCost,
    walletReady ? walletBalance : null,
  );

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, defaultValues, form]);

  const rechargeMutation = useMutation({
    mutationFn: async (payload: ResellerClientRechargePayload) => {
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
      queryClient.invalidateQueries({ queryKey: ["client-wallets"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["my-wallet"] });
      toast.success(t("wallet.messages.client_recharge_success"));
      onOpenChange(false);
      form.reset(defaultValues);
    },
    onError: (error) => {
      toast.error(
        t(String(parseApiError(error) || "wallet.messages.client_recharge_failed")),
      );
    },
  });

  const canSubmit =
    dayCount != null &&
    rechargeCost != null &&
    sufficientBalance &&
    !rechargeMutation.isPending;

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      form.reset(defaultValues);
    }
  };

  const onSubmit = (values: ResellerClientRechargeFormInput) => {
    const cost = calculateRechargeCost(buyingPrice, values.days);
    const days = parsePositiveAmount(values.days);
    if (days == null || cost == null) {
      form.setError("days", { message: "wallet.recharge_cost.errors.invalid_package" });
      return;
    }
    if (!hasSufficientWalletBalance(cost, walletReady ? walletBalance : null)) {
      form.setError("days", { message: "wallet.messages.insufficient_balance" });
      return;
    }

    rechargeMutation.mutate({
      clientUuid: values.clientUuid,
      cost,
      days,
      note: "",
    });
  };

  let blockingMessage: string | null = null;
  if (walletError) {
    blockingMessage = t("wallet.messages.wallet_unavailable");
  } else if (!clientDetails.isLoading && dayCount != null && rechargeCost == null) {
    blockingMessage = t("wallet.recharge_cost.errors.invalid_package");
  } else if (walletReady && rechargeCost != null && !sufficientBalance) {
    blockingMessage = t("wallet.messages.insufficient_balance");
  }

  return (
    <MyDialog
      open={open}
      onOpenChange={handleOpenChange}
      size="2xl"
      title="wallet.client_recharge_title"
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
            disabled={!canSubmit}
          >
            {t("common.save")}
          </MyButton>
        </>
      )}
    >
      <div className="space-y-4">
        <dl className="grid grid-cols-1 gap-3 rounded-md border bg-muted/30 p-3 sm:grid-cols-2">
          <SummaryItem
            label={t("wallet.client_summary.name")}
            value={displayText(details?.name ?? client.name, emptyValue)}
          />
          <SummaryItem
            label={t("wallet.client_summary.pppoe_username")}
            value={displayText(details?.pppoe_username ?? client.pppoe_username, emptyValue)}
          />
          <SummaryItem
            label={t("wallet.client_summary.phone")}
            value={displayText(details?.phone ?? client.phone, emptyValue)}
          />
          <SummaryItem
            label={t("wallet.client_summary.address")}
            value={displayText(address, emptyValue)}
          />
          <SummaryItem
            label={t("wallet.client_summary.package")}
            value={displayText(packageInfo?.name, emptyValue)}
          />
          <SummaryItem
            label={t("wallet.client_summary.bandwidth")}
            value={displayText(packageInfo?.bandwidth, emptyValue)}
          />
          <SummaryItem
            label={t("wallet.client_summary.buying_price")}
            value={<MoneyValue amount={buyingPrice} empty={emptyValue} />}
          />
          <SummaryItem
            label={t("wallet.client_summary.termination_date")}
            value={formatTerminationDate(
              details?.termination_date ?? client.termination_date,
              emptyValue,
            )}
          />
        </dl>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-3 rounded-md border bg-muted/30 p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground">
                  {t("wallet.balance.label")}
                </span>
                {walletLoading ? (
                  <Skeleton className="h-7 w-28" />
                ) : walletReady ? (
                  <DisplayMoney
                    amount={walletBalance}
                    formatCurrency
                    className="text-lg font-semibold tabular-nums text-primary"
                  />
                ) : (
                  <span className="text-sm text-muted-foreground">{emptyValue}</span>
                )}
              </div>

              <InputField
                name="days"
                type="number"
                label={{ labelText: "wallet.days.label", mandatory: true }}
                placeholder="wallet.days.placeholder"
              />

              <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
                <span className="text-sm font-medium">{t("wallet.recharge_cost.label")}</span>
                {rechargeCost == null ? (
                  <span className="text-sm text-muted-foreground">{emptyValue}</span>
                ) : (
                  <DisplayMoney
                    amount={rechargeCost}
                    formatCurrency
                    className="text-lg font-semibold tabular-nums"
                  />
                )}
              </div>

              {blockingMessage ? (
                <p className="text-sm text-destructive" role="alert">
                  {blockingMessage}
                </p>
              ) : null}
            </div>
            <input ref={submitRef} type="submit" className="hidden" />
          </form>
        </Form>
      </div>
    </MyDialog>
  );
};
