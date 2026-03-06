"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { formatMoney } from "@/lib/helper/helper";
import PackageRowActions from "@/components/packages/package-row-actions";
import { PackageRow } from "@/components/packages/package-type";
import { PackageFormType } from "@/components/packages/package-form-schema";

export function usePackageColumns(
  packageType: PackageFormType
): ColumnDef<PackageRow>[] {
  return useMemo(() => {
    const priceTitle =
      packageType === "reseller"
        ? "package.table.cost"
        : "package.table.price";
    const buyingPriceTitle =
      packageType === "reseller"
        ? "package.table.reseller_price"
        : "package.table.buying_price";

    return [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="package.table.name" />
        ),
        cell: ({ row }) => (
          <div className="font-medium">{row.original.name}</div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "mikrotik_profile",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="package.table.mikrotik_profile"
          />
        ),
        cell: ({ row }) => <div>{row.original.mikrotik_profile ?? "-"}</div>,
        enableSorting: false,
      },
      {
        accessorKey: "bandwidth",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="package.table.bandwidth"
          />
        ),
        cell: ({ row }) => <div>{row.original.bandwidth ?? "-"}</div>,
        enableSorting: false,
      },
      {
        accessorKey: "price",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={priceTitle} />
        ),
        cell: ({ row }) => <div>{formatMoney(row.original.price)}</div>,
        enableSorting: false,
      },
      {
        accessorKey: "buying_price",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={buyingPriceTitle} />
        ),
        cell: ({ row }) => <div>{formatMoney(row.original.buying_price)}</div>,
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
        cell: ({ row }) => (
          <PackageRowActions row={row} packageType={packageType} />
        ),
        enableSorting: false,
      },
    ];
  }, [packageType]);
}
