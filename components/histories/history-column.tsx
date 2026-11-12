"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import MyTooltip from "@/components/my-tooltip";
import type { HistoryRow } from "@/components/histories/history-type";
import { usePermissions, useSettings } from "@/context/app-provider";
import { cellIndex, formatKey } from "@/lib/helper/helper";

function HistoryClientName({ client }: { client: HistoryRow["client"] }) {
    const { hasPermission } = usePermissions();
    const { settings } = useSettings();
    const name = client?.name?.trim() ?? "";
    const clientId = client?.uuid?.trim() ?? "";
    const canView = name !== "" && clientId !== "" && hasPermission("clients.show");

    if (!canView) {
        return <span className="text-sm capitalize">{name || "—"}</span>;
    }

    return (
        <Link
            href={`/clients/view/${clientId}`}
            target={settings.client_view_open_on_new_tab ? "_blank" : "_self"}
            className="text-sm capitalize underline-offset-4 hover:underline"
        >
            {name}
        </Link>
    );
}

type GetPagination = () => Pagination | undefined;

function RecordDisplay({ record }: { record?: Record<string, unknown> | null }) {
    if (!record || Object.keys(record).length === 0) {
        return <span className="text-sm text-muted-foreground">—</span>;
    }

    return (
        <div className="space-y-0.5">
            {Object.entries(record).map(([key, value]) => (
                <p key={key} className="text-xs capitalize leading-snug">
                    <span className="font-semibold">{formatKey(key)}:</span>{" "}
                    {typeof value === "object"
                        ? JSON.stringify(value)
                        : String(value ?? "")}
                </p>
            ))}
        </div>
    );
}

export function getHistoryColumns(
    getPagination: GetPagination
): ColumnDef<HistoryRow>[] {
    return [
        {
            id: "sl",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="history.sl" />
            ),
            cell: ({ row }) => (
                <span className="font-bold text-sm">
                    {cellIndex(row.index, getPagination())}
                </span>
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "staff",
            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    title="history.staff.label"
                />
            ),
            cell: ({ row }) => (
                <span className="capitalize text-sm">
                    {row.original.staff ?? "—"}
                </span>
            ),
            enableSorting: false,
        },
        {
            accessorKey: "client.name",
            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    title="history.client.label"
                />
            ),
            cell: ({ row }) => <HistoryClientName client={row.original.client} />,
            enableSorting: false,
        },
        {
            accessorKey: "old_data",
            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    title="history.old_data.label"
                />
            ),
            cell: ({ row }) => <RecordDisplay record={row.original.old_data} />,
            enableSorting: false,
        },
        {
            accessorKey: "new_data",
            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    title="history.new_data.label"
                />
            ),
            cell: ({ row }) => <RecordDisplay record={row.original.new_data} />,
            enableSorting: false,
        },
        {
            accessorKey: "description",
            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    title="history.description.label"
                />
            ),
            cell: ({ row }) => (
                <MyTooltip content={<p className="max-w-xs">{row.original.description ?? "—"}</p>}>
                    <span className="capitalize text-sm line-clamp-1 cursor-default">
                        {row.original.description ?? "—"}
                    </span>
                </MyTooltip>
            ),
            enableSorting: false,
        },
        {
            accessorKey: "created_at",
            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    title="history.created_at.label"
                />
            ),
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {row.original.created_at ?? "—"}
                </span>
            ),
            enableSorting: false,
        },
    ];
}
