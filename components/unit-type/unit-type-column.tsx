"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../data-table/data-table-column-header";
import { DeleteModal } from "../delete-modal";
import UnitTypeForm from "./unit-type-form";
import { UnitTypeRow } from "./unit-type-type";

export const UnitTypeColumns: ColumnDef<UnitTypeRow>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="unit_type.name.label" />
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
            const unitType = row.original;
            return (
                <div className="flex items-end justify-end gap-2 mr-3">
                    <UnitTypeForm
                        mode="edit"
                        data={{ id: unitType.id }}
                        api="/unit-types"
                        method="PUT"
                    />
                    {unitType.deletable === 1 && (
                        <DeleteModal
                            api_url={`/unit-types/${unitType.id}`}
                            keys="unit-types"
                            confirmMessage="unit_type.delete_confirmation"
                            buttonText="common.confirm_delete"
                        />
                    )}
                </div>
            );
        },
    },
];
