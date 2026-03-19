"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import MyBadge from "@/components/my-badge";
import { ResellerClientRow } from "@/components/resellers/reseller-type";

export function useResellerClientColumns(): ColumnDef<ResellerClientRow>[] {
    const { t } = useTranslation();

    return [
        {
            id: "sl",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="reseller.view.client_table.sl" />
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
            accessorKey: "phone",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="common.phone" />
            ),
            cell: ({ row }) => <div>{row.original.phone ?? t("reseller.view.not_available")}</div>,
            enableSorting: false,
        },
        {
            id: "package",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="common.package" />
            ),
            cell: ({ row }) => <div>{row.original.package?.name ?? t("reseller.view.not_available")}</div>,
            enableSorting: false,
        },
        {
            id: "network",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="common.network" />
            ),
            cell: ({ row }) => <div>{row.original.network?.name ?? t("reseller.view.not_available")}</div>,
            enableSorting: false,
        },
        {
            id: "zone",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="common.zone" />
            ),
            cell: ({ row }) => <div>{row.original.zone?.name ?? t("reseller.view.not_available")}</div>,
            enableSorting: false,
        },
        {
            accessorKey: "status",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="common.status" />
            ),
            cell: ({ row }) => {
                const isActive = Number(row.original.status ?? 0) === 1;
                return (
                    <MyBadge type={isActive ? "success" : "error"}>
                        {isActive ? t("common.active") : t("common.inactive")}
                    </MyBadge>
                );
            },
            enableSorting: false,
        },
    ];
}
