"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../data-table/data-table-column-header";
import { DeleteModal } from "../delete-modal";
import TagForm from "./tag-form";
import { TagRow } from "./tag-type";

export const TagColumns: ColumnDef<TagRow>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="tag.name.label" />
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
            const tag = row.original;
            return (
                <div className="flex items-end justify-end gap-2 mr-3">
                    <TagForm
                        mode="edit"
                        data={{ id: tag.id }}
                        api="/tags"
                        method="PUT"
                    />
                    <DeleteModal
                        api_url={`/tags/${tag.id}`}
                        keys="tags"
                        confirmMessage="tag.delete_confirmation"
                        buttonText="common.confirm_delete"
                    />
                </div>
            );
        },
    },
];
