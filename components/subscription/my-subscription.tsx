"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Check, CreditCard } from "lucide-react";
import { useFetch } from "@/app/actions";
import Card from "@/components/card";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import DisplayCount from "@/components/display-count";
import { InvoiceListApiResponse, InvoiceRow } from "@/components/invoices/invoice-type";
import MyBadge from "@/components/my-badge";
import MyButton from "@/components/my-button";
import MyTooltip from "@/components/my-tooltip";
import SubscriptionPayDialog from "@/components/subscription/subscription-pay-dialog";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { apiErrorKey, parseApiError, toNumber } from "@/lib/helper/helper";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";

interface PlanFeature {
  id: string;
  key: string;
  name: string;
  expired_mode: string;
}

interface MySubscriptionPayload {
  summary: {
    status: string;
    state: string;
    plan_name: string;
    ends_at: string | null;
  } | null;
  features: PlanFeature[];
}

const STATUS_BADGE_TYPE: Record<string, "success" | "decline" | "warning"> = {
  paid: "success",
  due: "decline",
  partial: "warning",
  partial_paid: "warning",
};

const canPayInvoice = (status: string | null | undefined) =>
  status === "due" || status === "partial" || status === "partial_paid";

const subscriptionInvoiceId = (invoice: { id?: unknown; uuid?: string | null }) => {
  if (typeof invoice.id === "string" && invoice.id !== "") return invoice.id;
  if (typeof invoice.uuid === "string" && invoice.uuid !== "") return invoice.uuid;
  return "";
};

function useSubscriptionInvoiceColumns(onPay: (invoiceId: string) => void): ColumnDef<InvoiceRow>[] {
  const { t } = useTranslation();

  return useMemo(
    () => [
      {
        accessorKey: "trackID",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="subscription.invoices.id" />
        ),
        cell: ({ row }) => (
          <span className="text-sm font-medium">{row.original.trackID ?? "—"}</span>
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "create_date",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="subscription.invoices.date" />
        ),
        cell: ({ row }) => (
          <span className="text-sm">{row.original.create_date ?? "—"}</span>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "invoice_type.name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="subscription.invoices.type" />
        ),
        cell: ({ row }) => (
          <span className="text-sm">{row.original.invoice_type?.name ?? "—"}</span>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "note",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="subscription.invoices.note" />
        ),
        cell: ({ row }) => (
          <MyTooltip
            content={row.original.note ?? "—"}
            placement="top"
            className="max-w-sm break-words"
          >
            <span className="max-w-[180px] cursor-default text-sm line-clamp-1">
              {row.original.note ?? "—"}
            </span>
          </MyTooltip>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "after_discount_amount",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="subscription.invoices.amount" />
        ),
        cell: ({ row }) => {
          const total = row.original.after_discount_amount ?? row.original.total_amount ?? 0;

          return (
            <p className="font-semibold text-primary">
              <DisplayCount amount={toNumber(total)} formatCurrency />
            </p>
          );
        },
        enableSorting: false,
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="subscription.invoices.status" />
        ),
        cell: ({ row }) => {
          const status = row.original.status ?? "due";
          const normalizedStatus = status === "partial_paid" ? "partial" : status;
          const type = STATUS_BADGE_TYPE[status] ?? "decline";

          return (
            <MyBadge type={type} variant="soft">
              <span className="capitalize">
                {t(`invoice.filter.status_${normalizedStatus}`, {
                  defaultValue: normalizedStatus.replace("_", " "),
                })}
              </span>
            </MyBadge>
          );
        },
        enableSorting: false,
      },
      {
        id: "actions",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            className="mr-2 flex justify-end"
            title="common.actions"
          />
        ),
        cell: ({ row }) => {
          if (!canPayInvoice(row.original.status)) {
            return <div className="mr-2 text-right text-muted-foreground">-</div>;
          }

          return (
            <div className="mr-2 flex justify-end">
              <MyButton
                icon={false}
                variant="outline"
                type="button"
                aria-label={t("subscription.invoices.pay")}
                tooltip={t("subscription.invoices.pay")}
                onClick={() => onPay(subscriptionInvoiceId(row.original))}
              >
                <CreditCard className="h-4 w-4" />
              </MyButton>
            </div>
          );
        },
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [onPay, t],
  );
}

function SubscriptionInvoiceTable() {
  const { t } = useTranslation();
  const [payInvoiceId, setPayInvoiceId] = useState<string | null>(null);
  const onPay = useCallback((invoiceId: string) => {
    if (invoiceId !== "") setPayInvoiceId(invoiceId);
  }, []);
  const columns = useSubscriptionInvoiceColumns(onPay);
  const { data, isLoading, isFetching, setCurrentPage } = useApiQuery<InvoiceListApiResponse>({
    queryKey: ["my-subscription-invoices"],
    url: "my-subscription/invoices",
  });

  const invoices = data?.data?.data ?? [];
  const pagination = data?.data?.pagination;
  const toolbarTitle = pagination?.total
    ? `${t("subscription.invoices.title")} (${pagination.total})`
    : t("subscription.invoices.title");

  return (
    <>
      <DataTable
        data={invoices}
        columns={columns}
        pagination={pagination}
        setCurrentPage={setCurrentPage}
        isLoading={isLoading}
        isFetching={isFetching}
        queryKey="my-subscription-invoices"
        toolbarTitle={toolbarTitle}
      />
      <SubscriptionPayDialog
        open={payInvoiceId !== null}
        invoiceId={payInvoiceId}
        onOpenChange={(open) => {
          if (!open) setPayInvoiceId(null);
        }}
      />
    </>
  );
}

