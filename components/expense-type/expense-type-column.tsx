"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../data-table/data-table-column-header";
import { DeleteModal } from "../delete-modal";
import ExpenseTypeForm from "./expense-type-form";
import { ExpenseTypeRow } from "./expense-type-type";

export const ExpenseTypeColumns: ColumnDef<ExpenseTypeRow>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="expense_type.name.label" />
        ),
        cell: ({ row }) => (
            <div className="capitalize">{row.original.name}</div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "description",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="expense_type.description.label" />
        ),
        cell: ({ row }) => (
            <div>{row.original.description ?? ""}</div>
        ),
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
        cell: ({ row }) => {
            const expenseType = row.original;
            return (
                <div className="flex items-end justify-end gap-2 mr-3">
                    <ExpenseTypeForm
                        mode="edit"
                        data={{ id: expenseType.id }}
                        api="/expense-types"
                        method="PUT"
                    />
                    <DeleteModal
                        api_url={`/expense-types/${expenseType.id}`}
                        keys="expense-types"
                        confirmMessage="expense_type.delete_confirmation"
                        buttonText="common.confirm_delete"
                    />
                </div>
            );
        },
    },
];
