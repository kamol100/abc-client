"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DeviceRow } from "./device-type";
import DeviceActionsCell from "./device-actions-cell";
import DeviceStatusCell from "./device-status-cell";

const DevicePortsCell: ColumnDef<DeviceRow>["cell"] = ({ row }) => {
  const inputPort = row.original.input_port ?? "";
  const totalPort = row.original.total_port ?? "";
  const value = inputPort && totalPort ? `${inputPort}/${totalPort}` : "—";
  return <span>{value}</span>;
};

const DeviceLocationCell: ColumnDef<DeviceRow>["cell"] = ({ row }) => {
  const latitude = row.original.latitude;
  const longitude = row.original.longitude;
  const hasLocation =
    latitude !== null &&
    latitude !== undefined &&
    longitude !== null &&
    longitude !== undefined;

  if (!hasLocation) return <span>—</span>;

  return (
    <span>
      {Number(latitude).toFixed(2)} | {Number(longitude).toFixed(2)}
    </span>
  );
};

export const useDeviceColumns = (): ColumnDef<DeviceRow>[] => {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="device.name.label" />
      ),
      cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "device_type.name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="device.device_type.label" />
      ),
      cell: ({ row }) => <span>{row.original.device_type?.name ?? "—"}</span>,
      enableSorting: false,
    },
    {
      accessorKey: "network.name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="device.network.label" />
      ),
      cell: ({ row }) => <span>{row.original.network?.name ?? "—"}</span>,
      enableSorting: false,
    },
    {
      accessorKey: "zone.name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="device.zone.label" />
      ),
      cell: ({ row }) => <span>{row.original.zone?.name ?? "—"}</span>,
      enableSorting: false,
    },
    {
      accessorKey: "device.name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="device.parent_device.label" />
      ),
      cell: ({ row }) => <span>{row.original.device?.name ?? "—"}</span>,
      enableSorting: false,
    },
    {
      accessorKey: "ports",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="device.ports.label" />
      ),
      cell: DevicePortsCell,
      enableSorting: false,
    },
    {
      accessorKey: "location",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="device.location.label" />
      ),
      cell: DeviceLocationCell,
      enableSorting: false,
    },
    {
      accessorKey: "fiber_code",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="device.fiber_code.label" />
      ),
      cell: ({ row }) => <span>{row.original.fiber_code || "—"}</span>,
      enableSorting: false,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="device.status.label" />
      ),
      cell: ({ row }) => <DeviceStatusCell device={row.original} />,
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
      cell: ({ row }) => <DeviceActionsCell device={row.original} />,
      enableSorting: false,
      enableHiding: false,
    },
  ];
};
