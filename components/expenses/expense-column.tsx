"use client";

import { formatMoney } from "@/lib/helper/helper";
import { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { DataTableColumnHeader } from "../data-table/data-table-column-header";
import MyBadge from "../my-badge";
import { DeleteModal } from "../delete-modal";
import useApiMutation from "@/hooks/use-api-mutation";
import ExpenseForm from "./expense-form";
import { ExpenseRow } from "./expense-type";
import MyButton from "../my-button";

const STATUS_BADGE_TYPE = {
    approved: "success" as const,
    pending: "pending" as const,
    declined: "decline" as const,
};

const ExpenseActions: FC<{ expense: ExpenseRow }> = ({ expense }) => {
    const { t } = useTranslation();

    const { mutate: updateStatus, isPending, variables } = useApiMutation<
        unknown,
        { status: string }
    >({
        url: `/expense-status/${expense.id}`,
        method: "PUT",
        invalidateKeys: "expenses",
        successMessage: "expense.status_updated",
    });

    const isApproving = isPending && variables?.status === "approved";
    const isDeclining = isPending && variables?.status === "declined";

    return (
        <div className="flex items-end justify-end gap-1 mr-2">
            {expense.status !== "approved" && (
                <MyButton
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                    disabled={isPending}
                    onClick={() => updateStatus({ status: "approved" })}
                    title={t("expense.approve")}
                >
                    {isApproving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <CheckCircle2 className="h-4 w-4" />
                    )}
                </MyButton>
            )}
            {expense.status !== "declined" && (
                <MyButton
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                    disabled={isPending}
                    onClick={() => updateStatus({ status: "declined" })}
                    title={t("expense.decline")}
                >
                    {isDeclining ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <XCircle className="h-4 w-4" />
                    )}
                </MyButton>
            )}
            <ExpenseForm
                mode="edit"
                data={{ id: expense.id }}
                api="/expenses"
                method="PUT"
            />
            <DeleteModal
                api_url={`/expenses/${expense.id}`}
                keys="expenses"
                confirmMessage="expense.delete_confirmation"
            />
        </div>
    );
};

export const ExpenseColumns: ColumnDef<ExpenseRow>[] = [
    {
        accessorKey: "expense_date",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="expense.expense_date.label" />
        ),
        cell: ({ row }) => (
            <span className="text-sm">{row.original.expense_date ?? "—"}</span>
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "voucher",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="expense.voucher.label" />
        ),
        cell: ({ row }) => (
            <span className="text-sm">{row.original.voucher ?? "—"}</span>
        ),
    },
    {
        accessorKey: "staff.name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="expense.staff.label" />
        ),
        cell: ({ row }) => (
            <div className="w-[100px] capitalize truncate">
                {row.original.staff?.name ?? "—"}
            </div>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "fund.name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="expense.fund.label" />
        ),
        cell: ({ row }) => (
            <span className="text-sm">{row.original.fund?.name ?? "—"}</span>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "zone.name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="expense.zone.label" />
        ),
        cell: ({ row }) => (
            <span className="text-sm">{row.original.zone?.name ?? "—"}</span>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "expenseType.name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="expense.expense_type.label" />
        ),
        cell: ({ row }) => (
            <span className="text-sm">{row.original.expenseType?.name ?? "—"}</span>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "amount",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="expense.amount.label" />
        ),
        cell: ({ row }) => (
            <span className="font-semibold text-primary">
                ৳{formatMoney(row.original.amount)}
            </span>
        ),
    },
    {
        accessorKey: "status",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="common.status" />
        ),
        cell: ({ row }) => {
            const status = (row.original.status ?? "pending") as keyof typeof STATUS_BADGE_TYPE;
            const type = STATUS_BADGE_TYPE[status] ?? "pending";
            return (
                <MyBadge type={type} variant="soft">
                    <span className="capitalize">{status}</span>
                </MyBadge>
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
        cell: ({ row }) => <ExpenseActions expense={row.original} />,
    },
];
