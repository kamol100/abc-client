"use client";

import { CircleAlert, CircleCheck, CircleDotDashed, type LucideIcon } from "lucide-react";
import ClientViewLink from "@/components/clients/view-mode/client-view-link";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DeleteModal } from "@/components/delete-modal";
import DisplayCount from "@/components/display-count";
import { isWalletPaid, PaymentRow } from "@/components/payments/payment-type";
import { Badge } from "@/components/ui/badge";
import { usePermissions } from "@/context/app-provider";
import { toNumber } from "@/lib/helper/helper";
import { cn } from "@/lib/utils";

function PaymentClientName({ client }: { client: PaymentRow["client"] }) {
    const { hasPermission } = usePermissions();
    const name = client?.name?.trim() ?? "";
    const clientId = client?.uuid?.trim() ?? "";
    const canView = name !== "" && clientId !== "" && hasPermission("clients.show");

    if (!canView) {
        return (
            <div className="w-[120px] capitalize truncate text-sm">
                {name || "—"}
            </div>
        );
    }

    return (
        <ClientViewLink
            clientId={clientId}
            className="block w-[120px] capitalize truncate text-sm underline-offset-4 hover:underline"
        >
            {name}
        </ClientViewLink>
    );
}

/** Shown in the fund column for a bill settled from the client's wallet (it has no fund). */
function WalletSourceLabel() {
    const { t } = useTranslation();
    return <span className="text-muted-foreground">{t("payment.wallet_source")}</span>;
}

const STATUS_STYLES: Record<string, string> = {
    paid: "theme-badge-success",
    due: "theme-badge-danger",
    partial_paid: "theme-badge-warning",
};

const STATUS_ICONS: Record<string, LucideIcon> = {
    paid: CircleCheck,
    due: CircleAlert,
    partial_paid: CircleDotDashed,
};

export const PaymentColumns: ColumnDef<PaymentRow>[] = [
    {
        accessorKey: "pid",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="payment.pid.label" />
        ),
        cell: ({ row }) => (
            <span className="font-medium text-sm">
                {row.original.pid ?? "—"}
            </span>
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "invoice.trackID",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="invoice.invoice_id" />
        ),
        cell: ({ row }) => (
            <span className="font-medium text-sm">
                {row.original.invoice?.trackID ?? "—"}
            </span>
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "payment_date",
        header: ({ column }) => (
            <DataTableColumnHeader
                column={column}
                title="payment.payment_date.label"
            />
        ),
        cell: ({ row }) => (
            <span className="text-sm">{row.original.payment_date}</span>
        ),
    },
    {
        accessorKey: "client.name",
        header: ({ column }) => (
            <DataTableColumnHeader
                column={column}
                title="payment.client.label"
            />
        ),
        cell: ({ row }) => <PaymentClientName client={row.original.client} />,
        enableSorting: false,
    },
    {
        accessorKey: "zone.name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="zone.name.label" />
        ),
        cell: ({ row }) => (
            <span className="text-sm">
                {row.original.zone?.name ?? "—"}
            </span>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "staff.name",
        header: ({ column }) => (
            <DataTableColumnHeader
                column={column}
                title="payment.collect_by.label"
            />
        ),
        cell: ({ row }) => (
            <span className="text-sm">
                {row.original.staff?.name ?? "—"}
            </span>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "amount",
        header: ({ column }) => (
            <DataTableColumnHeader
                column={column}
                title="payment.amount.label"
            />
        ),
        cell: ({ row }) => (
            <span className="font-semibold text-primary">
                <DisplayCount amount={toNumber(row.original.amount)} formatCurrency />
            </span>
        ),
    },
    {
        accessorKey: "fund.name",
        header: ({ column }) => (
            <DataTableColumnHeader
                column={column}
                title="payment.fund.label"
            />
        ),
        cell: ({ row }) => (
            <span className="text-sm">
                {row.original.fund?.name ?? (isWalletPaid(row.original.source) ? <WalletSourceLabel /> : "—")}
            </span>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "status",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="common.status" />
        ),
        cell: ({ row }) => {
            const status = row.original.status ?? "paid";
            const StatusIcon = STATUS_ICONS[status];
            return (
                <Badge className={cn("gap-1", STATUS_STYLES[status])}>
                    {StatusIcon && <StatusIcon className="size-3 shrink-0" aria-hidden />}
                    <span className="capitalize">
                        {status.replace("_", " ")}
                    </span>
                </Badge>
            );
        },
    },
    {
        id: "actions",
        header: ({ column }) => (
            <DataTableColumnHeader
                column={column}
                title="common.actions"
                className="flex justify-end mr-2"
            />
        ),
        cell: ({ row }) => {
            const payment = row.original;
            const paymentId = String(payment.id);
            return (
                <div className="flex items-end justify-end gap-1 mr-2">
                    <DeleteModal
                        api_url={`/payments/${paymentId}`}
                        keys="payments"
                    />
                </div>
            );
        },
    },
];
