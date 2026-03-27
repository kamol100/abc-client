"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { DataTableColumnHeader } from "../data-table/data-table-column-header";
import MyBadge from "@/components/my-badge";
import { UserRow } from "./user-type";
import UserForm from "./user-form";
import { DeleteModal } from "../delete-modal";

function UserStatusCell({ status }: { status: 0 | 1 }) {
  const { t } = useTranslation();
  return (
    <MyBadge
      type={status === 1 ? "success" : "decline"}
      title={status === 1 ? t("user.status.active_tooltip") : t("user.status.inactive_tooltip")}
      className="capitalize"
    >
      {status === 1 ? t("common.active") : t("common.inactive")}
    </MyBadge>
  );
}

export const UsersColumns: ColumnDef<UserRow>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="user.name.label" />
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
      <DataTableColumnHeader column={column} title="user.roles.label" />
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
      <DataTableColumnHeader column={column} title="user.company.label" />
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
      <DataTableColumnHeader column={column} title="user.domain.label" />
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
      <DataTableColumnHeader column={column} title="user.email.label" />
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
      <DataTableColumnHeader column={column} title="user.status.label" />
    ),
    cell: ({ row }) => {
      const user = row.original;
      const status = user.status as 0 | 1;
      return (
        <UserStatusCell status={status} />
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} className="flex justify-end capitalize mr-3" title="common.actions" />
    ),
    cell: ({ row }) => {
      const data = row.original;
      return (
        <div className="flex items-end justify-end gap-2 mr-3">
          <UserForm mode="edit" data={{ id: data.id }} api="/users" method="PUT" />
          <DeleteModal
            api_url={`/users/${data.id}`}
            keys="users"
            confirmMessage="user.delete_confirmation"
            buttonText="common.confirm_delete"
          >
          </DeleteModal>
        </div>
      );
    },
  },
];
