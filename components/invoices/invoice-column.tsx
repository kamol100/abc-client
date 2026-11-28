"use client";

import { useMemo } from "react";
import ClientViewLink from "@/components/clients/view-mode/client-view-link";
import { useTranslation } from "react-i18next";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import DisplayCount from "@/components/display-count";
import MyBadge, { themeToneClass } from "@/components/my-badge";
import MyTooltip from "@/components/my-tooltip";
import InvoiceAdvanceTag, { invoiceAdvance } from "@/components/invoices/invoice-advance-tag";
import InvoiceRowActions from "@/components/invoices/invoice-row-actions";
import { InvoiceRow } from "@/components/invoices/invoice-type";
import { usePermissions } from "@/context/app-provider";
import { formatMoney, toNumber } from "@/lib/helper/helper";
import { cn } from "@/lib/utils";

const STATUS_BADGE_TYPE: Record<string, "success" | "decline" | "warning"> = {
    paid: "success",
    due: "decline",
    partial: "warning",
    partial_paid: "warning",
};

/** Amount for the small note line: no "/-", and decimals only when there are paisa (250, 250.50). */
function noteAmount(value: number): string {
    const rounded = Math.round(value * 100) / 100;

    return formatMoney(rounded, Number.isInteger(rounded) ? 0 : 2);
}

/** The reseller an invoice is billed to, marked so it is not read as a client. */
function InvoiceResellerName({ name }: { name: string }) {
    const { t } = useTranslation();

    return (
        <span className="text-sm">
            {name || "—"}{" "}
            <span className="text-xs text-muted-foreground">({t("invoice.bill_to.type.reseller")})</span>
        </span>
    );
}

function InvoiceClientName({ client }: { client: InvoiceRow["client"] }) {
    const { hasPermission } = usePermissions();
    const name = client?.name?.trim() ?? "";
    const clientId = client?.uuid?.trim() ?? "";
    const canView = name !== "" && clientId !== "" && hasPermission("clients.show");

    if (!canView) {
        return <span className="text-sm">{name || "—"}</span>;
    }

    return (
        <ClientViewLink
            clientId={clientId}
            className="text-sm underline-offset-4 hover:underline"
        >
            {name}
        </ClientViewLink>
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
                cell: ({ row }) =>
                    row.original.bill_to_type === "reseller" ? (
                        <InvoiceResellerName name={row.original.bill_to?.name?.trim() ?? ""} />
                    ) : (
                        <InvoiceClientName client={row.original.client} />
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
                    const advance = invoiceAdvance(row.original);

                    const hasNote = isPartial || advance !== null;

                    return (
                        <div className="space-y-0.5">
                            <p className="font-semibold">
                                <DisplayCount amount={toNumber(total)} formatCurrency />
                            </p>
                            {/* One small line, only when there is something to say: paid and due, and the advance used. */}
                            {hasNote && (
                                <p className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
                                    {isPartial && (
                                        <>
                                            <span className={cn("whitespace-nowrap", themeToneClass.success)}>
                                                {t("invoice.reports.paid")}:{noteAmount(toNumber(paid))}
                                            </span>
                                            <span aria-hidden="true">·</span>
                                            <span className={cn("whitespace-nowrap", themeToneClass.danger)}>
                                                {t("invoice.filter.status_due")}:
                                                {noteAmount(toNumber(total) - toNumber(paid))}
                                            </span>
                                        </>
                                    )}
                                    {isPartial && advance && <span aria-hidden="true">·</span>}
                                    {advance && <InvoiceAdvanceTag {...advance} variant="note" />}
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
