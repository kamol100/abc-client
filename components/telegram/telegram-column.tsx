"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DeleteModal } from "@/components/delete-modal";
import { usePermissions } from "@/context/app-provider";
import TelegramForm from "@/components/telegram/telegram-form";
import { TelegramRow } from "@/components/telegram/telegram-type";

function TelegramStatusCell({ status }: { status: TelegramRow["status"] }) {
  const { t } = useTranslation();

  return <span>{t(`telegram.status.options.${status}`)}</span>;
}

function TelegramActionsCell({ row }: { row: TelegramRow }) {
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission("telegram.edit");
  const canDelete = hasPermission("telegram.delete");

  if (!canEdit && !canDelete) {
    return null;
  }

  return (
    <div className="flex items-center justify-end gap-2 mr-3">
      {canEdit && (
        <TelegramForm mode="edit" data={{ id: row.id }} api="/telegram" method="PUT" />
      )}
      {canDelete && (
        <DeleteModal
          api_url={`/telegram/${row.id}`}
          keys="telegram"
          confirmMessage="telegram.delete_confirmation"
          buttonText="common.confirm_delete"
        />
      )}
    </div>
  );
}

export function getTelegramColumns(): ColumnDef<TelegramRow>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="telegram.name.label" />
      ),
      cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "zones",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="telegram.zones.label" />
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
        <DataTableColumnHeader column={column} title="telegram.telegram_channel_id.label" />
      ),
      cell: ({ row }) => <div>{row.original.telegram_channel_id}</div>,
      enableSorting: false,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="telegram.status.label" />
      ),
      cell: ({ row }) => <TelegramStatusCell status={row.original.status} />,
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
      cell: ({ row }) => <TelegramActionsCell row={row.original} />,
    },
  ];
}
