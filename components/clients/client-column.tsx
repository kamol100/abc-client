"use client";

import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import ActionButton from "../action-button";
import { DataTableColumnHeader } from "../data-table/data-table-column-header";
import { User } from "../users/user-type";
import { Badge } from "../ui/badge";

export const ClientColumns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="client.name.label" />
    ),
    cell: ({ row }) => (
      <div className="w-[150px] capitalize">{row.original.name}</div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "roles",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="client.roles.label" />
    ),
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate capitalize font-medium">
            {user.roles?.map((role: Role) => role.name).join(", ")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "address",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="client.address.label" />
    ),
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate capitalize font-medium">
            {(user as any)?.address}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "ip_address",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="client.ip.label" />
    ),
    cell: ({ row }) => {
      const client = row.original;
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate capitalize font-medium">
            {(client as any)?.ip_address}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="client.email.label" />
    ),
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex w-[100px] items-center">
          <span className="capitalize"> {user.email}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="client.status.label" />
    ),
    cell: ({ row }) => {
      const user: any = row.original;
      const statusValue = Number(user.status) as 0 | 1;
      const stylesByStatus: Record<0 | 1, string> = {
        1: "bg-green-600/10 text-green-600 focus-visible:ring-green-600/20 dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5",
        0: "bg-destructive/10 [a&]:hover:bg-destructive/5 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 text-destructive",
      };
      const styles = stylesByStatus[statusValue];
      return (
        <Badge className={cn(styles)}>
          <span
            className={cn(
              "capitalize",
              statusValue === 1 ? "text-green-500" : "text-red-500"
            )}
          >
            {statusValue === 1 ? "Active" : "Inactive"}
          </span>
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="common.actions" />
    ),
    cell: ({ row }) => {
      const data = row.original;
      return (
        <>
          <ActionButton className="hover:bg-primary hover:text-primary-foreground px-2" action="edit" />
        </>
      );
    },
  },
];
