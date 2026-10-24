"use client";

import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import MyButton from "@/components/my-button";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import MyBadge, { type MyBadgeType } from "@/components/my-badge";
import { DeleteModal } from "@/components/delete-modal";
import { cn } from "@/lib/utils";
import { StaffRow } from "@/components/staffs/staff-type";
import useApiMutation from "@/hooks/use-api-mutation";
import { usePermissions } from "@/context/app-provider";

const STATUS_STYLES: Record<string, string> = {
  active:
    "bg-green-600/10 text-green-600 focus-visible:ring-green-600/20 dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40",
  inactive:
    "bg-destructive/10 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 text-destructive",
};

const STATUS_BADGE_TYPES: Record<string, MyBadgeType> = {
  active: "success",
  inactive: "decline",
};

const StatusCell = ({ status }: { status: string }) => {
  const { t } = useTranslation();
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.inactive;
  const badgeType = STATUS_BADGE_TYPES[status] ?? "decline";
  return (
    <MyBadge type={badgeType} className={cn(style)}>
      <span className="capitalize">{t(`common.${status}`)}</span>
    </MyBadge>
  );
};

function StaffAccountLockButton({
  staffId,
  status,
}: {
  staffId: string;
  status: string;
}) {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const [override, setOverride] = useState<"active" | "inactive" | null>(null);
  const locked = (override ?? status) === "inactive";
  const nextStatus = locked ? "active" : "inactive";
  const label = locked ? t("staff.unlock_account") : t("staff.lock_account");

  useEffect(() => {
    setOverride(null);
  }, [status, staffId]);

  const { mutate, isPending } = useApiMutation<unknown, { status: "active" | "inactive" }>({
    url: `/staffs/${staffId}/status`,
    method: "PUT",
    invalidateKeys: "staffs",
    successMessage: locked ? "staff.account_unlocked" : "staff.account_locked",
    onSuccess: () => setOverride(nextStatus),
  });

  if (!hasPermission("staffs.status") && !hasPermission("staffs.edit")) {
    return null;
  }

  return (
    <MyButton
      type="button"
      action={locked ? "lock" : "unlock"}
      loading={isPending}
      tooltip={locked ? "staff.unlock_account" : "staff.lock_account"}
      aria-label={label}
      className="hover:bg-primary hover:text-primary-foreground px-2"
      onClick={() => {
        if (isPending) return;
        mutate({ status: nextStatus });
      }}
    />
  );
}

export const StaffColumns: ColumnDef<StaffRow>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="staff.name.label" />
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
      <DataTableColumnHeader column={column} title="staff.roles.label" />
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
      <DataTableColumnHeader column={column} title="staff.designation.label" />
    ),
    cell: ({ row }) => (
      <span className="capitalize">{row.original.designation}</span>
    ),
  },
  {
    accessorKey: "phone",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="staff.phone.label" />
    ),
    cell: ({ row }) => <span>{row.original.phone}</span>,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="staff.email.label" />
    ),
    cell: ({ row }) => <span>{row.original.email}</span>,
  },
  {
    accessorKey: "join_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="staff.join_date.label" />
    ),
    cell: ({ row }) => <span>{row.original.join_date}</span>,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="common.status" />
    ),
    cell: ({ row }) => <StatusCell status={String(row.original.status)} />,
  },
  {
    id: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="common.actions" className="text-right mr-2" />
    ),
    cell: ({ row }) => {
      const staff = row.original;
      const staffId = String(staff.id);
      return (
        <div className="flex items-center justify-end mr-2 gap-1">
          <StaffAccountLockButton staffId={staffId} status={String(staff.status ?? "active")} />
          <MyButton
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
