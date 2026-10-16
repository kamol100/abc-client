"use client";

import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { cellIndex, formatKey } from "@/lib/helper/helper";
import { ActivityLogActionsCell } from "@/components/activity-logs/activity-log-actions-cell";
import type { ActivityLogChanges, ActivityLogRow } from "@/components/activity-logs/activity-log-type";

const SUMMARY_MAX_LENGTH = 120;

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
                <div className="min-w-[150px] whitespace-nowrap capitalize">{row.original.company ?? "—"}</div>
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
                <div className="min-w-[180px] whitespace-nowrap capitalize">
                    {row.original.description}
                </div>
            ),
            meta: { className: "min-w-[150px]" },
            enableSorting: false,
            enableHiding: false,
        },
        {
            id: "summary",
            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    title="activity_log.summary.label"
                />
            ),
            cell: ({ row }) => (
                <ActivityLogSummaryCell changes={row.original.changes} />
            ),
            meta: { className: "w-full max-w-0 overflow-hidden" },
            enableSorting: false,
            enableHiding: true,
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
                <div className="min-w-[150px] whitespace-nowrap">
                    {row.original.updated_at}
                </div>
            ),
            meta: { className: "min-w-[150px]" },
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

function displayChangeValue(value: unknown): string {
    if (value === null || value === undefined || value === "") return "—";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
}

export function activityChangeSummary(changes?: ActivityLogChanges): string {
    const previousValues = changes?.old ?? {};
    const nextValues = changes?.attributes ?? {};
    const keys = [...new Set([...Object.keys(nextValues), ...Object.keys(previousValues)])]
        .filter((key) => key !== "updated_at");

    return keys.flatMap((key) => {
        const hasPrevious = Object.prototype.hasOwnProperty.call(previousValues, key);
        const hasNext = Object.prototype.hasOwnProperty.call(nextValues, key);
        const previous = hasPrevious ? displayChangeValue(previousValues[key]) : undefined;
        const next = hasNext ? displayChangeValue(nextValues[key]) : undefined;
        const label = formatKey(key);

        if (hasPrevious && hasNext) {
            if (previous === next) return [];
            return [`${label}: ${previous} → ${next}`];
        }
        if (hasNext) return [`${label}: ${next}`];
        if (hasPrevious) return [`${label}: ${previous}`];
        return [];
    }).join(", ");
}

export function ActivityLogSummaryCell({ changes }: { changes?: ActivityLogChanges }) {
    const { t } = useTranslation();
    const [expanded, setExpanded] = useState(false);
    const text = activityChangeSummary(changes);

    useEffect(() => {
        setExpanded(false);
    }, [text]);

    if (!text) return <span className="text-muted-foreground">—</span>;

    const truncated = text.length > SUMMARY_MAX_LENGTH
        ? `${text.slice(0, SUMMARY_MAX_LENGTH)}…`
        : text;

    if (text.length <= SUMMARY_MAX_LENGTH) {
        return (
            <span className="block w-0 min-w-full break-words text-sm">
                {text}
            </span>
        );
    }

    return (
        <div
            className={
                expanded
                    ? "w-0 min-w-full text-sm"
                    : "flex w-0 min-w-full flex-nowrap items-baseline gap-1 overflow-hidden text-sm"
            }
        >
            <span className={expanded ? "break-words" : "min-w-0 truncate"}>
                {expanded ? text : truncated}
            </span>
            <button
                type="button"
                className="shrink-0 whitespace-nowrap p-0 align-baseline text-xs font-normal text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                onClick={() => setExpanded((open) => !open)}
            >
                {expanded
                    ? t("activity_log.summary.show_less")
                    : t("activity_log.summary.show_more")}
            </button>
        </div>
    );
}
