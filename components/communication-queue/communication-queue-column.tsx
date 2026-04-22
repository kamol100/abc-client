"use client";

import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { usePermissions } from "@/context/app-provider";
import { cellIndex } from "@/lib/helper/helper";
import { CommunicationQueueResendButton } from "./communication-queue-resend-button";
import type { CommunicationQueueRow } from "./communication-queue-type";

const MESSAGE_MAX_LENGTH = 50;

type GetPagination = () => Pagination | undefined;

export function getCommunicationQueueColumns(
  getPagination: GetPagination
): ColumnDef<CommunicationQueueRow>[] {
  return [
    {
      id: "sl",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="communication_queue.sl" />
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
      accessorKey: "sms_to",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="communication_queue.sms_to.label"
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
      accessorKey: "sms_from",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="communication_queue.sms_from.label"
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
      accessorKey: "sms_type",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="communication_queue.sms_type.label"
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
          title="communication_queue.sms_count.label"
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
      accessorKey: "message",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="communication_queue.message.label"
        />
      ),
      cell: ({ row }) => (
        <CommunicationQueueMessageCell message={row.original.message} />
      ),
      enableSorting: false,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="communication_queue.status.label"
        />
      ),
      cell: ({ row }) => (
        <CommunicationQueueStatusCell status={row.original.status} />
      ),
      enableSorting: false,
    },
    {
      accessorKey: "comment",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="communication_queue.comment.label"
        />
      ),
      cell: ({ row }) => (
        <div className="text-muted-foreground max-w-[150px] truncate">
          {row.original.comment ?? "—"}
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "send_at",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="communication_queue.send_at.label"
        />
      ),
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {row.original.send_at ?? "—"}
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "expire_at",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="communication_queue.expire_at.label"
        />
      ),
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {row.original.expire_at ?? "—"}
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
        <CommunicationQueueActionsCell item={row.original} />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
}

function CommunicationQueueMessageCell({ message }: { message?: string | null }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const text = message ?? "";

  useEffect(() => {
    setExpanded(false);
  }, [message]);
  const truncated =
    text.length > MESSAGE_MAX_LENGTH
      ? `${text.slice(0, MESSAGE_MAX_LENGTH)}…`
      : text;

  if (!text) return <span className="text-muted-foreground">—</span>;

  if (text.length <= MESSAGE_MAX_LENGTH) {
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
          ? t("communication_queue.message.show_less")
          : t("communication_queue.message.show_more")}
      </button>
    </div>
  );
}

function CommunicationQueueStatusCell({
  status,
}: {
  status?: string | null;
}) {
  const { t } = useTranslation();
  const key = status ?? "unknown";
  const colorClass =
    key === "stop" || key === "failed"
      ? "text-red-600 dark:text-red-400"
      : key === "completed"
        ? "text-green-600 dark:text-green-400"
        : key === "processing"
          ? "text-blue-600 dark:text-blue-400"
          : "text-muted-foreground";
  return (
    <span className={`capitalize ${colorClass}`}>
      {t(`communication_queue.status.options.${key}`)}
    </span>
  );
}

function CommunicationQueueActionsCell({
  item,
}: {
  item: CommunicationQueueRow;
}) {
  const { hasPermission } = usePermissions();
  const canResend = hasPermission("communication-queue.resend");
  const isResendable =
    item.status === "stop" || item.status === "failed";
  const itemId = typeof item.id === "number" ? String(item.id) : item.id;

  if (!canResend || !isResendable) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <div className="flex items-center justify-end gap-2 mr-3">
      <CommunicationQueueResendButton smsId={itemId} />
    </div>
  );
}
