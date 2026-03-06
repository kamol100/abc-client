"use client";

import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/helper/helper";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../data-table/data-table-column-header";
import { Badge } from "../ui/badge";
import { InvoiceRow } from "./invoice-type";
import i18next from "i18next";

const STATUS_STYLES: Record<string, string> = {
    paid: "bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400",
    due: "bg-red-600/10 text-red-600 dark:bg-red-400/10 dark:text-red-400",
    partial: "bg-yellow-600/10 text-yellow-600 dark:bg-yellow-400/10 dark:text-yellow-400",
    partial_paid:
        "bg-yellow-600/10 text-yellow-600 dark:bg-yellow-400/10 dark:text-yellow-400",
};

export const clientInvoiceColumns: ColumnDef<InvoiceRow>[] = [
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
            const normalizedStatus = status === "partial_paid" ? "partial" : status;
            return (
                <Badge className={cn(STATUS_STYLES[status])}>
                    <span className="capitalize">
                        {i18next.t(`invoice.filter.status_${normalizedStatus}`)}
                    </span>
                </Badge>
            );
        },
    },
];