function PaymentNotice({
  type,
  message,
}: {
  type: "success" | "error" | "info";
  message: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border px-4 py-3 text-sm",
        type === "success" &&
          "border-green-600/30 bg-green-600/10 text-green-600 dark:border-green-400/30 dark:bg-green-400/10 dark:text-green-400",
        type === "error" && "border-destructive/30 bg-destructive/10 text-destructive",
        type === "info" && "border-primary/30 bg-primary/10 text-primary",
      )}
    >
      {type === "success" ? <Check className="h-4 w-4 shrink-0" aria-hidden /> : null}
      {message}
    </div>
  );
}

function useSubscriptionPaymentNotice() {
  const { t } = useTranslation();
  const params = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const executeRef = useRef(false);

  const executeMutation = useMutation({
    mutationFn: async (paymentID: string) => {
      const response = await useFetch({
        url: "/my-subscription/invoices/pay/bkash/execute",
        method: "POST",
        data: { paymentID },
      });
      if (!response?.success) {
        throw response;
      }
      return response?.data;
    },
    onSuccess: () => {
      ["my-subscription-invoices", "my-subscription", "my-subscription-payable", "my-wallet"].forEach((key) => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
      toast.success(t("subscription.payment.success"));
      router.replace("/subscription?payment=success");
    },
    onError: (error) => {
      const keyed = apiErrorKey(error);
      const pending = keyed?.key === "subscription.payment.errors.pending";
      toast.error(
        keyed
          ? t(keyed.key, { ...keyed.params, defaultValue: keyed.message ?? t("subscription.payment.errors.failed") })
          : t(String(parseApiError(error) || "subscription.payment.errors.failed")),
      );
      router.replace(pending ? "/subscription?payment=pending" : "/subscription?payment=failure");
    },
  });

  useEffect(() => {
    const status = params.get("status");
    const paymentID = params.get("paymentID");

    if (status === "cancel") {
      router.replace("/subscription?payment=cancel");
      return;
    }
    if (status === "failure") {
      router.replace("/subscription?payment=failure");
      return;
    }
    if (status === "success" && paymentID && !executeRef.current) {
      executeRef.current = true;
      executeMutation.mutate(paymentID);
    }
  }, [executeMutation, params, router]);

  const status = params.get("status");
  const payment = params.get("payment");
  const paymentID = params.get("paymentID");

  if (executeMutation.isPending || (status === "success" && paymentID)) {
    return <PaymentNotice type="info" message={t("subscription.payment.processing")} />;
  }
  if (payment === "cancel") {
    return <PaymentNotice type="error" message={t("subscription.payment.cancelled")} />;
  }
  if (payment === "failure") {
    return <PaymentNotice type="error" message={t("subscription.payment.failure_notice")} />;
  }
  if (payment === "pending") {
    return <PaymentNotice type="info" message={t("subscription.payment.pending_notice")} />;
  }
  if (payment === "success") {
    return <PaymentNotice type="success" message={t("subscription.payment.success_notice")} />;
  }

  return null;
}

export default function MySubscription() {
  const { t } = useTranslation();
  const paymentNotice = useSubscriptionPaymentNotice();
  const { data, isLoading } = useApiQuery<ApiResponse<MySubscriptionPayload>>({
    queryKey: ["my-subscription"],
    url: "my-subscription",
    pagination: false,
  });

  const payload = data?.data;
  const summary = payload?.summary;

  return (
    <div className="space-y-4">
      {paymentNotice}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      ) : !summary ? (
        <p className="text-sm text-muted-foreground">{t("subscription.empty")}</p>
      ) : (
        <>
          <Card className="space-y-2 p-4">
            <h1 className="text-lg font-medium">{summary.plan_name}</h1>
            <p className="text-sm text-muted-foreground">
              {t("subscription.status")}: {t(`subscription.state.${summary.state}`, { defaultValue: summary.state })}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("subscription.ends_at")}: {summary.ends_at ?? "-"}
            </p>
            <div className="space-y-2">
              <h2 className="mb-3 text-sm font-medium">{t("subscription.features")}:</h2>
              <ul className="flex flex-wrap gap-2">
                {(payload?.features ?? []).map((feature) => (
                  <li key={feature.id}>
                    <MyBadge type="success" variant="soft" size="sm">
                      {feature.name}
                    </MyBadge>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
          <SubscriptionInvoiceTable />
        </>
      )}
    </div>
  );
}
