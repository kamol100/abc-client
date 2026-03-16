"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../data-table/data-table-column-header";
import { ClientRow } from "./client-type";
import ClientNamePhoneCell from "./client-name-phone-cell";
import ClientZoneAddressCell from "./client-zone-address-cell";
import ClientPackageCell from "./client-package-cell";
import ClientBillingPaymentCell from "./client-billing-payment-cell";
import dynamic from 'next/dynamic';
const ClientOnlineStatusCell = dynamic(() => import('./client-online-status-cell'), { ssr: false });
import ClientStatusToggle from "./client-status-toggle";
import ClientRowActions from "./client-row-actions";

export function useClientColumns(): ColumnDef<ClientRow>[] {

    return [
        {
            id: "id_name_phone",
            accessorKey: "name",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="client.table.id_name_phone" />
            ),
            cell: ({ row }) => <ClientNamePhoneCell client={row.original} />,
            enableSorting: false,
            enableHiding: false,
        },
        {
            id: "zone_address_network",
            accessorKey: "zone",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="client.table.zone_address_network" />
            ),
            cell: ({ row }) => <ClientZoneAddressCell client={row.original} />,
            enableSorting: false,
        },
        {
            id: "connection_package",
            accessorKey: "package",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="client.table.connection_package" />
            ),
            cell: ({ row }) => <ClientPackageCell client={row.original} />,
            enableSorting: false,
        },
        {
            id: "bill_payment",
            accessorKey: "payment_deadline",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="client.table.bill_payment" />
            ),
            cell: ({ row }) => <ClientBillingPaymentCell client={row.original} />,
            enableSorting: false,
        },
        {
            id: "online_info",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="client.table.online_info" />
            ),
            cell: ({ row }) => (
                <ClientOnlineStatusCell
                    clientId={row.original.id}
                    inactive={row.original.status === 0}
                />
            ),
            enableSorting: false,
        },
        {
            accessorKey: "status",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="client.status.label" />
            ),
            cell: ({ row }) => {
                const statusValue = Number(row.original.status ?? 0) as 0 | 1;
                return (
                    <ClientStatusToggle
                        clientId={row.original.id}
                        initialStatus={statusValue}
                    />
                );
            },
            filterFn: (row, id, value) => value.includes(row.getValue(id)),
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
            cell: ({ row }) => (
                <div className="flex items-end justify-end mr-3">
                    <ClientRowActions row={row} />
                </div>
            ),
        },
    ];
}
