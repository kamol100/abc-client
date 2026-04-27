"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ColumnDef } from "@tanstack/react-table";
import { formatMoney, toNumber } from "@/lib/helper/helper";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import MyBadge from "@/components/my-badge";
import MyTooltip from "@/components/my-tooltip";
import { InvoiceRow } from "./invoice-type";
import InvoiceRowActions from "./invoice-row-actions";
import DisplayCount from "../display-count";

const STATUS_BADGE_TYPE: Record<string, "success" | "decline" | "warning"> = {
    paid: "success",
    due: "decline",
    partial: "warning",
    partial_paid: "warning",
};

export const useInvoiceColumns = (): ColumnDef<InvoiceRow>[] => {
    const { t } = useTranslation();

    return useMemo(
        () => [
            {
                accessorKey: "trackID",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="invoice.invoice_id" />
                ),
                cell: ({ row }) => (
                    <span className="font-medium text-sm">{row.original.trackID ?? "—"}</span>
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
                accessorKey: "invoice_type.name",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="invoice.type.label" />
                ),
                cell: ({ row }) => (
                    <span className="text-sm">{row.original.invoice_type?.name ?? "—"}</span>
                ),
                enableSorting: false,
            },
            {
                accessorKey: "client.name",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="invoice.client.label" />
                ),
                cell: ({ row }) => (
                    <span className="text-sm">{row.original.client?.name ?? "—"}</span>
                ),
                enableSorting: false,
            },
            {
                accessorKey: "zone.name",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="invoice.zone" />
                ),
                cell: ({ row }) => (
                    <span className="text-sm">{row.original.zone?.name ?? "—"}</span>
                ),
                enableSorting: false,
            },
            {
                accessorKey: "note",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="invoice.note.label" />
                ),
                cell: ({ row }) => (
                    <MyTooltip
                        content={row.original.note ?? "—"}
                        placement="top"
                        className="max-w-sm break-words"
                    >
                        <span className="text-sm line-clamp-1 cursor-default max-w-[180px]">
                            {row.original.note ?? "—"}
                        </span>
                    </MyTooltip>
                ),
                enableSorting: false,
            },
            {
                accessorKey: "after_discount_amount",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="invoice.amount.label" />
                ),
                cell: ({ row }) => {
                    const total =
                        row.original.after_discount_amount ?? row.original.total_amount ?? 0;
                    const paid = row.original.amount_paid ?? 0;
                    const isPartial = paid > 0 && paid < toNumber(total);

                    return (
                        <div className="space-y-0.5">
                            <p className="font-semibold text-primary">
                                <DisplayCount amount={toNumber(total)} formatCurrency />
                            </p>
                            {isPartial && (
                                <p className="text-xs text-green-600">
                                    {t("invoice.reports.paid")}: <DisplayCount amount={toNumber(paid)} formatCurrency />
                                </p>
                            )}
                        </div>
                    );
                },
            },
            {
                accessorKey: "status",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="invoice.status.label" />
                ),
                cell: ({ row }) => {
                    const status = row.original.status ?? "due";
                    const normalizedStatus = status === "partial_paid" ? "partial" : status;
                    const statusLabelKey = `invoice.filter.status_${normalizedStatus}`;
                    const type = STATUS_BADGE_TYPE[status] ?? "decline";
                    return (
                        <MyBadge type={type} variant="soft">
                            <span className="capitalize">
                                {t(statusLabelKey, {
                                    defaultValue: normalizedStatus.replace("_", " "),
                                })}
                            </span>
                        </MyBadge>
                    );
                },
            },
            {
                id: "actions",
                header: ({ column }) => (
                    <DataTableColumnHeader
                        column={column}
                        className="flex justify-end mr-2"
                        title="common.actions"
                    />
                ),
                cell: ({ row }) => <InvoiceRowActions invoice={row.original} />,
                enableSorting: false,
                enableHiding: false,
            },
        ],
        [t],
    );
};
