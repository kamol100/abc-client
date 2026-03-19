"use client";

import { ColumnDef } from "@tanstack/react-table";
import { RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import MyButton from "@/components/my-button";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DeleteModal } from "@/components/delete-modal";
import { usePermissions } from "@/context/app-provider";
import { cellIndex } from "@/lib/helper/helper";
import { ReSyncRow } from "@/components/re-sync/re-sync-type";

type UseReSyncColumnsProps = {
  pagination?: Pagination;
  syncingId?: number | null;
  onIndividualSync: (id: number) => void;
};

function isInactive(status?: string | null): boolean {
  return String(status ?? "").toLowerCase() === "inactive";
}

function isProfileMismatch(status?: string | null): boolean {
  return String(status ?? "").toLowerCase() === "not-match";
}

export function useReSyncColumns({
  pagination,
  syncingId = null,
  onIndividualSync,
}: UseReSyncColumnsProps): ColumnDef<ReSyncRow>[] {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();

  const getStatusLabel = (status?: string | null) => {
    const normalized = String(status ?? "").toLowerCase();
    if (normalized === "active") return t("re_sync.status.active");
    if (normalized === "inactive") return t("re_sync.status.inactive");
    return status ?? "-";
  };

  return [
    {
      id: "sl",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="re_sync.table.sl" />
      ),
      cell: ({ row }) => (
        <div className="font-medium">{cellIndex(row.index, pagination)}</div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "reseller",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="re_sync.table.reseller" />
      ),
      cell: ({ row }) => row.original.reseller?.name ?? "-",
      enableSorting: false,
    },
    {
      accessorKey: "client_in_mikrotik",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="re_sync.table.client_in_mikrotik"
        />
      ),
      enableSorting: false,
    },
    {
      accessorKey: "client_in_app",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="re_sync.table.client_in_app"
        />
      ),
      enableSorting: false,
    },
    {
      accessorKey: "mikrotik_profile",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="re_sync.table.mikrotik_profile"
        />
      ),
      cell: ({ row }) => (
        <p
          className={
            isProfileMismatch(row.original.profile_match)
              ? "text-red-600"
              : "text-green-600"
          }
        >
          {row.original.mikrotik_profile ?? "-"}
        </p>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "app_profile",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="re_sync.table.app_profile" />
      ),
      cell: ({ row }) => (
        <p
          className={
            isProfileMismatch(row.original.profile_match)
              ? "text-red-600"
              : "text-green-600"
          }
        >
          {row.original.app_profile ?? "-"}
        </p>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "client_status_mikrotik",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="re_sync.table.client_status_mikrotik"
        />
      ),
      cell: ({ row }) => (
        <p
          className={
            isInactive(row.original.client_status_mikrotik)
              ? "text-red-600"
              : "text-green-600"
          }
        >
          {getStatusLabel(row.original.client_status_mikrotik)}
        </p>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "client_status_app",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="re_sync.table.client_status_app"
        />
      ),
      cell: ({ row }) => (
        <p
          className={
            isInactive(row.original.client_status_app)
              ? "text-red-600"
              : "text-green-600"
          }
        >
          {getStatusLabel(row.original.client_status_app)}
        </p>
      ),
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
        const canIndividualSync =
          hasPermission("client-sync.individual-sync") &&
          syncClient.mikrotik_match === 0 &&
          syncClient.syncable === 1;
        const canDelete =
          hasPermission("client-sync.delete") &&
          syncClient.mikrotik_match === 0 &&
          syncClient.syncable === 0;

        if (!canIndividualSync && !canDelete) return null;

        return (
          <div className="mr-3 flex items-end justify-end gap-2">
            {canIndividualSync && (
              <MyButton
                variant="outline"
                size="sm"
                onClick={() => onIndividualSync(syncClient.id)}
                loading={syncingId === syncClient.id}
                className="h-8 w-8 p-0 hover:bg-primary hover:text-primary-foreground"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="sr-only">{t("re_sync.actions.individual_sync")}</span>
              </MyButton>
            )}
            {canDelete && (
              <DeleteModal
                api_url={`/client-sync/${syncClient.id}`}
                keys="re-sync"
                confirmMessage="re_sync.messages.delete_confirmation"
                buttonText="common.confirm_delete"
              />
            )}
          </div>
        );
      },
    },
  ];
}
