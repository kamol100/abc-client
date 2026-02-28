"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../data-table/data-table-column-header";
import { VendorRow } from "./vendor-type";
import VendorForm from "./vendor-form";
import { DeleteModal } from "../delete-modal";

export const VendorsColumns: ColumnDef<VendorRow>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="vendor_name" />
        ),
        cell: ({ row }) => (
            <div className="capitalize">{row.original.name}</div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "phone",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="phone" />
        ),
        cell: ({ row }) => <div>{row.original.phone}</div>,
        enableSorting: false,
    },
    {
        accessorKey: "email",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="email" />
        ),
        cell: ({ row }) => <div>{row.original.email ?? ""}</div>,
        enableSorting: false,
    },
    {
        accessorKey: "address",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="address" />
        ),
        cell: ({ row }) => (
            <div className="max-w-[200px] truncate">{row.original.address ?? ""}</div>
        ),
        enableSorting: false,
    },
    {
        id: "actions",
        header: ({ column }) => (
            <DataTableColumnHeader
                column={column}
                className="flex justify-end capitalize mr-3"
                title="actions"
            />
        ),
        cell: ({ row }) => {
            const vendor = row.original;
            return (
                <div className="flex items-end justify-end gap-2 mr-3">
                    <VendorForm
                        mode="edit"
                        data={{ id: vendor.id }}
                        api="/vendors"
                        method="PUT"
                    />
                    <DeleteModal
                        api_url={`/vendors/${vendor.id}`}
                        keys="vendors"
                        confirmMessage="delete_vendor_confirmation"
                        buttonText="confirm_delete"
                    />
                </div>
            );
        },
    },
];
