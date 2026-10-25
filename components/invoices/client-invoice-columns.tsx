"use client";

import { formatMoney } from "@/lib/helper/helper";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { InvoiceRow } from "@/components/invoices/invoice-type";

const STATUS_STYLES: Record<string, string> = {
    paid: "bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400",
    due: "bg-red-600/10 text-red-600 dark:bg-red-400/10 dark:text-red-400",
    partial: "bg-yellow-600/10 text-yellow-600 dark:bg-yellow-400/10 dark:text-yellow-400",
    partial_paid:
        "bg-yellow-600/10 text-yellow-600 dark:bg-yellow-400/10 dark:text-yellow-400",
};

function ClientInvoiceStatus({ status }: { status: InvoiceRow["status"] }) {
    const { t } = useTranslation();
    const value = status ?? "due";
    const normalizedStatus = value === "partial_paid" ? "partial" : value;

    return (
        <Badge className={cn(STATUS_STYLES[value])}>
            <span className="capitalize">
                {t(`invoice.filter.status_${normalizedStatus}`, {
                    defaultValue: normalizedStatus.replaceAll("_", " "),
                })}
            </span>
        </Badge>
    );
}

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
        cell: ({ row }) => <ClientInvoiceStatus status={row.original.status} />,
    },
];
