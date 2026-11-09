"use client";

import { ColumnDef } from "@tanstack/react-table";
import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ChoiceMenu from "@/components/choice-menu";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DeleteModal } from "@/components/delete-modal";
import ExpenseForm from "@/components/expenses/expense-form";
import {
    EXPENSE_STATUS_OPTIONS,
    ExpenseRow,
    ExpenseStatus,
} from "@/components/expenses/expense-type";
import MyBadge, { MyBadgeType } from "@/components/my-badge";
import { usePermissions } from "@/context/app-provider";
import useApiMutation from "@/hooks/use-api-mutation";
import { formatMoney } from "@/lib/helper/helper";

const STATUS_BADGE_TYPE: Record<ExpenseStatus, MyBadgeType> = {
    approved: "success",
    pending: "pending",
    declined: "decline",
};

function expenseStatus(value: string | null | undefined): ExpenseStatus {
    if (value === "pending" || value === "approved" || value === "declined") return value;
    return "pending";
}

function ExpenseStatusSelect({ expense }: { expense: ExpenseRow }) {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();
    const [status, setStatus] = useState<ExpenseStatus>(expenseStatus(expense.status));
    const canChange = hasPermission("expenses.approval");

    useEffect(() => {
        setStatus(expenseStatus(expense.status));
    }, [expense.status]);

    const { mutate, isPending } = useApiMutation<unknown, { status: ExpenseStatus }>({
        url: `/expense-status/${expense.id}`,
        method: "PUT",
        invalidateKeys: "expenses",
        successMessage: "expense.status_updated",
        onError: () => setStatus(expenseStatus(expense.status)),
    });

    const statusLabel = t(
        EXPENSE_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? "common.pending",
    );

    if (!canChange) {
        return (
            <MyBadge type={STATUS_BADGE_TYPE[status]} variant="soft" size="sm">
                {statusLabel}
            </MyBadge>
        );
    }

    const applyStatus = (nextStatus: ExpenseStatus) => {
        if (nextStatus === status) return;
        setStatus(nextStatus);
        mutate({ status: nextStatus });
    };

    return (
        <ChoiceMenu
            ariaLabel={`${t("expense.status.change")}: ${statusLabel}`}
            value={status}
            disabled={isPending}
            trigger={(
                <MyBadge type={STATUS_BADGE_TYPE[status]} variant="soft" size="sm" loading={isPending}>
                    {statusLabel}
                </MyBadge>
            )}
            options={EXPENSE_STATUS_OPTIONS.map((option) => ({
                value: option.value,
                content: (
                    <MyBadge type={STATUS_BADGE_TYPE[option.value]} variant="soft" size="sm">
                        {t(option.label)}
                    </MyBadge>
                ),
            }))}
            onSelect={applyStatus}
        />
    );
}

const ExpenseActions: FC<{ expense: ExpenseRow }> = ({ expense }) => {
    const { hasPermission } = usePermissions();
    const canEdit = hasPermission("expenses.edit");

    return (
        <div className="flex items-end justify-end gap-1 mr-2">
            {canEdit ? (
                <ExpenseForm
                    mode="edit"
                    data={{ id: expense.id }}
                    api="/expenses"
                    method="PUT"
                />
            ) : null}
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
        accessorKey: "expense_id",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="expense.expense_id.label" />
        ),
        cell: ({ row }) => (
            <span className="font-medium text-sm">{row.original.expense_id ?? "—"}</span>
        ),
        enableSorting: false,
        enableHiding: false,
    },
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
        cell: ({ row }) => <ExpenseStatusSelect expense={row.original} />,
        enableSorting: false,
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
