"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import MyBadge from "@/components/my-badge";
import { toNumber } from "@/lib/helper/helper";
import { ResellerRow } from "@/components/resellers/reseller-type";
import ResellerRowActions from "@/components/resellers/reseller-row-actions";

const getTotalDue = (reseller: ResellerRow): number => {
    const due = (reseller.invoices ?? []).reduce(
        (sum, invoice) => sum + toNumber(invoice.after_discount_amount),
        0
    );
    const paid = (reseller.invoices ?? []).reduce(
        (sum, invoice) => sum + toNumber(invoice.amount_paid),
        0
    );
    return due - paid;
};

const getTotalPaid = (reseller: ResellerRow): number => {
    return (reseller.invoices ?? []).reduce(
        (sum, invoice) => sum + toNumber(invoice.amount_paid),
        0
    );
};

export function useResellerColumns(): ColumnDef<ResellerRow>[] {
    const { t } = useTranslation();

    return [
        {
            accessorKey: "name",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="reseller.table.name" />
            ),
            cell: ({ row }) => (
                <div className="capitalize font-medium">{row.original.name}</div>
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            id: "username",
            accessorKey: "user.username",
            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    title="reseller.table.username"
                />
            ),
            cell: ({ row }) => <div>{row.original.user?.username ?? "-"}</div>,
            enableSorting: false,
        },
        {
            accessorKey: "phone",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="reseller.table.phone" />
            ),
            cell: ({ row }) => <div>{row.original.phone ?? "-"}</div>,
            enableSorting: false,
        },
        {
            id: "clients",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="reseller.table.clients" />
            ),
            cell: ({ row }) => <div>{row.original.clients?.length ?? 0}</div>,
            enableSorting: false,
        },
        {
            accessorKey: "prefix",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="reseller.table.prefix" />
            ),
            cell: ({ row }) => <div>{row.original.prefix ?? "-"}</div>,
            enableSorting: false,
        },
        {
            id: "due",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="reseller.table.due" />
            ),
            cell: ({ row }) => <div>{getTotalDue(row.original)}</div>,
            enableSorting: false,
        },
        {
            id: "paid",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="reseller.table.paid" />
            ),
            cell: ({ row }) => <div>{getTotalPaid(row.original)}</div>,
            enableSorting: false,
        },
        {
            accessorKey: "status",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="common.status" />
            ),
            cell: ({ row }) => {
                const status = Number(row.original.status ?? 0) as 0 | 1;
                return (
                    <MyBadge type={status === 1 ? "success" : "error"}>
                        {status === 1 ? t("common.active") : t("common.inactive")}
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
                    className="flex justify-end capitalize mr-3"
                    title="common.actions"
                />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex items-center justify-end mr-3">
                        <ResellerRowActions row={row} />
                    </div>
                );
            },
            enableSorting: false,
        },
    ];
}
