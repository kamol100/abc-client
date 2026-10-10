"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DeleteModal } from "@/components/delete-modal";
import FeatureForm from "@/components/subscription/feature-form";
import FeaturePermissionEditor from "@/components/subscription/feature-permission-editor";
import { FeatureRow } from "@/components/subscription/feature-type";
import { usePermissions } from "@/context/app-provider";

export const FeatureColumns: ColumnDef<FeatureRow>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="subscription.feature.name" />,
    cell: ({ row }) => row.original.name,
  },
  {
    accessorKey: "key",
    header: ({ column }) => <DataTableColumnHeader column={column} title="subscription.feature.key" />,
    cell: ({ row }) => row.original.key,
  },
  {
    accessorKey: "permissions_count",
    header: ({ column }) => <DataTableColumnHeader column={column} title="subscription.feature.permissions" />,
    cell: ({ row }) => row.original.permissions_count ?? 0,
  },
  {
    id: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} className="flex justify-end mr-3" title="common.actions" />
    ),
    cell: ({ row }) => <FeatureActions feature={row.original} />,
  },
];

function FeatureActions({ feature }: { feature: FeatureRow }) {
  const { hasPermission } = usePermissions();

  return (
    <div className="flex items-center justify-end gap-2">
      {hasPermission("features.permissions") && <FeaturePermissionEditor featureId={feature.id} />}
      {hasPermission("features.edit") && (
        <FeatureForm mode="edit" data={feature} api="/features" method="PUT" />
      )}
      {hasPermission("features.delete") && (
        <DeleteModal
          api_url={`/features/${feature.id}`}
          keys="features"
          confirmMessage="subscription.feature.delete_confirm"
          buttonText="common.confirm_delete"
        />
      )}
    </div>
  );
}
