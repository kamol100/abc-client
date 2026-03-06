"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../data-table/data-table-column-header";
import { DeleteModal } from "../delete-modal";
import InvoiceTypeForm from "./invoice-type-form";
import { InvoiceTypeRow } from "./invoice-type-type";
import { usePermissions } from "@/context/app-provider";

export function useInvoiceTypeColumns(): ColumnDef<InvoiceTypeRow>[] {
    const { hasPermission } = usePermissions();

    return [
        {
            accessorKey: "name",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="invoice_type.name.label" />
            ),
            cell: ({ row }) => (
                <div className="capitalize">{row.original.name}</div>
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "description",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="invoice_type.description.label" />
            ),
            cell: ({ row }) => (
                <div className="max-w-[200px] truncate" title={row.original.description ?? undefined}>
                    {row.original.description ?? "-"}
                </div>
            ),
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
                const invoiceType = row.original;
                const canEdit = hasPermission("invoice-types.edit");
                const canDelete =
                    hasPermission("invoice-types.delete") &&
                    (invoiceType.deletable === 1 || invoiceType.deletable === undefined);

                if (!canEdit && !canDelete) return null;

                return (
                    <div className="flex items-end justify-end gap-2 mr-3">
                        {canEdit && (
                            <InvoiceTypeForm
                                mode="edit"
                                data={{ id: invoiceType.id }}
                                api="/invoice-types"
                                method="PUT"
                            />
                        )}
                        {canDelete && (
                            <DeleteModal
                                api_url={`/invoice-types/${invoiceType.id}`}
                                keys="invoice-types"
                                confirmMessage="invoice_type.delete_confirmation"
                                buttonText="common.confirm_delete"
                            />
                        )}
                    </div>
                );
            },
        },
    ];
}
