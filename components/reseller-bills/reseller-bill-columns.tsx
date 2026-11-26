"use client";

import { FC, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import InvoiceViewDialog from "@/components/invoices/invoice-view-dialog";
import type { InvoiceRow } from "@/components/invoices/invoice-type";
import MyButton from "@/components/my-button";
import ResellerBillPayDialog from "@/components/reseller-bills/reseller-bill-pay-dialog";
import {
    resellerBillDue,
    resellerBillIsUnpaid,
    type ResellerBillRow,
} from "@/components/reseller-bills/reseller-bill-type";
import { Badge } from "@/components/ui/badge";
import { usePermissions } from "@/context/app-provider";
import { formatMoney } from "@/lib/helper/helper";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
    paid: "theme-badge-success",
    due: "theme-badge-danger",
    partial: "theme-badge-warning",
    partial_paid: "theme-badge-warning",
};

const BillStatus: FC<{ status: ResellerBillRow["status"] }> = ({ status }) => {
    const { t } = useTranslation();
    const value = status ?? "due";
    const normalized = value === "partial_paid" ? "partial" : value;

    return (
        <Badge className={cn(STATUS_STYLES[value])}>
            <span className="capitalize">
                {t(`invoice.filter.status_${normalized}`, { defaultValue: normalized.replaceAll("_", " ") })}
            </span>
        </Badge>
    );
};

const BillActions: FC<{ bill: ResellerBillRow }> = ({ bill }) => {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();
    const [viewOpen, setViewOpen] = useState(false);
    const [payOpen, setPayOpen] = useState(false);
    const canPay = hasPermission("reseller-invoices.pay") && resellerBillIsUnpaid(bill);

    return (
        <>
            <div className="mr-2 flex items-center justify-end gap-2">
                {canPay && (
                    <MyButton
                        variant="outline"
                        type="button"
                        tooltip="reseller_bill.pay.title"
                        tooltipPlacement="top"
                        tooltipDelay={0}
                        onClick={() => setPayOpen(true)}
                        aria-label={t("reseller_bill.pay.title")}
                    >
                        <Wallet className="h-4 w-4" />
                    </MyButton>
                )}
                <MyButton
                    variant="outline"
                    type="button"
                    tooltip="invoice.actions.view"
                    tooltipPlacement="top"
                    tooltipDelay={0}
                    onClick={() => setViewOpen(true)}
                    aria-label={t("invoice.actions.view")}
                >
                    <Eye className="h-4 w-4" />
                </MyButton>
            </div>
            {canPay && <ResellerBillPayDialog bill={bill} open={payOpen} onOpenChange={setPayOpen} />}
            {/* The bill is not one of the reseller's own invoices, so it is shown from the row. */}
            <InvoiceViewDialog
                invoiceKey={bill.id ?? ""}
                fallback={bill as unknown as InvoiceRow}
                fetchDetail={false}
                open={viewOpen}
                onOpenChange={setViewOpen}
            />
        </>
    );
};

export const resellerBillColumns: ColumnDef<ResellerBillRow>[] = [
    {
        accessorKey: "trackID",
        header: ({ column }) => <DataTableColumnHeader column={column} title="invoice.invoice_id" />,
        cell: ({ row }) => <span className="text-sm font-medium">{row.original.trackID ?? "—"}</span>,
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "create_date",
        header: ({ column }) => <DataTableColumnHeader column={column} title="invoice.date_created" />,
        cell: ({ row }) => <span className="text-sm">{row.original.create_date ?? "—"}</span>,
        enableSorting: false,
    },
    {
        accessorKey: "due_date",
        header: ({ column }) => <DataTableColumnHeader column={column} title="invoice.date_due" />,
        cell: ({ row }) => <span className="text-sm">{row.original.due_date ?? "—"}</span>,
        enableSorting: false,
    },
    {
        accessorKey: "invoice_type.name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="invoice.type.label" />,
        cell: ({ row }) => <span className="text-sm">{row.original.invoice_type?.name ?? "—"}</span>,
        enableSorting: false,
    },
    {
        accessorKey: "after_discount_amount",
        header: ({ column }) => <DataTableColumnHeader column={column} title="invoice.amount.label" />,
        cell: ({ row }) => (
            <span className="font-semibold text-primary">৳{formatMoney(row.original.after_discount_amount)}</span>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "amount_paid",
        header: ({ column }) => <DataTableColumnHeader column={column} title="reseller_bill.paid" />,
        cell: ({ row }) => <span className="text-sm">৳{formatMoney(row.original.amount_paid)}</span>,
        enableSorting: false,
    },
    {
        id: "amount_due",
        header: ({ column }) => <DataTableColumnHeader column={column} title="reseller_bill.due" />,
        cell: ({ row }) => <span className="text-sm">৳{formatMoney(resellerBillDue(row.original))}</span>,
        enableSorting: false,
    },
    {
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title="common.status" />,
        cell: ({ row }) => <BillStatus status={row.original.status} />,
        enableSorting: false,
    },
    {
        id: "actions",
        header: () => null,
        cell: ({ row }) => <BillActions bill={row.original} />,
        enableSorting: false,
        enableHiding: false,
    },
];
