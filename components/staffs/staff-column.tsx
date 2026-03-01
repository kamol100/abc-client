"use client";

import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import ActionButton from "../action-button";
import { DataTableColumnHeader } from "../data-table/data-table-column-header";
import { Badge } from "../ui/badge";
import { DeleteModal } from "../delete-modal";
import { StaffRow } from "./staff-type";

const STATUS_STYLES: Record<string, string> = {
  active:
    "bg-green-600/10 text-green-600 focus-visible:ring-green-600/20 dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40",
  inactive:
    "bg-destructive/10 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 text-destructive",
};

export const StaffColumns: ColumnDef<StaffRow>[] = [
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
      <DataTableColumnHeader column={column} title="role" />
    ),
    cell: ({ row }) => {
      const roles = row.original.roles;
      const roleNames = roles
        ?.map((r) => r.name)
        .filter(Boolean)
        .join(", ");
      return (
        <span className="max-w-[200px] truncate capitalize font-medium">
          {roleNames}
        </span>
      );
    },
  },
  {
    accessorKey: "designation",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="designation" />
    ),
    cell: ({ row }) => (
      <span className="capitalize">{row.original.designation}</span>
    ),
  },
  {
    accessorKey: "phone",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="phone" />
    ),
    cell: ({ row }) => <span>{row.original.phone}</span>,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="email" />
    ),
    cell: ({ row }) => <span>{row.original.email}</span>,
  },
  {
    accessorKey: "join_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="join_date" />
    ),
    cell: ({ row }) => <span>{row.original.join_date}</span>,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="status" />
    ),
    cell: ({ row }) => {
      const status = String(row.original.status);
      const style = STATUS_STYLES[status] ?? STATUS_STYLES.inactive;
      return (
        <Badge className={cn(style)}>
          <span className="capitalize">{status}</span>
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="actions" className="text-right mr-2" />
    ),
    cell: ({ row }) => {
      const staff = row.original;
      const staffId = String(staff.id);
      return (
        <div className="flex items-center justify-end mr-2 gap-1">
          <ActionButton
            action="edit"
            url={`/staffs/edit/${staffId}`}
            className="hover:bg-primary hover:text-primary-foreground px-2"
          />
          <DeleteModal
            api_url={`/staffs/${staffId}`}
            keys="staffs"
          />
        </div>
      );
    },
  },
];
