"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DeleteModal } from "@/components/delete-modal";
import { usePermissions } from "@/context/app-provider";
import TelegramZoneForm from "@/components/telegram-zones/telegram-zone-form";
import { TelegramZoneRow } from "@/components/telegram-zones/telegram-zone-type";

function TelegramZoneStatusCell({ status }: { status: TelegramZoneRow["status"] }) {
  const { t } = useTranslation();

  return <span>{t(`telegram_zone.status.options.${status}`)}</span>;
}

function TelegramZoneActionsCell({ row }: { row: TelegramZoneRow }) {
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission("telegram-zones.edit");
  const canDelete = hasPermission("telegram-zones.delete");

  if (!canEdit && !canDelete) {
    return null;
  }

  return (
    <div className="flex items-center justify-end gap-2 mr-3">
      {canEdit && (
        <TelegramZoneForm mode="edit" data={{ id: row.id }} api="/telegram-zones" method="PUT" />
      )}
      {canDelete && (
        <DeleteModal
          api_url={`/telegram-zones/${row.id}`}
          keys="telegram-zones"
          confirmMessage="telegram_zone.delete_confirmation"
          buttonText="common.confirm_delete"
        />
      )}
    </div>
  );
}

export function getTelegramZoneColumns(): ColumnDef<TelegramZoneRow>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="telegram_zone.name.label" />
      ),
      cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "zones",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="telegram_zone.zones.label" />
      ),
      cell: ({ row }) => (
        <div className="max-w-[280px] truncate">
          {row.original.zones?.map((zone) => zone.name).join(", ")}
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "telegram_channel_id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="telegram_zone.telegram_channel_id.label" />
      ),
      cell: ({ row }) => <div>{row.original.telegram_channel_id}</div>,
      enableSorting: false,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="telegram_zone.status.label" />
      ),
      cell: ({ row }) => <TelegramZoneStatusCell status={row.original.status} />,
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
      cell: ({ row }) => <TelegramZoneActionsCell row={row.original} />,
    },
  ];
}
