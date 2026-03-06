"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../data-table/data-table-column-header";
import { DeleteModal } from "../delete-modal";
import SubjectForm from "./subject-form";
import { SubjectRow } from "./subject-type";

export const SubjectColumns: ColumnDef<SubjectRow>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="subject.name.label" />
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
            const subject = row.original;
            return (
                <div className="flex items-end justify-end gap-2 mr-3">
                    <SubjectForm
                        mode="edit"
                        data={{ id: subject.id }}
                        api="/subjects"
                        method="PUT"
                    />
                    <DeleteModal
                        api_url={`/subjects/${subject.id}`}
                        keys="subjects"
                        confirmMessage="subject.delete_confirmation"
                        buttonText="common.confirm_delete"
                    />
                </div>
            );
        },
    },
];
