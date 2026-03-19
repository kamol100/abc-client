"use client";

import { FC } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../data-table/data-table-column-header";
import { CompanyRow } from "./company-type";
import CompanyForm from "./company-form";
import { DeleteModal } from "../delete-modal";
import CompanyWalletForm from "@/components/company-wallets/company-wallet-form";
import { usePermissions } from "@/context/app-provider";
import { formatMoney } from "@/lib/helper/helper";

const CompanyActionsCell: FC<{ company: CompanyRow }> = ({ company }) => {
    const { hasPermission } = usePermissions();
    const canEdit = hasPermission("companies.edit");
    const canDelete = hasPermission("companies.delete");

    return (
        <div className="flex items-end justify-end gap-2 mr-3">
            {canEdit && (
                <CompanyForm
                    mode="edit"
                    data={{ id: company.id }}
                    api="companies"
                    method="PUT"
                />
            )}
            {canEdit && <CompanyWalletForm company={company} />}
            {canDelete && (
                <DeleteModal
                    api_url={`companies/${company.id}`}
                    keys="companies"
                    confirmMessage="company.delete_confirmation"
                    buttonText="common.confirm_delete"
                />
            )}
        </div>
    );
};

export const CompaniesColumns: ColumnDef<CompanyRow>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="company.name.label" />
        ),
        cell: ({ row }) => (
            <div className="font-medium capitalize">{row.original.name}</div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "domain",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="company.domain.label" />
        ),
        cell: ({ row }) => <div>{row.original.domain}</div>,
        enableSorting: false,
    },
    {
        accessorKey: "client_count",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="company.clients.label" />
        ),
        cell: ({ row }) => {
            const company = row.original;
            const count = company.client_count ?? company.clients?.length ?? 0;
            return <div>{count}</div>;
        },
        enableSorting: false,
    },
    {
        accessorKey: "phone",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="company.phone.label" />
        ),
        cell: ({ row }) => <div>{row.original.phone ?? ""}</div>,
        enableSorting: false,
    },
    {
        id: "balance",
        accessorFn: (row) => row.wallet?.balance,
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="company.balance.label" />
        ),
        cell: ({ row }) => {
            const balance = row.original.wallet?.balance ?? 0;
            return (
                <div className="font-semibold">
                    ৳{formatMoney(balance)}
                </div>
            );
        },
        enableSorting: false,
    },
    {
        accessorKey: "status",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="company.status.label" />
        ),
        cell: ({ row }) => {
            const status = row.original.status ?? "";
            return (
                <div className="capitalize">{status}</div>
            );
        },
        enableSorting: false,
    },
    {
        accessorKey: "email",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="company.email.label" />
        ),
        cell: ({ row }) => <div>{row.original.email ?? ""}</div>,
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
            const company = row.original;
            return <CompanyActionsCell company={company} />;
        },
    },
];
