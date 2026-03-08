"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { usePermissions } from "@/context/app-provider";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import ActionButton from "@/components/action-button";
import { DeleteModal } from "@/components/delete-modal";
import MikrotikPackageForm from "@/components/mikrotik-packages/mikrotik-package-form";
import { MikrotikPackageRow } from "@/components/mikrotik-packages/mikrotik-package-type";
import { cellIndex } from "@/lib/helper/helper";

export function useMikrotikPackageColumns(): ColumnDef<MikrotikPackageRow>[] {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();

  return [
    {
      id: "sl",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="mikrotik_package.table.sl"
        />
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.index + 1}</div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "network.name",
      id: "network",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="mikrotik_package.table.network"
        />
      ),
      cell: ({ row }) => (
        <div>{row.original.network?.name ?? "—"}</div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="mikrotik_package.table.name"
        />
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.original.name}</div>
      ),
      enableSorting: false,
      enableHiding: false,
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
        const pkg = row.original;
        const canEdit = hasPermission("mikrotik-packages.edit");
        const canDelete = hasPermission("mikrotik-packages.delete");

        if (!canEdit && !canDelete) return null;

        const deleteUrl = `mikrotik-packages/${pkg.id}${
          pkg.network_id != null ? `?network_id=${pkg.network_id}` : ""
        }`;

        return (
          <div className="mr-3 flex items-center justify-end gap-2">
            {canEdit && (
              <MikrotikPackageForm
                mode="edit"
                data={{ id: pkg.id, network_id: pkg.network_id, network: pkg.network, name: pkg.name }}
                api="mikrotik-packages"
                method="PUT"
              />
            )}
            {canDelete && (
              <DeleteModal
                api_url={deleteUrl}
                keys="mikrotik-packages"
                confirmMessage="mikrotik_package.messages.delete_confirmation"
                buttonText="common.confirm_delete"
              />
            )}
          </div>
        );
      },
    },
  ];
}
