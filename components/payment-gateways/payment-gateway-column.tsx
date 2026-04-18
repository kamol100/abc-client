"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { CheckCircle2, CircleDashed } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DeleteModal } from "@/components/delete-modal";
import MyButton from "@/components/my-button";
import { usePermissions } from "@/context/app-provider";
import type { PaymentGatewayRow } from "./payment-gateway-type";
import PaymentGatewayStatusToggle from "./payment-gateway-status-toggle";
import PaymentGatewayDefaultAction from "./payment-gateway-default-action";

export function getPaymentGatewayColumns(): ColumnDef<PaymentGatewayRow>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="payment_gateway.name.label" />
      ),
      cell: ({ row }) => <PaymentGatewayNameCell gateway={row.original} />,
      enableHiding: false,
      enableSorting: false,
    },
    {
      accessorKey: "provider",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="payment_gateway.provider.label" />
      ),
      cell: ({ row }) => <PaymentGatewayProviderCell gateway={row.original} />,
      enableSorting: false,
    },
    {
      accessorKey: "mode",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="payment_gateway.mode.label" />
      ),
      cell: ({ row }) => <PaymentGatewayModeCell gateway={row.original} />,
      enableSorting: false,
    },
    {
      accessorKey: "currency",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="payment_gateway.currency.label" />
      ),
      cell: ({ row }) => (
        <span className="uppercase text-muted-foreground">{row.original.currency ?? "—"}</span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="common.status" />
      ),
      cell: ({ row }) => (
        <PaymentGatewayStatusToggle
          gatewayId={row.original.id}
          status={row.original.status ?? "inactive"}
        />
      ),
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
      cell: ({ row }) => <PaymentGatewayActionsCell gateway={row.original} />,
    },
  ];
}

function PaymentGatewayNameCell({ gateway }: { gateway: PaymentGatewayRow }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-2">
      <span className="font-medium capitalize">{gateway.name}</span>
      {gateway.is_default && (
        <Badge variant="secondary" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          {t("payment_gateway.badges.default")}
        </Badge>
      )}
    </div>
  );
}

function PaymentGatewayProviderCell({ gateway }: { gateway: PaymentGatewayRow }) {
  const { t } = useTranslation();
  return (
    <Badge variant="outline" className="capitalize">
      {t(`payment_gateway.provider.options.${gateway.provider}`)}
    </Badge>
  );
}

function PaymentGatewayModeCell({ gateway }: { gateway: PaymentGatewayRow }) {
  const { t } = useTranslation();
  const mode = gateway.mode ?? "sandbox";
  const tone =
    mode === "live"
      ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30"
      : "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/30";
  return (
    <Badge variant="outline" className={`${tone} gap-1`}>
      <CircleDashed className="h-3 w-3" />
      {t(`payment_gateway.mode.options.${mode}`)}
    </Badge>
  );
}

function PaymentGatewayActionsCell({ gateway }: { gateway: PaymentGatewayRow }) {
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission("payment-gateways.edit");
  const canDelete = hasPermission("payment-gateways.delete");
  const canSetDefault = hasPermission("payment-gateways.default");

  if (!canEdit && !canDelete && !canSetDefault) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <div className="flex items-center justify-end gap-2 mr-3">
      {canSetDefault && (
        <PaymentGatewayDefaultAction
          gatewayId={gateway.id}
          isDefault={Boolean(gateway.is_default)}
        />
      )}
      {canEdit && (
        <Link href={`/payment-gateways?id=${gateway.id}`}>
          <MyButton action="edit" icon />
        </Link>
      )}
      {canDelete && (
        <DeleteModal
          api_url={`/payment-gateways/${gateway.id}`}
          keys="paymentGateways"
          confirmMessage="payment_gateway.delete_confirmation"
          buttonText="common.confirm_delete"
        />
      )}
    </div>
  );
}
