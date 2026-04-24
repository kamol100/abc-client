"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { DemoRequestRow } from "@/components/demo-requests/demo-request-type";
import DemoRequestActionsCell from "@/components/demo-requests/demo-request-actions-cell";

function FormattedDateCell({ iso }: { iso?: string | null }) {
    const { t } = useTranslation();
    if (!iso) {
        return <span className="text-muted-foreground">{t("admin_demo_request.empty_value")}</span>;
    }
    return <span>{new Date(iso).toLocaleString()}</span>;
}

function StatusCell({ status }: { status: string }) {
    const { t } = useTranslation();
    return (
        <span className="capitalize">{t(`admin_demo_request.status.${status}`)}</span>
    );
}

function OptionalTextCell({ value }: { value?: string | null }) {
    const { t } = useTranslation();
    if (value == null || value === "") {
        return <span className="text-muted-foreground">{t("admin_demo_request.empty_value")}</span>;
    }
    return <span>{value}</span>;
}

export const demoRequestsColumns: ColumnDef<DemoRequestRow>[] = [
    {
        accessorKey: "full_name",
        header: ({ column }) => (
            <DataTableColumnHeader
                column={column}
                title="admin_demo_request.fields.full_name.label"
            />
        ),
        cell: ({ row }) => (
            <div className="max-w-[200px] truncate font-medium">
                {row.original.full_name}
            </div>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "isp_name",
        header: ({ column }) => (
            <DataTableColumnHeader
                column={column}
                title="admin_demo_request.fields.isp_name.label"
            />
        ),
        cell: ({ row }) => (
            <div className="max-w-[200px] truncate">{row.original.isp_name}</div>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "email",
        header: ({ column }) => (
            <DataTableColumnHeader
                column={column}
                title="admin_demo_request.fields.email.label"
            />
        ),
        cell: ({ row }) => <OptionalTextCell value={row.original.email} />,
        enableSorting: false,
    },
    {
        accessorKey: "phone",
        header: ({ column }) => (
            <DataTableColumnHeader
                column={column}
                title="admin_demo_request.fields.phone.label"
            />
        ),
        cell: ({ row }) => <div>{row.original.phone}</div>,
        enableSorting: false,
    },
    {
        accessorKey: "status",
        header: ({ column }) => (
            <DataTableColumnHeader
                column={column}
                title="admin_demo_request.fields.status.label"
            />
        ),
        cell: ({ row }) => <StatusCell status={row.original.status} />,
        enableSorting: false,
    },
    {
        accessorKey: "created_at",
        header: ({ column }) => (
            <DataTableColumnHeader
                column={column}
                title="admin_demo_request.fields.created_at.label"
            />
        ),
        cell: ({ row }) => <FormattedDateCell iso={row.original.created_at} />,
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
        cell: ({ row }) => <DemoRequestActionsCell row={row.original} />,
    },
];
