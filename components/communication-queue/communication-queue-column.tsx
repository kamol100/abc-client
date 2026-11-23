"use client";

import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import {
  CircleCheck,
  CircleHelp,
  CircleStop,
  CircleX,
  Clock,
  LoaderCircle,
  type LucideIcon,
} from "lucide-react";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { usePermissions } from "@/context/app-provider";
import { cellIndex } from "@/lib/helper/helper";
import { cn } from "@/lib/utils";
import { CommunicationQueueResendButton } from "./communication-queue-resend-button";
import { CommunicationQueueStopButton } from "./communication-queue-stop-button";
import { CommunicationQueueDeleteButton } from "./communication-queue-delete-button";
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

const STATUS_BADGES: Record<string, { icon: LucideIcon; className: string; iconClassName?: string }> = {
  pending: { icon: Clock, className: "theme-badge-warning" },
  processing: { icon: LoaderCircle, className: "theme-badge-info", iconClassName: "motion-safe:animate-spin" },
  completed: { icon: CircleCheck, className: "theme-badge-success" },
  sent: { icon: CircleCheck, className: "theme-badge-success" },
  failed: { icon: CircleX, className: "theme-badge-danger" },
  stop: { icon: CircleStop, className: "theme-badge-danger" },
  unknown: { icon: CircleHelp, className: "theme-badge-muted" },
};

function CommunicationQueueStatusCell({
  status,
}: {
  status?: string | null;
}) {
  const { t } = useTranslation();
  const key = status && STATUS_BADGES[status] ? status : "unknown";
  const { icon: Icon, className, iconClassName } = STATUS_BADGES[key];

  return (
    <Badge variant="outline" className={cn("gap-1 whitespace-nowrap", className)}>
      <Icon className={cn("size-3.5 shrink-0", iconClassName)} aria-hidden />
      {t(`communication_queue.status.options.${key}`)}
    </Badge>
  );
}

function CommunicationQueueActionsCell({
  item,
}: {
  item: CommunicationQueueRow;
}) {
  const { hasPermission } = usePermissions();
  const canResend =
    hasPermission("communication-queue.resend") &&
    (item.status === "stop" || item.status === "failed");
  // Only SMS still waiting can be stopped; processing ones are already with the gateway.
  const canStop = hasPermission("communication-queue.stop") && item.status === "pending";
  // Delete works for every status; it asks for a reason first.
  const canDelete = hasPermission("communication-queue.delete");
  const itemId = typeof item.id === "number" ? String(item.id) : item.id;

  if (!canResend && !canStop && !canDelete) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <div className="flex items-center justify-end gap-2 mr-3">
      {canResend && <CommunicationQueueResendButton smsId={itemId} />}
      {canStop && <CommunicationQueueStopButton smsId={itemId} />}
      {canDelete && <CommunicationQueueDeleteButton smsId={itemId} />}
    </div>
  );
}
