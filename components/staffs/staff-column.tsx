"use client";

import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowLeftRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import MyButton from "@/components/my-button";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import MyBadge, { type MyBadgeType } from "@/components/my-badge";
import { DeleteModal } from "@/components/delete-modal";
import FormBuilder from "@/components/form-wrapper/form-builder";
import { MyDialog } from "@/components/my-dialog";
import MyTooltip from "@/components/my-tooltip";
import { StaffResetPasswordFormFieldSchema } from "@/components/staffs/staff-form-schema";
import {
  STAFF_RESET_PASSWORD_DEFAULTS,
  StaffResetPasswordSchema,
  StaffRow,
} from "@/components/staffs/staff-type";
import useApiMutation from "@/hooks/use-api-mutation";
import { useStartImpersonation } from "@/hooks/use-start-impersonation";
import { usePermissions, useProfile } from "@/context/app-provider";
import {
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

const STATUS_BADGE_TYPES: Record<string, MyBadgeType> = {
  active: "success",
  inactive: "decline",
};

const StatusCell = ({ status }: { status: string }) => {
  const { t } = useTranslation();
  const badgeType = STATUS_BADGE_TYPES[status] ?? "decline";
  return (
    <MyBadge type={badgeType} variant="soft">
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

function StaffImpersonateButton({ staff }: { staff: StaffRow }) {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const { profile } = useProfile();
  const { impersonate, switching } = useStartImpersonation();
  const [open, setOpen] = useState(false);
  const staffId = String(staff.id);
  const hasLogin = Boolean(staff.user?.uuid);
  const inactive = String(staff.status ?? "active") === "inactive";
  const isOwnAccount =
    (profile?.id != null && profile.id === staff.user?.uuid) ||
    (profile?.staff?.id != null && profile.staff.id === staffId);
  const canStart = hasLogin && !inactive && !switching && !isOwnAccount;

  if (!hasPermission("impersonate.staff") || isOwnAccount) {
    return null;
  }

  const handleConfirm = async (close: () => void) => {
    const started = await impersonate({ id: staffId }, "staff");
    if (started) {
      close();
    }
  };

  return (
    <>
      <MyTooltip content="staff.impersonate.tooltip">
        <span className="inline-flex">
          <MyButton
            type="button"
            aria-label={t("staff.impersonate.tooltip")}
            disabled={!canStart}
            className="hover:bg-primary hover:text-primary-foreground px-2"
            onClick={() => setOpen(true)}
          >
            <ArrowLeftRight />
          </MyButton>
        </span>
      </MyTooltip>
      <MyDialog
        open={open}
        onOpenChange={setOpen}
        size="sm"
        loading={switching}
        footer={({ close, loading }) => (
          <>
            <MyButton
              action="cancel"
              variant="outline"
              size="default"
              onClick={close}
              disabled={loading}
              title={t("common.cancel")}
            />
            <MyButton
              type="button"
              variant="default"
              size="default"
              icon={false}
              onClick={() => {
                void handleConfirm(close);
              }}
              disabled={loading || !canStart}
              loading={loading}
              title="staff.impersonate.confirm_action"
            />
          </>
        )}
      >
        <div className="flex flex-col items-center text-center gap-4 py-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <ArrowLeftRight className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-2">
            <DialogTitle className="text-center">
              {t("staff.impersonate.confirm_title")}
            </DialogTitle>
            <DialogDescription className="text-center">
              {t("staff.impersonate.confirm", { name: staff.name })}
            </DialogDescription>
          </div>
        </div>
      </MyDialog>
    </>
  );
}

function StaffResetPasswordButton({
  staffId,
  staffName,
}: {
  staffId: string;
  staffName: string;
}) {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const [open, setOpen] = useState(false);

  if (!hasPermission("staffs.reset-password") && !hasPermission("staffs.edit")) {
    return null;
  }

  return (
    <>
      <MyButton
        type="button"
        action="reset"
        tooltip="staff.reset_password.title"
        aria-label={t("staff.reset_password.title")}
        className="hover:bg-primary hover:text-primary-foreground px-2"
        onClick={() => setOpen(true)}
      />
      <MyDialog
        open={open}
        onOpenChange={setOpen}
        size="sm"
        title="staff.reset_password.title"
      >
        {open ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm font-medium capitalize text-foreground">{staffName}</p>
            <FormBuilder
              formSchema={StaffResetPasswordFormFieldSchema()}
              grids={1}
              data={STAFF_RESET_PASSWORD_DEFAULTS}
              api={`/staffs/${staffId}/password`}
              mode="create"
              schema={StaffResetPasswordSchema}
              method="PUT"
              queryKey="staffs"
              successMessage="staff.reset_password.success"
              submitTitle="staff.reset_password.submit"
            />
          </div>
        ) : null}
      </MyDialog>
    </>
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
    accessorKey: "zones",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="staff.zones.label" />
    ),
    cell: ({ row }) => (
      <span>{(row.original.zones ?? []).map((zone) => zone.name).join(", ")}</span>
    ),
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
          <StaffResetPasswordButton staffId={staffId} staffName={staff.name} />
          <MyButton
            action="edit"
            url={`/staffs/edit/${staffId}`}
            className="hover:bg-primary hover:text-primary-foreground px-2"
          />
          <StaffImpersonateButton staff={staff} />
          <DeleteModal
            api_url={`/staffs/${staffId}`}
            keys="staffs"
          />
        </div>
      );
    },
  },
];
