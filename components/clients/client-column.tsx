"use client";

import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../data-table/data-table-column-header";
import { User } from "../schema/user";
import { Badge } from "../ui/badge";
import ClientForm from "./client-form";

export const ClientColumns: ColumnDef<User>[] = [
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
    accessorKey: "address",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={"Address"} />
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
      <DataTableColumnHeader column={column} title={"Ip"} />
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
          <ClientForm
            mode="edit"
            data={data}
            api="/clients"
            method={"PUT" as any}
          />
        </>
      );
    },
  },
];
