"use client";

import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../data-table/data-table-column-header";
import { User } from "../schema/user";
import UserForm from "./user-form";

export const UsersColumns: ColumnDef<User>[] = [
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
            {user.roles?.map((role: Role) => role.name).join(", ")}
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
            {user.company.domain}
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
        <div className="flex w-[100px] items-center">
          <span className="capitalize"> {user.email}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  //   {
  //     accessorKey: "type",
  //     header: ({ column }) => (
  //       <DataTableColumnHeader column={column} title="Type" />
  //     ),
  //     cell: ({ row }) => {
  //       const type = row.getValue("type");
  //       return (
  //         <div className="flex w-[100px] items-center">
  //           {type === "income" ? (
  //             <TrendingUp size={20} className="mr-2 text-green-500" />
  //           ) : (
  //             <TrendingDown size={20} className="mr-2 text-red-500" />
  //           )}
  //           <span className="capitalize"> {row.getValue("type")}</span>
  //         </div>
  //       );
  //     },
  //     filterFn: (row, id, value) => {
  //       return value.includes(row.getValue(id));
  //     },
  //   },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const user: any = row.original;
      const status = user.status;
      return (
        <div className="flex w-[100px] items-center">
          <span
            className={cn(
              "capitalize",
              status === 1 ? "text-green-500" : "text-red-500"
            )}
          >
            {status === 1 ? "Active" : "Inactive"}
          </span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  //   {
  //     accessorKey: "date",
  //     header: ({ column }) => (
  //       <DataTableColumnHeader column={column} title="Date" />
  //     ),
  //     cell: ({ row }) => {
  //       const date = new Date(row.getValue("date"));
  //       const formattedDate = date.toLocaleDateString("en-US", {
  //         day: "2-digit",
  //         month: "short",
  //         year: "numeric",
  //       });
  //       return (
  //         <div className="flex w-[100px] items-center">
  //           <span className="capitalize">{formattedDate}</span>
  //         </div>
  //       );
  //     },
  //     filterFn: (row, id, value) => {
  //       const rowDate = new Date(row.getValue(id));
  //       const [startDate, endDate] = value;
  //       return rowDate >= startDate && rowDate <= endDate;
  //     },
  //   },
  {
    id: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="actions" />
    ),
    cell: ({ row }) => {
      const data = row.original;
      return (
        <>
          <UserForm mode="edit" data={data} api="/users" method="PUT" />
        </>
      );
    },
  },
];
