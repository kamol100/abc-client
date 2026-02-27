"use client";

import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../data-table/data-table-column-header";
import { UserRow, getUserStatusLabel } from "./user-type";
import UserForm from "./user-form";
import { DeleteModal } from "../delete-modal";

export const UsersColumns: ColumnDef<UserRow>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="name" />
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
      <DataTableColumnHeader column={column} title={"Roles"} />
    ),
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate capitalize font-medium">
            {user.roles?.map((role) => role.name).join(", ")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "company",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={"Company"} />
    ),
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate capitalize font-medium">
            {user.company?.name}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "domain",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={"Domain"} />
    ),
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate capitalize font-medium">
            {user.domain ?? user.company?.domain ?? ""}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex line-clamp-1 truncate items-center">
          {user.email}
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
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const user = row.original;
      const status = user.status as 0 | 1;
      return (
        <div className="flex w-[100px] items-center">
          <span
            className={cn(
              "capitalize",
              status === 1 ? "text-green-500" : "text-red-500"
            )}
          >
            {getUserStatusLabel(status)}
          </span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="actions" />
    ),
    cell: ({ row }) => {
      const data = row.original;
      return (
        <div className="flex items-center gap-2">
          <UserForm mode="edit" data={{ id: data.id }} api="/users" method="PUT" />
          <DeleteModal
            api_url={`/users/${data.id}`}
            keys="users"
            confirmMessage="delete_user_confirmation"
            buttonText="confirm_delete"
          >
          </DeleteModal>
        </div>
      );
    },
  },
];
