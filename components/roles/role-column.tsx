"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../data-table/data-table-column-header";
import { DeleteModal } from "../delete-modal";
import RoleForm from "./role-form";
import { RoleRow } from "./role-type";

export const RoleColumns: ColumnDef<RoleRow>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="role.name.label" />
        ),
        cell: ({ row }) => (
            <div className="capitalize">{row.original.name}</div>
        ),
        enableSorting: false,
        enableHiding: false,
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
            const role = row.original;
            return (
                <div className="flex items-end justify-end gap-2 mr-3">
                    <RoleForm
                        mode="edit"
                        data={{ id: role.id }}
                        api="/roles"
                        method="PUT"
                    />
                    <DeleteModal
                        api_url={`/roles/${role.id}`}
                        keys="roles"
                        confirmMessage="role.delete_confirmation"
                        buttonText="common.confirm_delete"
                    />
                </div>
            );
        },
    },
];
