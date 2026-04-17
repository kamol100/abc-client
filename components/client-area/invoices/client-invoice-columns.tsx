"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import i18next from "i18next";
import { formatMoney } from "@/lib/helper/helper";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import MyBadge, { MyBadgeType } from "@/components/my-badge";
import { InvoiceRow } from "@/components/invoices/invoice-type";
import ClientInvoiceRowActions from "@/components/client-area/invoices/client-invoice-row-actions";

const STATUS_BADGE_TYPE: Record<string, MyBadgeType> = {
  paid: "success",
  due: "decline",
  partial: "partial",
  partial_paid: "partial",
};

export const useClientInvoiceColumns = (): ColumnDef<InvoiceRow>[] =>
  useMemo(
    () => [
      {
        accessorKey: "trackID",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="invoice.invoice_id" />
        ),
        cell: ({ row }) => (
          <span className="font-medium text-sm">
            {row.original.trackID ?? "—"}
          </span>
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "create_date",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="invoice.date_created" />
        ),
        cell: ({ row }) => (
          <span className="text-sm">{row.original.create_date ?? "—"}</span>
        ),
      },
      {
        accessorKey: "due_date",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="invoice.date_due" />
        ),
        cell: ({ row }) => (
          <span className="text-sm">{row.original.due_date ?? "—"}</span>
        ),
      },
      {
        accessorKey: "after_discount_amount",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="invoice.amount.label" />
        ),
        cell: ({ row }) => (
          <span className="font-semibold text-primary">
            ৳{formatMoney(row.original.after_discount_amount)}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="common.status" />
        ),
        cell: ({ row }) => {
          const status = row.original.status ?? "due";
          const normalizedStatus =
            status === "partial_paid" ? "partial" : status;
          return (
            <MyBadge type={STATUS_BADGE_TYPE[status] ?? "decline"} variant="soft">
              <span className="capitalize">
                {i18next.t(`invoice.filter.status_${normalizedStatus}`)}
              </span>
            </MyBadge>
          );
        },
      },
      {
        id: "actions",
        header: () => null,
        cell: ({ row }) => <ClientInvoiceRowActions invoice={row.original} />,
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [],
  );
