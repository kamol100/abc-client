"use client";

import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/helper/helper";
import { ColumnDef } from "@tanstack/react-table";
import MyButton from "../my-button";
import { DataTableColumnHeader } from "../data-table/data-table-column-header";
import { Badge } from "../ui/badge";
import { DeleteModal } from "../delete-modal";
import SalaryShow from "./salary-show";
import { SalaryRow } from "./salary-type";

const STATUS_STYLES: Record<string, string> = {
  paid: "theme-badge-success",
  pending: "theme-badge-warning",
  approved: "theme-badge-info",
  repay: "theme-badge-info",
  cancelled: "theme-badge-danger",
};

const TYPE_STYLES: Record<string, string> = {
  monthly: "theme-badge-info",
  advance: "theme-badge-warning",
};

export const SalaryColumns: ColumnDef<SalaryRow>[] = [
  {
    accessorKey: "staff.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="salary.staff.label" />
    ),
    cell: ({ row }) => (
      <div className="w-[120px] capitalize font-medium">
        {row.original.staff?.name ?? "N/A"}
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="common.date" />
    ),
    cell: ({ row }) => <span className="text-sm">{row.original.date}</span>,
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="salary.amount.label" />
    ),
    cell: ({ row }) => (
      <span className="font-semibold text-primary">
        ৳{formatMoney(row.original.amount)}
      </span>
    ),
  },
  {
    accessorKey: "salary_type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="salary.salary_type.label" />
    ),
    cell: ({ row }) => {
      const type = row.original.salary_type;
      return (
        <Badge className={cn(TYPE_STYLES[type])}>
          <span className="capitalize">{type}</span>
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="common.status" />
    ),
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge className={cn(STATUS_STYLES[status])}>
          <span className="capitalize">{status}</span>
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="common.actions" className="flex justify-end mr-2" />
    ),
    cell: ({ row }) => {
      const salary = row.original;
      const salaryId = String(salary.id);
      return (
        <div className="flex items-end justify-end gap-1 mr-2">
          <SalaryShow salary={salary} />
          <MyButton
            action="edit"
            url={`/salaries/edit/${salaryId}`}
            className="hover:bg-primary hover:text-primary-foreground px-2"
          />
          {salary.status !== "repay" && (
            <DeleteModal
              api_url={`/salaries/${salaryId}`}
              keys="salaries"
            />
          )}
        </div>
      );
    },
  },
];
