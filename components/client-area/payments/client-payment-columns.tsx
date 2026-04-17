"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import i18next from "i18next";
import { toNumber } from "@/lib/helper/helper";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import MyBadge, { MyBadgeType } from "@/components/my-badge";
import DisplayCount from "@/components/display-count";
import type { ClientPaymentRow } from "@/components/client-area/payments/client-payment-type";

const STATUS_BADGE_TYPE: Record<string, MyBadgeType> = {
  paid: "success",
  due: "decline",
  partial: "partial",
  partial_paid: "partial",
};

export const useClientPaymentColumns = (): ColumnDef<ClientPaymentRow>[] =>
  useMemo(
    () => [
      {
        accessorKey: "pid",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="payment.pid.label" />
        ),
        cell: ({ row }) => (
          <span className="font-medium text-sm">
            {row.original.pid ?? "—"}
          </span>
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "payment_date",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="payment.payment_date.label"
          />
        ),
        cell: ({ row }) => (
          <span className="text-sm">{row.original.payment_date ?? "—"}</span>
        ),
      },
      {
        accessorKey: "invoice.trackID",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="invoice.invoice_id" />
        ),
        cell: ({ row }) => (
          <span className="text-sm">
            {row.original.invoice?.trackID ?? "—"}
          </span>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "amount",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="payment.amount.label"
          />
        ),
        cell: ({ row }) => (
          <span className="font-semibold text-primary">
            <DisplayCount
              amount={toNumber(row.original.amount)}
              formatCurrency
            />
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="common.status" />
        ),
        cell: ({ row }) => {
          const status = row.original.status ?? "paid";
          const normalizedStatus =
            status === "partial_paid" ? "partial" : status;
          return (
            <MyBadge
              type={STATUS_BADGE_TYPE[status] ?? "success"}
              variant="soft"
            >
              <span className="capitalize">
                {i18next.t(`invoice.filter.status_${normalizedStatus}`)}
              </span>
            </MyBadge>
          );
        },
      },
    ],
    [],
  );
