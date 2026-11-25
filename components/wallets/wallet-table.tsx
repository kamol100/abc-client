"use client";

import { useFetch } from "@/app/actions";
import { DataTable } from "@/components/data-table/data-table";
import type { DataTableToolbarConfig } from "@/components/data-table/toolbar/toolbar-config";
import useApiQuery, {
  PaginatedApiResponse,
} from "@/hooks/use-api-query";
import { parseApiError } from "@/lib/helper/helper";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Wallet } from "lucide-react";
import { toast } from "react-toastify";
import { BkashWalletForm } from "@/components/wallets/wallet-transaction";
import { ClientWalletColumns } from "@/components/wallets/wallet-column";
import { ClientWalletRow, ClientWalletRowSchema } from "@/components/wallets/wallet-type";
import MyWallet from "@/components/wallets/my-wallet";
import { TransactionsTable } from "@/components/wallets/transactions-table";

const StatusNotice: FC<{
  type: "success" | "error" | "info";
  message: string;
}> = ({ type, message }) => (
  <div
    className={cn(
      "rounded-md border px-4 py-3 text-sm",
      type === "success" &&
      "border-success/30 bg-success/10 theme-tone-success",
      type === "error" &&
      "border-destructive/30 bg-destructive/10 text-destructive",
      type === "info" &&
      "border-primary/30 bg-primary/10 text-primary"
    )}
  >
    {message}
  </div>
);

/** Balance chip for the toolbar center, the same style as the invoice report chips. */
const MyWalletBalanceChip: FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex h-9 items-center gap-2 whitespace-nowrap rounded-[var(--radius)] border border-border bg-background px-2.5">
      <span className="flex items-center gap-2 text-xs text-muted-foreground">
        <Wallet className="size-4 shrink-0" aria-hidden />
        {t("wallet.my_balance")}
      </span>
      <span className="flex h-5 min-w-16 items-center justify-end">
        <MyWallet
          label={false}
          amountClassName="text-sm"
          loadingClassName="h-4 w-16"
        />
      </span>
    </div>
  );
};

export const MyWalletTable: FC = () => {
  const { t } = useTranslation();
  const params = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const executeRef = useRef(false);

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

  const paymentStatus = params.get("payment");

  return (
    <div className="space-y-4">
      {executeMutation.isPending && (
        <StatusNotice type="info" message={t("wallet.messages.processing_payment")} />
      )}
      {paymentStatus === "failure" && (
        <StatusNotice type="error" message={t("wallet.messages.payment_failed")} />
      )}
      {paymentStatus === "success" && (
        <StatusNotice type="success" message={t("wallet.messages.payment_success")} />
      )}

      <TransactionsTable
        toolbarCenter={[{ key: "balance", node: <MyWalletBalanceChip /> }]}
        toolbarAdd={<BkashWalletForm />}
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

  const toolbar: DataTableToolbarConfig = {
    title: toolbarTitle,
    features: {
      columns: true,
    },
  };

  return (
    <DataTable
      data={rows}
      setFilter={setFilter}
      columns={ClientWalletColumns}
      toolbar={toolbar}
      pagination={pagination}
      setCurrentPage={setCurrentPage}
      isLoading={isLoading || isFetching}
      isFetching={isFetching}
    />
  );
};
