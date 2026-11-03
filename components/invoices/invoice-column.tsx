"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import DisplayCount from "@/components/display-count";
import MyBadge from "@/components/my-badge";
import MyTooltip from "@/components/my-tooltip";
import InvoiceRowActions from "@/components/invoices/invoice-row-actions";
import { InvoiceRow } from "@/components/invoices/invoice-type";
import { usePermissions, useSettings } from "@/context/app-provider";
import { toNumber } from "@/lib/helper/helper";

const STATUS_BADGE_TYPE: Record<string, "success" | "decline" | "warning"> = {
    paid: "success",
    due: "decline",
    partial: "warning",
    partial_paid: "warning",
};

function InvoiceClientName({ client }: { client: InvoiceRow["client"] }) {
    const { hasPermission } = usePermissions();
    const { settings } = useSettings();
    const name = client?.name?.trim() ?? "";
    const clientId = client?.uuid?.trim() ?? "";
    const canView = name !== "" && clientId !== "" && hasPermission("clients.show");

    if (!canView) {
        return <span className="text-sm">{name || "—"}</span>;
    }

    return (
        <Link
            href={`/clients/view/${clientId}`}
            target={settings.client_view_open_on_new_tab ? "_blank" : "_self"}
            className="text-sm underline-offset-4 hover:underline"
        >
            {name}
        </Link>
    );
}

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
                cell: ({ row }) => <InvoiceClientName client={row.original.client} />,
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
