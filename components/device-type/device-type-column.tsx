"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DeleteModal } from "@/components/delete-modal";
import DeviceTypeForm from "./device-type-form";
import type { DeviceTypeRow } from "./device-type-type";

export const DeviceTypeColumns: ColumnDef<DeviceTypeRow>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="device_type.name.label"
      />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.original.name}</div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "note",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="device_type.note.label"
      />
    ),
    cell: ({ row }) => {
      const note = row.original.note;
      return (
        <div
          className="max-w-xs truncate text-muted-foreground"
          title={note ?? undefined}
        >
          {note ?? "—"}
        </div>
      );
    },
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
      const deviceType = row.original;
      const canDelete =
        deviceType.deletable === undefined || deviceType.deletable === 1;
      return (
        <div className="flex items-end justify-end gap-2 mr-3">
          <DeviceTypeForm
            mode="edit"
            data={{ id: deviceType.id }}
            api="/device-types"
            method="PUT"
          />
          {canDelete && (
            <DeleteModal
              api_url={`/device-types/${deviceType.id}`}
              keys="device-types"
              confirmMessage="device_type.delete_confirmation"
              buttonText="common.confirm_delete"
            />
          )}
        </div>
      );
    },
  },
];
