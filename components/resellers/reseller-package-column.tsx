"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { formatMoney } from "@/lib/helper/helper";
import { ResellerPackageRow } from "@/components/resellers/reseller-type";

export function useResellerPackageColumns(): ColumnDef<ResellerPackageRow>[] {
    const { t } = useTranslation();

    return [
        {
            id: "sl",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="reseller.view.package_table.sl" />
            ),
            cell: ({ row }) => <div>{row.index + 1}</div>,
            enableSorting: false,
        },
        {
            accessorKey: "name",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="common.name" />
            ),
            cell: ({ row }) => <div>{row.original.name ?? t("reseller.view.not_available")}</div>,
            enableSorting: false,
        },
        {
            accessorKey: "mikrotik_profile",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="common.mikrotik_profile" />
            ),
            cell: ({ row }) => (
                <div>{row.original.mikrotik_profile ?? t("reseller.view.not_available")}</div>
            ),
            enableSorting: false,
        },
        {
            accessorKey: "bandwidth",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="common.bandwidth" />
            ),
            cell: ({ row }) => <div>{row.original.bandwidth ?? t("reseller.view.not_available")}</div>,
            enableSorting: false,
        },
        {
            id: "reseller",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="reseller.view.package_table.is_reseller" />
            ),
            cell: ({ row }) => (
                <div>{Number(row.original.is_reseller_package ?? 0) === 1 ? t("common.yes") : t("common.no")}</div>
            ),
            enableSorting: false,
        },
        {
            id: "reseller_price",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="common.buying_price" />
            ),
            cell: ({ row }) => <div>{formatMoney(row.original.buying_price)}</div>,
            enableSorting: false,
        },
    ];
}
