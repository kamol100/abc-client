"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ImportIcon, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DeleteModal } from "@/components/delete-modal";
import { MikrotikSyncRow } from "@/components/mikrotik-sync/mikrotik-sync-type";
import MyButton from "@/components/my-button";
import { Checkbox } from "@/components/ui/checkbox";
import { usePermissions } from "@/context/app-provider";
import { cellIndex } from "@/lib/helper/helper";

type UseMikrotikSyncColumnsProps = {
  pagination?: Pagination;
  syncingId?: string | null;
  selectedIds: string[];
  currentPageRows: MikrotikSyncRow[];
  onIndividualSync: (id: string) => void;
  onSelectRow: (id: string, selected: boolean) => void;
  onSelectAllCurrentPage: (ids: string[], selected: boolean) => void;
};

export function isImportable(row: MikrotikSyncRow) {
  return row.syncd_status !== "imported" && !row.client_in_app;
}

function isInactive(status?: string | null): boolean {
  return String(status ?? "").toLowerCase() === "inactive";
}

function isProfileMismatch(status?: string | null): boolean {
  return String(status ?? "").toLowerCase() === "not-match";
}

export function useMikrotikSyncColumns({
  pagination,
  syncingId = null,
  selectedIds,
  currentPageRows,
  onIndividualSync,
  onSelectRow,
  onSelectAllCurrentPage,
}: UseMikrotikSyncColumnsProps): ColumnDef<MikrotikSyncRow>[] {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const importableIds = currentPageRows.filter(isImportable).map((row) => row.id);
  const isAllSelected =
    importableIds.length > 0 && importableIds.every((id) => selectedIds.includes(id));
  const isSomeSelected = importableIds.some((id) => selectedIds.includes(id));

  const statusLabel = (status?: string | null) => {
    const normalized = String(status ?? "").toLowerCase();
    if (normalized === "active") return t("mikrotik_sync.status.active");
    if (normalized === "inactive") return t("mikrotik_sync.status.inactive");
    return status ?? "-";
  };

  return [
    {
      id: "select",
      header: () => (
        <Checkbox
          checked={isAllSelected ? true : isSomeSelected ? "indeterminate" : false}
          onCheckedChange={(value) => onSelectAllCurrentPage(importableIds, !!value)}
          disabled={importableIds.length === 0}
          aria-label={t("mikrotik_sync.table.select_all")}
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => {
        const syncRow = row.original;
        const importable = isImportable(syncRow);
        return (
          <Checkbox
            checked={importable && selectedIds.includes(syncRow.id)}
            onCheckedChange={(value) => {
              if (importable) onSelectRow(syncRow.id, !!value);
            }}
            disabled={!importable}
            aria-label={t("mikrotik_sync.table.select")}
            className="translate-y-[2px]"
          />
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "sl",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="mikrotik_sync.table.sl" />
      ),
      cell: ({ row }) => <div className="font-medium">{cellIndex(row.index, pagination)}</div>,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "reseller",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="mikrotik_sync.table.reseller" />
      ),
      cell: ({ row }) => row.original.reseller?.name ?? "-",
      enableSorting: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="mikrotik_sync.table.name" />
      ),
      enableSorting: false,
    },
    {
      accessorKey: "client_in_mikrotik",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="mikrotik_sync.table.client_in_mikrotik" />
      ),
      enableSorting: false,
    },
    {
      accessorKey: "client_in_app",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="mikrotik_sync.table.client_in_app" />
      ),
      enableSorting: false,
    },
    {
      accessorKey: "mikrotik_profile",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="mikrotik_sync.table.mikrotik_profile" />
      ),
      cell: ({ row }) => (
        <p className={isProfileMismatch(row.original.profile_match) ? "text-destructive" : "text-primary"}>
          {row.original.mikrotik_profile ?? "-"}
        </p>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "app_profile",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="mikrotik_sync.table.app_profile" />
      ),
      cell: ({ row }) => (
        <p className={isProfileMismatch(row.original.profile_match) ? "text-destructive" : "text-primary"}>
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
          title="mikrotik_sync.table.client_status_mikrotik"
        />
      ),
      cell: ({ row }) => (
        <p className={isInactive(row.original.client_status_mikrotik) ? "text-destructive" : "text-primary"}>
          {statusLabel(row.original.client_status_mikrotik)}
        </p>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "client_status_app",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="mikrotik_sync.table.client_status_app" />
      ),
      cell: ({ row }) => (
        <p className={isInactive(row.original.client_status_app) ? "text-destructive" : "text-primary"}>
          {statusLabel(row.original.client_status_app)}
        </p>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "disabled",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="mikrotik_sync.table.disabled" />
      ),
      cell: ({ row }) =>
        row.original.disabled === "true"
          ? t("mikrotik_sync.filters.disabled.options.true")
          : t("mikrotik_sync.filters.disabled.options.false"),
      enableSorting: false,
    },
    {
      accessorKey: "syncd_status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="mikrotik_sync.table.sync_status" />
      ),
      cell: ({ row }) =>
        row.original.syncd_status === "imported"
          ? t("mikrotik_sync.filters.syncd_status.options.imported")
          : t("mikrotik_sync.filters.syncd_status.options.not_imported"),
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
        const syncRow = row.original;
        const canImport = hasPermission("mikrotik-sync.show") && isImportable(syncRow);
        const canResolve =
          hasPermission("mikrotik-sync.individual-sync") &&
          syncRow.mikrotik_match === 0 &&
          syncRow.syncable === 1;
        const canDeleteImported =
          hasPermission("mikrotik-sync.delete") && syncRow.syncd_status === "imported";
        const canDeleteAppOnly =
          hasPermission("mikrotik-sync.delete") &&
          syncRow.mikrotik_match === 0 &&
          syncRow.syncable === 0 &&
          Boolean(syncRow.client_in_app) &&
          syncRow.syncd_status !== "imported";

        if (!canImport && !canResolve && !canDeleteImported && !canDeleteAppOnly) return null;

        return (
          <div className="mr-3 flex items-end justify-end gap-2">
            {canImport && (
              <MyButton
                action="edit"
                url={`/mikrotik-sync/import/${syncRow.id}`}
              >
                <ImportIcon className="h-4 w-4" />
              </MyButton>
            )}
            {canResolve && (
              <MyButton
                variant="outline"
                size="sm"
                onClick={() => onIndividualSync(syncRow.id)}
                loading={syncingId === syncRow.id}
                className="h-8 w-8 p-0 hover:bg-primary hover:text-primary-foreground"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="sr-only">{t("mikrotik_sync.actions.individual_sync")}</span>
              </MyButton>
            )}
            {(canDeleteImported || canDeleteAppOnly) && (
              <DeleteModal
                api_url={`/mikrotik-sync/${syncRow.id}`}
                keys="mikrotik-sync"
                confirmMessage={
                  canDeleteAppOnly
                    ? "mikrotik_sync.messages.delete_client_confirmation"
                    : "mikrotik_sync.messages.delete_confirmation"
                }
                buttonText="common.confirm_delete"
              />
            )}
          </div>
        );
      },
    },
  ];
}
