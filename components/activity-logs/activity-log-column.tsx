"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { cellIndex } from "@/lib/helper/helper";
import { ActivityLogActionsCell } from "./activity-log-actions-cell";
import type { ActivityLogRow } from "./activity-log-type";

type GetPagination = () => Pagination | undefined;

export function getActivityLogColumns(
    getPagination: GetPagination
): ColumnDef<ActivityLogRow>[] {
    return [
        {
            id: "sl",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="activity_log.sl" />
            ),
            cell: ({ row }) => (
                <div className="font-medium">
                    {cellIndex(row.index, getPagination())}
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "company",
            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    title="activity_log.company.label"
                />
            ),
            cell: ({ row }) => (
                <div className="capitalize">{row.original.company ?? "—"}</div>
            ),
            enableSorting: false,
            enableHiding: true,
        },
        {
            accessorKey: "reseller",
            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    title="activity_log.reseller.label"
                />
            ),
            cell: ({ row }) => (
                <div className="capitalize">{row.original.reseller ?? "—"}</div>
            ),
            enableSorting: false,
            enableHiding: true,
        },
        {
            accessorKey: "subject",
            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    title="activity_log.subject.label"
                />
            ),
            cell: ({ row }) => (
                <div className="capitalize">{row.original.subject}</div>
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "description",
            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    title="activity_log.action_by.label"
                />
            ),
            cell: ({ row }) => (
                <div className="capitalize">{row.original.description}</div>
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "updated_at",
            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    title="activity_log.date.label"
                />
            ),
            cell: ({ row }) => (
                <div>{row.original.updated_at}</div>
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
            cell: ({ row }) => <ActivityLogActionsCell row={row.original} />,
            enableSorting: false,
            enableHiding: false,
        },
    ];
}
