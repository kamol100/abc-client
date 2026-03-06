"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { DataTableColumnHeader } from "../data-table/data-table-column-header";
import { DeleteModal } from "../delete-modal";
import TjBoxForm from "./tj-box-form";
import { TjBoxRow } from "./tj-box-type";
import { usePermissions } from "@/context/app-provider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function useTjBoxColumns(): ColumnDef<TjBoxRow>[] {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();

    return [
        {
            accessorKey: "name",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="tj_box.name.label" />
            ),
            cell: ({ row }) => (
                <div className="font-medium">{row.original.name ?? "-"}</div>
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            id: "device",
            accessorKey: "device.name",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="tj_box.device.label" />
            ),
            cell: ({ row }) => (
                <div>{row.original.device?.name ?? "-"}</div>
            ),
            enableSorting: false,
        },
        {
            id: "zone",
            accessorKey: "zone.name",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="tj_box.zone.label" />
            ),
            cell: ({ row }) => (
                <div>{row.original.zone?.name ?? "-"}</div>
            ),
            enableSorting: false,
        },
        {
            accessorKey: "latitude",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="tj_box.latitude.label" />
            ),
            cell: ({ row }) => <div>{row.original.latitude}</div>,
            enableSorting: false,
        },
        {
            accessorKey: "longitude",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="tj_box.longitude.label" />
            ),
            cell: ({ row }) => <div>{row.original.longitude}</div>,
            enableSorting: false,
        },
        {
            accessorKey: "status",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="tj_box.status.label" />
            ),
            cell: ({ row }) => {
                const status = row.original.status;
                const isActive = status === "active";
                return (
                    <Badge
                        variant="secondary"
                        className={cn(
                            "font-medium",
                            isActive
                                ? "bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400"
                                : "bg-red-600/10 text-red-600 dark:bg-red-400/10 dark:text-red-400"
                        )}
                    >
                        {isActive ? t("tj_box.status.active") : t("tj_box.status.inactive")}
                    </Badge>
                );
            },
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
                const tjBox = row.original;
                const canEdit = hasPermission("tj-boxes.edit");
                const canDelete = hasPermission("tj-boxes.delete");

                if (!canEdit && !canDelete) return null;

                return (
                    <div className="flex items-end justify-end gap-2 mr-3">
                        {canEdit && (
                            <TjBoxForm
                                mode="edit"
                                data={{ id: tjBox.id }}
                                api="/tj-boxes"
                                method="PUT"
                            />
                        )}
                        {canDelete && (
                            <DeleteModal
                                api_url={`/tj-boxes/${tjBox.id}`}
                                keys="tj-boxes"
                                confirmMessage="tj_box.delete_confirmation"
                                buttonText="common.confirm_delete"
                            />
                        )}
                    </div>
                );
            },
        },
    ];
}
