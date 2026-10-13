"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ColumnDef } from "@tanstack/react-table";
import { CreditCard } from "lucide-react";
import Card from "@/components/card";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import DisplayCount from "@/components/display-count";
import { InvoiceListApiResponse, InvoiceRow } from "@/components/invoices/invoice-type";
import MyBadge from "@/components/my-badge";
import MyButton from "@/components/my-button";
import MyTooltip from "@/components/my-tooltip";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { toNumber } from "@/lib/helper/helper";

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

function useSubscriptionInvoiceColumns(): ColumnDef<InvoiceRow>[] {
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
    [t],
  );
}

function SubscriptionInvoiceTable() {
  const { t } = useTranslation();
  const columns = useSubscriptionInvoiceColumns();
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
  );
}

export default function MySubscription() {
  const { t } = useTranslation();
  const { data, isLoading } = useApiQuery<ApiResponse<MySubscriptionPayload>>({
    queryKey: ["my-subscription"],
    url: "my-subscription",
    pagination: false,
  });

  const payload = data?.data;
  const summary = payload?.summary;

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">{t("common.loading")}</p>;
  }

  if (!summary) {
    return <p className="text-sm text-muted-foreground">{t("subscription.empty")}</p>;
  }

  return (
    <div className="space-y-4">
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
    </div>
  );
}
