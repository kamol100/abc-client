"use client";

import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DeleteModal } from "@/components/delete-modal";
import { cellIndex } from "@/lib/helper/helper";
import { usePermissions } from "@/context/app-provider";
import type { CommunicationLogRow } from "./communication-log-type";

const BODY_MAX_LENGTH = 50;

type GetPagination = () => Pagination | undefined;

export function getCommunicationLogColumns(
  getPagination: GetPagination
): ColumnDef<CommunicationLogRow>[] {
  return [
    {
      id: "sl",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="communication_log.sl" />
      ),
      cell: ({ row }) => (
        <div className="font-medium">
          {cellIndex(row.index, getPagination())}
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "channel",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="communication_log.channel.label"
        />
      ),
      cell: ({ row }) => (
        <div className="capitalize">{row.original.channel ?? "—"}</div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "body",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="communication_log.body.label"
        />
      ),
      cell: ({ row }) => (
        <CommunicationLogBodyCell body={row.original.body} />
      ),
      enableSorting: false,
    },
    {
      accessorKey: "sms_type",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="communication_log.sms_type.label"
        />
      ),
      cell: ({ row }) => (
        <div className="capitalize">
          {row.original.sms_type?.split("_")?.join(" ") ?? "—"}
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "sms_count",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="communication_log.sms_count.label"
        />
      ),
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {row.original.sms_count ?? "—"}
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "unit_price",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="communication_log.cost.label"
        />
      ),
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {row.original.unit_price ?? row.original.cost ?? "—"}
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "sms_from",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="communication_log.sms_from.label"
        />
      ),
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {row.original.sms_from ?? "—"}
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "sms_to",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="communication_log.sms_to.label"
        />
      ),
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {row.original.sms_to ?? "—"}
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="communication_log.status.label"
        />
      ),
      cell: ({ row }) => (
        <CommunicationLogStatusCell status={row.original.status} />
      ),
      enableSorting: false,
    },
    {
      accessorKey: "send_at",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="communication_log.sent_at.label"
        />
      ),
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {row.original.send_at ?? row.original.sent_at ?? "—"}
        </div>
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
      cell: ({ row }) => (
        <CommunicationLogActionsCell log={row.original} />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
}

function CommunicationLogBodyCell({ body }: { body?: string | null }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const text = body ?? "";

  useEffect(() => {
    setExpanded(false);
  }, [body]);
  const truncated =
    text.length > BODY_MAX_LENGTH
      ? `${text.slice(0, BODY_MAX_LENGTH)}…`
      : text;

  if (!text) return <span className="text-muted-foreground">—</span>;

  if (text.length <= BODY_MAX_LENGTH) {
    return (
      <span className="text-sm break-words max-w-[200px] inline-block">
        {text}
      </span>
    );
  }

  return (
    <div
      className={
        expanded
          ? "max-w-[200px] text-sm"
          : "flex max-w-[200px] flex-nowrap items-baseline gap-1 overflow-hidden text-sm"
      }
    >
      <span className={expanded ? "break-words" : "min-w-0 flex-1 truncate"}>
        {expanded ? text : truncated}
      </span>
      {!expanded ? null : " "}
      <button
        type="button"
        className="shrink-0 whitespace-nowrap text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300 text-xs font-normal p-0 align-baseline"
        onClick={() => setExpanded((v) => !v)}
      >
        {expanded
          ? t("communication_log.body.show_less")
          : t("communication_log.body.show_more")}
      </button>
    </div>
  );
}

function CommunicationLogStatusCell({ status }: { status?: string | null }) {
  const { t } = useTranslation();
  const key = status ?? "unknown";
  const colorClass =
    key === "sent"
      ? "text-green-600 dark:text-green-400"
      : key === "failed"
        ? "text-red-600 dark:text-red-400"
        : "text-muted-foreground";
  return (
    <span className={`capitalize ${colorClass}`}>
      {t(`communication_log.status.options.${key}`)}
    </span>
  );
}

function CommunicationLogActionsCell({
  log,
}: {
  log: CommunicationLogRow;
}) {
  const { hasPermission } = usePermissions();
  const canDelete = hasPermission("communication-logs.delete");
  const logId = typeof log.id === "number" ? log.id : String(log.id);

  if (!canDelete) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <div className="flex items-center justify-end gap-2 mr-3">
      <DeleteModal
        api_url={`communication-logs/${logId}`}
        keys="communicationLogs"
        confirmMessage="communication_log.delete_confirmation"
        buttonText="common.confirm_delete"
      />
    </div>
  );
}
