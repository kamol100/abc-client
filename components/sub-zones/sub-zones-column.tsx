"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../data-table/data-table-column-header";
import { SubZoneRow } from "./sub-zone-type";
import SubZoneForm from "./sub-zone-form";
import { DeleteModal } from "../delete-modal";

export const SubZonesColumns: ColumnDef<SubZoneRow>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="sub_zone.name.label" />
        ),
        cell: ({ row }) => (
            <div className="capitalize">{row.original.name}</div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "zone",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="sub_zone.zone.label" />
        ),
        cell: ({ row }) => (
            <div>{row.original.zone?.name ?? ""}</div>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "location",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="sub_zone.location.label" />
        ),
        cell: ({ row }) => (
            <div>{row.original.location ?? ""}</div>
        ),
    },
    {
        accessorKey: "network",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="sub_zone.network.label" />
        ),
        cell: ({ row }) => (
            <div>{row.original.network?.name ?? ""}</div>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "ports",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="sub_zone.ports.label" />
        ),
        cell: ({ row }) => (
            <div>{row.original.ports ?? ""}</div>
        ),
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
            const subZone = row.original;
            return (
                <div className="flex items-end justify-end gap-2 mr-3">
                    <SubZoneForm
                        mode="edit"
                        data={{ id: subZone.id }}
                        api="/sub-zones"
                        method="PUT"
                    />
                    <DeleteModal
                        api_url={`/sub-zones/${subZone.id}`}
                        keys="sub-zones"
                        confirmMessage="sub_zone.delete_confirmation"
                        buttonText="common.confirm_delete"
                    />
                </div>
            );
        },
    },
];
