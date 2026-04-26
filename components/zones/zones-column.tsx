"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../data-table/data-table-column-header";
import { ZoneRow } from "./zone-type";
import ZoneForm from "./zone-form";
import { DeleteModal } from "../delete-modal";

export const ZonesColumns: ColumnDef<ZoneRow>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="zone.name.label" />
        ),
        cell: ({ row }) => (
            <div className="capitalize">{row.original.name}</div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "subZone",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="zone.sub_zones.label" />
        ),
        cell: ({ row }) => {
            const subZones = row.original.subZone;
            return (
                <div className="max-w-[300px] truncate">
                    {subZones?.map((s) => s.name).join(", ") ?? ""}
                </div>
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
            const zone = row.original;
            return (
                <div className="flex items-end justify-end gap-2 mr-3">
                    <ZoneForm
                        mode="edit"
                        data={{ id: zone.id }}
                        api="/zones"
                        method="PUT"
                    />
                    <DeleteModal
                        api_url={`/zones/${zone.id}`}
                        keys="zones"
                        confirmMessage="zone.delete_confirmation"
                        buttonText="common.confirm_delete"
                    />
                </div>
            );
        },
    },
];
