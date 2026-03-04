"use client";

import { FC } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { ClientHistoryRow } from "./client-type";
import { cellIndex, formatKey } from "@/lib/helper/helper";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

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

interface Props {
    clientId: string;
}

const ClientHistory: FC<Props> = ({ clientId }) => {
    const { t } = useTranslation();

    const { data, isLoading, isFetching, setCurrentPage } =
        useApiQuery<PaginatedApiResponse<ClientHistoryRow>>({
            queryKey: ["client-history", clientId],
            url: `clients-history/${clientId}`,
        });

    const histories = data?.data?.data ?? [];
    const pagination = data?.data?.pagination;

    const columns: ColumnDef<ClientHistoryRow>[] = [
        {
            id: "sl",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="client.history.sl" />
            ),
            cell: ({ row }) => (
                <span className="font-bold text-sm">
                    {cellIndex(row.index, pagination)}
                </span>
            ),
            enableSorting: false,
        },
        {
            accessorKey: "staff",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="client.history.staff" />
            ),
            cell: ({ row }) => (
                <span className="capitalize text-sm">
                    {row.original.staff ?? "—"}
                </span>
            ),
            enableSorting: false,
        },
        {
            accessorKey: "old_data",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="client.history.old_data" />
            ),
            cell: ({ row }) => <RecordDisplay record={row.original.old_data} />,
            enableSorting: false,
        },
        {
            accessorKey: "new_data",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="client.history.new_data" />
            ),
            cell: ({ row }) => <RecordDisplay record={row.original.new_data} />,
            enableSorting: false,
        },
        {
            accessorKey: "description",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="client.history.description" />
            ),
            cell: ({ row }) => (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="capitalize text-sm line-clamp-1 cursor-default">
                                {row.original.description ?? "—"}
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="max-w-xs">{row.original.description}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            ),
            enableSorting: false,
        },
        {
            accessorKey: "created_at",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="client.history.date" />
            ),
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {row.original.created_at ?? "—"}
                </span>
            ),
            enableSorting: false,
        },
    ];

    const toolbarTitle = pagination?.total
        ? `${t("client.history.title")} (${pagination.total})`
        : t("client.history.title");

    return (
        <DataTable
            data={histories}
            columns={columns}
            pagination={pagination}
            setCurrentPage={setCurrentPage}
            isLoading={isLoading}
            isFetching={isFetching}
            queryKey="client-history"
            toolbarTitle={toolbarTitle}
            toggleColumns={false}
        />
    );
};

export default ClientHistory;
