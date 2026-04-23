"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { useSetting } from "@/context/app-provider";
import { usePermissions } from "@/context/app-provider";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DeleteModal } from "@/components/delete-modal";
import type { CommunicationGatewayRow } from "./communication-gateway-type";
import CommunicationGatewayForm from "./communication-gateway-form";

const MASKED_API = "https://api.isptik.com/";

export function getCommunicationGatewayColumns(): ColumnDef<CommunicationGatewayRow>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="communication_gateway.name.label"
        />
      ),
      cell: ({ row }) => (
        <div className="font-medium capitalize">{row.original.name}</div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="communication_gateway.type.label"
        />
      ),
      cell: ({ row }) => (
        <div className="capitalize">{row.original.type}</div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "api",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="communication_gateway.api.label"
        />
      ),
      cell: ({ row }) => <CommunicationGatewayApiCell gateway={row.original} />,
      enableSorting: false,
    },
    {
      accessorKey: "rates_per_unit",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="communication_gateway.rates_per_unit.label"
        />
      ),
      cell: ({ row }) => (
        <div className="tabular-nums">
          {row.original.rates_per_unit ?? "—"}
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="common.status"
        />
      ),
      cell: ({ row }) => <CommunicationGatewayStatusCell status={row.original.status} />,
      enableSorting: false,
    },
    {
      id: "actions",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          className="flex justify-end capitalize mr-3"
          title="common.actions"
        />
      ),
      cell: ({ row }) => (
        <CommunicationGatewayActionsCell gateway={row.original} />
      ),
    },
  ];
}

function CommunicationGatewayApiCell({
  gateway,
}: {
  gateway: CommunicationGatewayRow;
}) {
  const roles = useSetting("roles") ?? [];
  const isSuperAdmin =
    Array.isArray(roles) && roles.includes("Super Admin");
  const canSeeApi =
    gateway.access_type === "edit" || isSuperAdmin;

  if (gateway.access_type === "view" && !isSuperAdmin) {
    return (
      <p className="text-sm text-muted-foreground truncate max-w-[200px]">
        {MASKED_API}{gateway.type}
      </p>
    );
  }
  return (
    <p className="text-sm text-muted-foreground truncate max-w-[200px]">
      {canSeeApi ? gateway.api ?? "—" : "—"}
    </p>
  );
}

function CommunicationGatewayStatusCell({
  status,
}: {
  status?: string | null;
}) {
  const { t } = useTranslation();
  const statusKey = status ?? "inactive";
  const colorClass =
    statusKey === "active"
      ? "text-green-600 dark:text-green-400"
      : statusKey === "test"
        ? "text-yellow-600 dark:text-yellow-400"
        : "text-red-600 dark:text-red-400";
  return (
    <span className={`capitalize ${colorClass}`}>
      {t(`communication_gateway.status.options.${statusKey}`)}
    </span>
  );
}

function CommunicationGatewayActionsCell({
  gateway,
}: {
  gateway: CommunicationGatewayRow;
}) {
  const { hasPermission } = usePermissions();
  const roles = useSetting("roles") ?? [];
  const isSuperAdmin =
    Array.isArray(roles) && roles.includes("Super Admin");
  const canEdit =
    (gateway.access_type === "edit" || isSuperAdmin) &&
    hasPermission("communication-gateways.show");
  const canDelete =
    (gateway.access_type === "edit" || isSuperAdmin) &&
    hasPermission("communication-gateways.delete");

  if (!canEdit && !canDelete) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <div className="flex items-center justify-end gap-2 mr-3">
      {canEdit && (
        <CommunicationGatewayForm mode="edit" data={{ id: gateway.id }} />
      )}
      {canDelete && (
        <DeleteModal
          api_url={`/communication-gateways/${gateway.id}`}
          keys="communicationGateways"
          confirmMessage="communication_gateway.delete_confirmation"
          buttonText="common.confirm_delete"
        />
      )}
    </div>
  );
}

