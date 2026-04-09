"use client";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { DashboardTopDueInvoice } from "@/components/dashboard/dashboard-type";
import MyBadge, { type MyBadgeType } from "@/components/my-badge";
import MyTooltip from "@/components/my-tooltip";
import { toNumber } from "@/lib/helper/helper";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import DisplayCount from "../display-count";

const STATUS_BADGE_TYPE: Record<string, MyBadgeType> = {
  paid: "success",
  due: "decline",
  partial: "warning",
  partial_paid: "warning",
};

export function useDashboardTopDueInvoiceColumns(): ColumnDef<DashboardTopDueInvoice>[] {
  const { t } = useTranslation();

  return useMemo(
    () => [
      {
        accessorKey: "trackID",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="invoice.invoice_id"
          />
        ),
        cell: ({ row }) => (
          <span className="font-medium text-sm">{row.original.trackID ?? "—"}</span>
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "client.name",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="dashboard.top_due_invoice.columns.client"
          />
        ),
        cell: ({ row }) => {
          const name = row.original.client?.name ?? "—";
          if (name === "—") {
            return <span className="text-sm">—</span>;
          }
          return (
            <div className="min-w-0 max-w-[220px]">
              <MyTooltip
                content={<span className="max-w-sm break-words text-left">{name}</span>}
                placement="top"
                className="max-w-sm break-words"
              >
                <span className="block min-w-0 max-w-full cursor-default truncate text-sm">
                  {name}
                </span>
              </MyTooltip>
            </div>
          );
        },
        enableSorting: false,
      },
      {
        accessorKey: "client.zone.name",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="dashboard.top_due_invoice.columns.zone"
          />
        ),
        cell: ({ row }) => {
          const zone = row.original.client?.zone;

          if (!zone) {
            return <span className="text-sm">—</span>;
          }

          const zoneNameRaw = zone.name?.trim();
          const zoneName = zoneNameRaw && zoneNameRaw.length > 0 ? zoneNameRaw : null;
          const line =
            zone.id != null
              ? zoneName
                ? `${zoneName} #${zone.id}`
                : `#${zone.id}`
              : (zoneName ?? "—");

          const tooltipBody =
            zone.id != null
              ? zoneName
                ? `${zoneName} (#${zone.id})`
                : `#${zone.id}`
              : (zoneName ?? "—");

          if (tooltipBody === "—") {
            return <span className="text-sm">—</span>;
          }

          return (
            <div className="min-w-0 max-w-[220px]">
              <MyTooltip
                content={<span className="max-w-sm break-words text-left">{tooltipBody}</span>}
                placement="top"
                className="max-w-sm break-words"
              >
                <span className="block min-w-0 max-w-full cursor-default truncate text-sm font-medium">
                  {line}
                </span>
              </MyTooltip>
            </div>
          );
        },
        enableSorting: false,
      },
      {
        accessorKey: "total_amount",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="dashboard.top_due_invoice.columns.amount"
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap font-medium text-primary">
            <DisplayCount amount={toNumber(row.original.total_amount)} formatCurrency />
          </span>
        ),
      },
      {
        accessorKey: "due_date",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="dashboard.top_due_invoice.columns.due_date"
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm">{row.original.due_date ?? "—"}</span>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="dashboard.top_due_invoice.columns.status"
          />
        ),
        cell: ({ row }) => {
          const status = row.original.status;
          const normalizedStatus = status === "partial_paid" ? "partial" : status;

          if (!normalizedStatus) {
            return <span className="text-sm">—</span>;
          }

          return (
            <MyBadge type={STATUS_BADGE_TYPE[status ?? ""] ?? "info"} variant="soft">
              <span className="capitalize">
                {t(`invoice.filter.status_${normalizedStatus}`, {
                  defaultValue: normalizedStatus.replaceAll("_", " "),
                })}
              </span>
            </MyBadge>
          );
        },
        enableSorting: false,
      },
    ],
    [t],
  );
}
