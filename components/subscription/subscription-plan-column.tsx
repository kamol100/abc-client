"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DeleteModal } from "@/components/delete-modal";
import MyBadge from "@/components/my-badge";
import PlanFeatureMatrix from "@/components/subscription/plan-feature-matrix";
import SubscriptionPlanForm from "@/components/subscription/subscription-plan-form";
import { SubscriptionPlanRow } from "@/components/subscription/subscription-plan-type";
import { usePermissions } from "@/context/app-provider";
import { useTranslation } from "react-i18next";

export const SubscriptionPlanColumns: ColumnDef<SubscriptionPlanRow>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="subscription.plan.name" />,
    cell: ({ row }) => row.original.name,
  },
  {
    accessorKey: "price",
    header: ({ column }) => <DataTableColumnHeader column={column} title="subscription.plan.price" />,
    cell: ({ row }) => row.original.price,
  },
  {
    accessorKey: "billing_interval",
    header: ({ column }) => <DataTableColumnHeader column={column} title="subscription.plan.interval" />,
    cell: ({ row }) => row.original.billing_interval,
  },
  {
    accessorKey: "min_clients",
    header: ({ column }) => <DataTableColumnHeader column={column} title="subscription.plan.min_clients" />,
    cell: ({ row }) => row.original.min_clients ?? 0,
  },
  {
    accessorKey: "max_clients",
    header: ({ column }) => <DataTableColumnHeader column={column} title="subscription.plan.max_clients" />,
    cell: ({ row }) => row.original.max_clients ?? 0,
  },
  {
    accessorKey: "is_active",
    header: ({ column }) => <DataTableColumnHeader column={column} title="common.status" />,
    cell: ({ row }) => <PlanStatus active={row.original.is_active} />,
  },
  {
    id: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} className="flex justify-end mr-3" title="common.actions" />
    ),
    cell: ({ row }) => <PlanActions plan={row.original} />,
  },
];

function PlanStatus({ active }: { active?: boolean }) {
  const { t } = useTranslation();
  const isActive = active !== false;

  return (
    <MyBadge type={isActive ? "success" : "error"} variant="soft">
      {t(isActive ? "common.active" : "common.inactive")}
    </MyBadge>
  );
}

function PlanActions({ plan }: { plan: SubscriptionPlanRow }) {
  const { hasPermission } = usePermissions();

  return (
    <div className="flex items-center justify-end gap-2">
      {hasPermission("subscription-plans.features") && (
        <PlanFeatureMatrix
          planId={plan.id}
          initial={(plan.features ?? []).map((feature) => ({
            id: feature.id,
            expired_mode: feature.expired_mode as "full" | "read_only" | "disabled",
          }))}
        />
      )}
      {hasPermission("subscription-plans.edit") && (
        <SubscriptionPlanForm mode="edit" data={plan} api="/subscription-plans" method="PUT" />
      )}
      {hasPermission("subscription-plans.delete") && (
        <DeleteModal
          api_url={`/subscription-plans/${plan.id}`}
          keys="subscription-plans"
          confirmMessage="subscription.plan.delete_confirm"
          buttonText="common.confirm_delete"
        />
      )}
    </div>
  );
}
