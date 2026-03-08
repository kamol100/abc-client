"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { cellIndex } from "@/lib/helper/helper";
import { SmsSentClientRow } from "@/components/sms-sent/sms-sent-type";

type GetPagination = () => Pagination | undefined;

export function getSmsSentColumns(
  getPagination: GetPagination
): ColumnDef<SmsSentClientRow>[] {
  return [
    {
      id: "sl",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="sms_sent.table.sl" />
      ),
      cell: ({ row }) => (
        <div className="font-medium">{cellIndex(row.index, getPagination())}</div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "id_name_phone",
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="client.table.id_name_phone" />
      ),
      cell: ({ row }) => <SmsSentClientIdentityCell client={row.original} />,
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "zone_address_network",
      accessorKey: "current_address",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="client.table.zone_address_network"
        />
      ),
      cell: ({ row }) => <SmsSentClientAddressCell client={row.original} />,
      enableSorting: false,
    },
    {
      id: "package_due",
      accessorKey: "package",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="sms_sent.table.package_due" />
      ),
      cell: ({ row }) => <SmsSentClientPackageCell client={row.original} />,
      enableSorting: false,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="client.status.label" />
      ),
      cell: ({ row }) => <SmsSentClientStatusCell status={row.original.status} />,
      enableSorting: false,
    },
  ];
}

function SmsSentClientIdentityCell({ client }: { client: SmsSentClientRow }) {
  const inactive = client.status === 0;

  return (
    <div className="flex flex-col gap-0.5 min-w-[140px]">
      <span className={inactive ? "font-semibold text-sm text-destructive" : "font-semibold text-sm"}>
        {client.pppoe_username || client.client_id || "—"}
      </span>
      <span className={inactive ? "text-sm text-destructive/80 line-clamp-1" : "text-sm line-clamp-1"}>
        {client.name}
      </span>
      <span className={inactive ? "text-xs text-destructive/60" : "text-xs text-muted-foreground"}>
        {client.phone || "—"}
      </span>
    </div>
  );
}

function SmsSentClientAddressCell({ client }: { client: SmsSentClientRow }) {
  const inactive = client.status === 0;

  return (
    <div className="flex flex-col gap-0.5 min-w-[160px]">
      <span className={inactive ? "font-semibold text-sm text-destructive" : "font-semibold text-sm"}>
        {client.zone?.name || "—"}
      </span>
      <span className={inactive ? "text-sm text-destructive/80 line-clamp-1" : "text-sm line-clamp-1"}>
        {client.current_address || "—"}
      </span>
      <span className={inactive ? "text-xs text-destructive/60" : "text-xs text-muted-foreground"}>
        {client.network?.name || "—"}
      </span>
    </div>
  );
}

function SmsSentClientPackageCell({ client }: { client: SmsSentClientRow }) {
  const { t } = useTranslation();
  const inactive = client.status === 0;

  return (
    <div className="flex flex-col gap-0.5 min-w-[150px]">
      <span className={inactive ? "font-semibold text-sm text-destructive" : "font-semibold text-sm"}>
        {client.package?.name || "—"}
      </span>
      <span className={inactive ? "text-sm text-destructive/80" : "text-sm"}>
        {client.billing_term || "—"}
      </span>
      <span className={inactive ? "text-xs text-destructive/60" : "text-xs text-muted-foreground"}>
        {t("client.table.deadline")}: {client.payment_deadline || "—"}
      </span>
    </div>
  );
}

function SmsSentClientStatusCell({ status }: { status?: number }) {
  const { t } = useTranslation();
  const isActive = status === 1;

  return (
    <span className={isActive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
      {isActive ? t("common.active") : t("common.inactive")}
    </span>
  );
}
