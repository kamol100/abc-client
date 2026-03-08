"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { usePermissions } from "@/context/app-provider";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import ActionButton from "@/components/action-button";
import { DeleteModal } from "@/components/delete-modal";
import { cellIndex } from "@/lib/helper/helper";
import { SyncClientRow } from "@/components/import-client/import-client-type";

export function useImportClientColumns(
    pagination?: Pagination
): ColumnDef<SyncClientRow>[] {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();

    return [
        {
            id: "sl",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="import_client.table.sl" />
            ),
            cell: ({ row }) => (
                <div className="font-medium">{cellIndex(row.index, pagination)}</div>
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "name",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="import_client.table.name" />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "service",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="import_client.table.service" />
            ),
            enableSorting: false,
        },
        {
            accessorKey: "password",
            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    title="import_client.table.password"
                />
            ),
            enableSorting: false,
        },
        {
            accessorKey: "profile",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="import_client.table.profile" />
            ),
            enableSorting: false,
        },
        {
            accessorKey: "disabled",
            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    title="import_client.table.disabled"
                />
            ),
            cell: ({ row }) =>
                row.original.disabled === "true"
                    ? t("import_client.filters.disabled.options.true")
                    : t("import_client.filters.disabled.options.false"),
            enableSorting: false,
        },
        {
            accessorKey: "route",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="import_client.table.route" />
            ),
            enableSorting: false,
        },
        {
            accessorKey: "ipv6_routes",
            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    title="import_client.table.ipv6_routes"
                />
            ),
            enableSorting: false,
        },
        {
            accessorKey: "syncd_status",
            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    title="import_client.table.sync_status"
                />
            ),
            cell: ({ row }) =>
                row.original.syncd_status === "imported"
                    ? t("import_client.filters.syncd_status.options.imported")
                    : t("import_client.filters.syncd_status.options.not_imported"),
            enableSorting: false,
        },
        {
            id: "actions",
            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    className="mr-3 flex justify-end capitalize"
                    title="common.actions"
                />
            ),
            cell: ({ row }) => {
                const syncClient = row.original;
                const isImported = syncClient.syncd_status === "imported";
                const canImport =
                    hasPermission("sync-clients.show") && !isImported;
                const canDelete =
                    hasPermission("sync-clients.delete") &&
                    isImported;

                if (!canImport && !canDelete) return null;

                return (
                    <div className="mr-3 flex items-end justify-end gap-2">
                        {canImport && (
                            <ActionButton
                                action="edit"
                                title={t("import_client.actions.import")}
                                url={`/import-client/import/${syncClient.id}`}
                            />
                        )}
                        {canDelete && (
                            <DeleteModal
                                api_url={`/sync-client/${syncClient.id}`}
                                keys="sync-clients"
                                confirmMessage="import_client.messages.delete_confirmation"
                                buttonText="common.confirm_delete"
                            />
                        )}
                    </div>
                );
            },
        },
    ];
}
