"use client";

import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/helper/helper";
import { ColumnDef } from "@tanstack/react-table";
import ActionButton from "../action-button";
import { DataTableColumnHeader } from "../data-table/data-table-column-header";
import { Badge } from "../ui/badge";
import { DeleteModal } from "../delete-modal";
import SalaryShow from "./salary-show";
import { SalaryRow } from "./salary-type";

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400",
  pending:
    "bg-yellow-600/10 text-yellow-600 dark:bg-yellow-400/10 dark:text-yellow-400",
  approved:
    "bg-blue-600/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400",
  repay:
    "bg-violet-600/10 text-violet-600 dark:bg-violet-400/10 dark:text-violet-400",
  cancelled:
    "bg-destructive/10 text-destructive dark:bg-destructive/20",
};

const TYPE_STYLES: Record<string, string> = {
  monthly:
    "bg-purple-600/10 text-purple-600 dark:bg-purple-400/10 dark:text-purple-400",
  advance:
    "bg-orange-600/10 text-orange-600 dark:bg-orange-400/10 dark:text-orange-400",
};

export const SalaryColumns: ColumnDef<SalaryRow>[] = [
  {
    accessorKey: "staff.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="staff" />
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
      <DataTableColumnHeader column={column} title="date" />
    ),
    cell: ({ row }) => <span className="text-sm">{row.original.date}</span>,
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="amount" />
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
      <DataTableColumnHeader column={column} title="salary_type" />
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
      <DataTableColumnHeader column={column} title="status" />
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
      <DataTableColumnHeader column={column} title="actions" className="flex justify-end mr-2" />
    ),
    cell: ({ row }) => {
      const salary = row.original;
      const salaryId = String(salary.id);
      return (
        <div className="flex items-end justify-end gap-1 mr-2">
          <SalaryShow salary={salary} />
          <ActionButton
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
