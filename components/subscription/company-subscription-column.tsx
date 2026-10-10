"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format, isValid, parse } from "date-fns";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DeleteModal } from "@/components/delete-modal";
import MyBadge, { type MyBadgeType } from "@/components/my-badge";
import MyButton from "@/components/my-button";
import CompanySubscriptionForm from "@/components/subscription/company-subscription-form";
import { CompanySubscriptionRow } from "@/components/subscription/company-subscription-type";
import { usePermissions } from "@/context/app-provider";
import useApiMutation from "@/hooks/use-api-mutation";
import { ApiResponse } from "@/hooks/use-api-query";
import { useTranslation } from "react-i18next";

const STATUS_BADGE: Record<string, MyBadgeType> = {
  active: "success",
  trialing: "info",
  past_due: "warning",
  canceled: "decline",
  expired: "error",
};

function SubscriptionDate({ value }: { value?: string | null }) {
  if (!value) {
    return <span className="text-muted-foreground">-</span>;
  }

  const parsed = parse(value.slice(0, 10), "yyyy-MM-dd", new Date());
  if (!isValid(parsed)) {
    return <span>{value}</span>;
  }

  return <span>{format(parsed, "dd MMM yyyy")}</span>;
}

function SubscriptionStatus({ status }: { status: string }) {
  const { t } = useTranslation();

  return (
    <MyBadge type={STATUS_BADGE[status] ?? "info"} variant="soft">
      {t(`subscription.status_value.${status}`)}
    </MyBadge>
  );
}

function SubscriptionActions({ row }: { row: CompanySubscriptionRow }) {
  const { hasPermission } = usePermissions();

  return (
    <div className="flex items-center justify-end gap-2">
      {hasPermission("company-subscriptions.edit") && (
        <CompanySubscriptionForm mode="edit" data={row} api="/company-subscriptions" method="PUT" />
      )}
      {hasPermission("company-subscriptions.delete") && (
        <DeleteModal
          api_url={`/company-subscriptions/${row.id}`}
          keys="company-subscriptions"
          confirmMessage="subscription.company.delete_confirm"
          buttonText="common.confirm_delete"
        />
      )}
      <CancelSubscription id={row.id} />
    </div>
  );
}

function CancelSubscription({ id }: { id: string }) {
  const { hasPermission } = usePermissions();
  const mutation = useApiMutation<ApiResponse<unknown>>({
    url: `/company-subscriptions/${id}/cancel`,
    method: "POST",
    invalidateKeys: "company-subscriptions",
    successMessage: "subscription.company.canceled",
  });

  if (!hasPermission("company-subscriptions.cancel")) return null;

  return (
    <MyButton
      action="cancel"
      tooltip="subscription.company.cancel"
      loading={mutation.isPending}
      onClick={() => mutation.mutate()}
    />
  );
}

export const CompanySubscriptionColumns: ColumnDef<CompanySubscriptionRow>[] = [
  {
    id: "company",
    header: ({ column }) => <DataTableColumnHeader column={column} title="subscription.company.company" />,
    cell: ({ row }) => row.original.company?.name ?? "-",
  },
  {
    id: "plan",
    header: ({ column }) => <DataTableColumnHeader column={column} title="subscription.plan.name" />,
    cell: ({ row }) => row.original.plan?.name ?? "-",
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="subscription.status" />,
    cell: ({ row }) => <SubscriptionStatus status={row.original.status} />,
  },
  {
    accessorKey: "trial_days",
    header: ({ column }) => <DataTableColumnHeader column={column} title="subscription.company.trial_days" />,
    cell: ({ row }) => row.original.trial_days ?? 0,
  },
  {
    accessorKey: "grace_days",
    header: ({ column }) => <DataTableColumnHeader column={column} title="subscription.company.grace_days" />,
    cell: ({ row }) => row.original.grace_days ?? 0,
  },
  {
    accessorKey: "starts_at",
    header: ({ column }) => <DataTableColumnHeader column={column} title="subscription.starts_at" />,
    cell: ({ row }) => <SubscriptionDate value={row.original.starts_at} />,
  },
  {
    accessorKey: "ends_at",
    header: ({ column }) => <DataTableColumnHeader column={column} title="subscription.ends_at" />,
    cell: ({ row }) => <SubscriptionDate value={row.original.ends_at} />,
  },
  {
    accessorKey: "canceled_at",
    header: ({ column }) => <DataTableColumnHeader column={column} title="subscription.canceled_at" />,
    cell: ({ row }) => <SubscriptionDate value={row.original.canceled_at} />,
  },
  {
    id: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} className="flex justify-end mr-3" title="common.actions" />
    ),
    cell: ({ row }) => <SubscriptionActions row={row.original} />,
  },
];
