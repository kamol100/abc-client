"use client";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { DashboardZoneWiseTopInvoiceDueItem } from "@/components/dashboard/dashboard-type";
import MyTooltip from "@/components/my-tooltip";
import { toNumber } from "@/lib/helper/helper";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import DisplayCount from "../display-count";

export function useDashboardZoneWiseTopInvoiceDueColumns(): ColumnDef<DashboardZoneWiseTopInvoiceDueItem>[] {
  return useMemo(
    () => [
      {
        accessorKey: "zone",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="dashboard.zone_wise_top_invoice_due.columns.zone"
          />
        ),
        cell: ({ row }) => {
          const zone = row.original.zone?.trim() ?? "";
          if (!zone) {
            return <span className="text-sm">—</span>;
          }
          return (
            <div className="min-w-0 max-w-[220px]">
              <MyTooltip
                content={<span className="max-w-sm break-words text-left">{zone}</span>}
                placement="top"
                className="max-w-sm break-words"
              >
                <span className="block min-w-0 max-w-full cursor-default truncate text-sm font-medium">
                  {zone}
                </span>
              </MyTooltip>
            </div>
          );
        },
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "total_due_amount",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="dashboard.zone_wise_top_invoice_due.columns.total_due_amount"
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap font-medium text-primary">
            <DisplayCount amount={toNumber(row.original.total_due_amount)} formatCurrency />
          </span>
        ),
        enableSorting: false,
      },
    ],
    [],
  );
}
