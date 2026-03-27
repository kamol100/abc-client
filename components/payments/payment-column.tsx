"use client";

import { cn } from "@/lib/utils";
import { formatMoney, toNumber } from "@/lib/helper/helper";
import { ColumnDef } from "@tanstack/react-table";
import MyButton from "../my-button";
import { DataTableColumnHeader } from "../data-table/data-table-column-header";
import { Badge } from "../ui/badge";
import { DeleteModal } from "../delete-modal";
import { PaymentRow } from "./payment-type";
import DisplayCount from "../display-count";

const STATUS_STYLES: Record<string, string> = {
    paid: "bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400",
    due: "bg-red-600/10 text-red-600 dark:bg-red-400/10 dark:text-red-400",
    partial_paid:
        "bg-yellow-600/10 text-yellow-600 dark:bg-yellow-400/10 dark:text-yellow-400",
};

export const PaymentColumns: ColumnDef<PaymentRow>[] = [
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
            <span className="text-sm">{row.original.payment_date}</span>
        ),
    },
    {
        accessorKey: "client.name",
        header: ({ column }) => (
            <DataTableColumnHeader
                column={column}
                title="payment.client.label"
            />
        ),
        cell: ({ row }) => (
            <div className="w-[120px] capitalize truncate">
                {row.original.client?.name ?? "—"}
            </div>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "zone.name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="zone.name.label" />
        ),
        cell: ({ row }) => (
            <span className="text-sm">
                {row.original.zone?.name ?? "—"}
            </span>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "staff.name",
        header: ({ column }) => (
            <DataTableColumnHeader
                column={column}
                title="payment.collect_by.label"
            />
        ),
        cell: ({ row }) => (
            <span className="text-sm">
                {row.original.staff?.name ?? "—"}
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
                <DisplayCount amount={toNumber(row.original.amount)} formatCurrency />
            </span>
        ),
    },
    {
        accessorKey: "fund.name",
        header: ({ column }) => (
            <DataTableColumnHeader
                column={column}
                title="payment.fund.label"
            />
        ),
        cell: ({ row }) => (
            <span className="text-sm">
                {row.original.fund?.name ?? "—"}
            </span>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "status",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="common.status" />
        ),
        cell: ({ row }) => {
            const status = row.original.status ?? "paid";
            return (
                <Badge className={cn(STATUS_STYLES[status])}>
                    <span className="capitalize">
                        {status.replace("_", " ")}
                    </span>
                </Badge>
            );
        },
    },
    {
        id: "actions",
        header: ({ column }) => (
            <DataTableColumnHeader
                column={column}
                title="common.actions"
                className="flex justify-end mr-2"
            />
        ),
        cell: ({ row }) => {
            const payment = row.original;
            const paymentId = String(payment.id);
            return (
                <div className="flex items-end justify-end gap-1 mr-2">
                    <DeleteModal
                        api_url={`/payments/${paymentId}`}
                        keys="payments"
                    />
                </div>
            );
        },
    },
];
