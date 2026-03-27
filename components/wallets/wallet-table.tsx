"use client";

import { useFetch } from "@/app/actions";
import { DataTable } from "@/components/data-table/data-table";
import useApiQuery, {
  PaginatedApiResponse,
} from "@/hooks/use-api-query";
import { parseApiError } from "@/lib/helper/helper";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { BkashWalletForm, ClientWalletForm } from "./wallet-form";
import { ClientWalletColumns, WalletColumns } from "./wallet-column";
import {
  ClientWalletRow,
  ClientWalletRowSchema,
  WalletRow,
  WalletRowSchema,
} from "./wallet-type";
import MyWallet from "./my-wallet";

const StatusNotice: FC<{
  type: "success" | "error" | "info";
  message: string;
}> = ({ type, message }) => (
  <div
    className={cn(
      "rounded-md border px-4 py-3 text-sm",
      type === "success" &&
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
      type === "error" &&
      "border-destructive/30 bg-destructive/10 text-destructive",
      type === "info" &&
      "border-primary/30 bg-primary/10 text-primary"
    )}
  >
    {message}
  </div>
);

const MyWalletBalanceCard: FC = () => {
  const { t } = useTranslation();

  return (
    <div className="rounded-md border bg-card px-4 py-3 min-w-[210px]">
      <div className="text-xs text-muted-foreground">{t("wallet.my_balance")}</div>
      <MyWallet
        label={false}
        className="mt-1"
        amountClassName="text-xl"
        loadingClassName="h-7 w-28"
      />
    </div>
  );
};

export const MyWalletTable: FC = () => {
  const { t } = useTranslation();
  const params = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const executeRef = useRef(false);

  const [filterValue, setFilter] = useState<string | null>(null);
  const parsedParams = useMemo(
    () =>
      filterValue
        ? Object.fromEntries(new URLSearchParams(filterValue))
        : undefined,
    [filterValue]
  );

  const { data, isLoading, isFetching, setCurrentPage } =
    useApiQuery<PaginatedApiResponse<WalletRow>>({
      queryKey: ["wallet-transactions"],
      url: "wallets",
      params: parsedParams,
    });

  const executeMutation = useMutation({
    mutationFn: async (payload: { paymentID: string; pid: string }) => {
      const response = await useFetch({
        url: "/bkash-balance-recharge/execute",
        method: "POST",
        data: {
          ...payload,
          host: window.location.hostname,
        },
      });
      if (!response?.success) {
        throw response;
      }
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["my-wallet"] });
      toast.success(t("wallet.messages.recharge_successful"));
      router.replace("/my-wallets?payment=success");
    },
    onError: (error) => {
      toast.error(t(String(parseApiError(error) || "wallet.messages.recharge_failed")));
      router.replace("/my-wallets?payment=failure");
    },
  });

  useEffect(() => {
    const status = params.get("status");
    const paymentID = params.get("paymentID");
    const pid = params.get("pid");

    if (status === "success" && paymentID && pid && !executeRef.current) {
      executeRef.current = true;
      executeMutation.mutate({ paymentID, pid });
    }
  }, [executeMutation, params]);

  const rows = useMemo(() => {
    const incoming = data?.data?.data ?? [];
    return incoming
      .map((item) => WalletRowSchema.safeParse(item))
      .filter((item) => item.success)
      .map((item) => item.data);
  }, [data]);

  const pagination = data?.data?.pagination;
  const toolbarTitle = pagination?.total
    ? `${t("wallet.title_plural")} (${pagination.total})`
    : t("wallet.title_plural");

  const paymentStatus = params.get("payment");

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <MyWalletBalanceCard />
        <BkashWalletForm />
      </div>

      {executeMutation.isPending && (
        <StatusNotice type="info" message={t("wallet.messages.processing_payment")} />
      )}
      {paymentStatus === "failure" && (
        <StatusNotice type="error" message={t("wallet.messages.payment_failed")} />
      )}
      {paymentStatus === "success" && (
        <StatusNotice type="success" message={t("wallet.messages.payment_success")} />
      )}

      <DataTable
        data={rows}
        setFilter={setFilter}
        columns={WalletColumns}
        toggleColumns
        pagination={pagination}
        setCurrentPage={setCurrentPage}
        isLoading={isLoading}
        isFetching={isFetching}
        toolbarTitle={toolbarTitle}
      />
    </div>
  );
};

export const ClientWalletTable: FC = () => {
  const { t } = useTranslation();
  const [filterValue, setFilter] = useState<string | null>(null);

  const params = useMemo(
    () =>
      filterValue
        ? Object.fromEntries(new URLSearchParams(filterValue))
        : undefined,
    [filterValue]
  );

  const { data, isLoading, isFetching, setCurrentPage } =
    useApiQuery<PaginatedApiResponse<ClientWalletRow>>({
      queryKey: ["client-wallets"],
      url: "client-wallet",
      params,
    });

  const rows = useMemo(() => {
    const incoming = data?.data?.data ?? [];
    return incoming
      .map((item) => ClientWalletRowSchema.safeParse(item))
      .filter((item) => item.success)
      .map((item) => item.data);
  }, [data]);

  const pagination = data?.data?.pagination;
  const toolbarTitle = pagination?.total
    ? `${t("wallet.client_wallet_title")} (${pagination.total})`
    : t("wallet.client_wallet_title");

  return (
    <DataTable
      data={rows}
      setFilter={setFilter}
      columns={ClientWalletColumns}
      toggleColumns
      pagination={pagination}
      setCurrentPage={setCurrentPage}
      isLoading={isLoading || isFetching}
      isFetching={isFetching}
      toolbarTitle={toolbarTitle}
      form={ClientWalletForm}
    />
  );
};
