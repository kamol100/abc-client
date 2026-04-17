"use client";

import { FC } from "react";
import { useTranslation } from "react-i18next";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import MyButton from "@/components/my-button";
import { TicketRow } from "@/components/tickets/ticket-type";
import ClientTicketReplyForm from "./client-ticket-reply-form";
import ClientTicketMessageThread from "./client-ticket-message-thread";

interface Props {
  ticketId: string;
}

const priorityVariant = (p: string) => {
  switch (p) {
    case "high":
      return "destructive" as const;
    case "medium":
      return "secondary" as const;
    case "low":
      return "outline" as const;
    default:
      return "secondary" as const;
  }
};

const statusVariant = (s: string) => {
  switch (s) {
    case "open":
      return "default" as const;
    case "in_progress":
      return "secondary" as const;
    case "resolved":
    case "closed":
      return "outline" as const;
    default:
      return "default" as const;
  }
};

const ClientTicketView: FC<Props> = ({ ticketId }) => {
  const { t } = useTranslation();

  const { data, isLoading } = useApiQuery<ApiResponse<TicketRow>>({
    queryKey: ["client-ticket", ticketId],
    url: `client-tickets/${ticketId}`,
    pagination: false,
  });

  const ticket = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-6 w-full">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (!ticket) return null;

  const canReply = ticket.status !== "closed" && ticket.status !== "resolved";

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            {t("ticket.title_single")} #{ticket.ticketId}
          </h1>
          <Badge
            variant={priorityVariant(ticket.priority)}
            className="capitalize shrink-0"
          >
            {ticket.priority}
          </Badge>
          <Badge
            variant={statusVariant(ticket.status)}
            className="capitalize shrink-0"
          >
            {ticket.status.replace("_", " ")}
          </Badge>
        </div>
        <MyButton
          action="cancel"
          url="/client/tickets"
          title={t("ticket.back_to_list")}
          className="shrink-0"
        />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">
            {t("ticket.information")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-1">
            <span className="shrink-0 text-muted-foreground">
              {t("ticket.subject.label")}:
            </span>
            <span className="break-words">{ticket.subject?.name ?? "—"}</span>
          </div>
          <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-1">
            <span className="shrink-0 text-muted-foreground">
              {t("ticket.assigned_to.label")}:
            </span>
            <span className="break-words">
              {ticket.staff?.name ?? t("ticket.not_assigned")}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">
            {t("ticket.message.label")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border bg-muted/50 p-4 text-sm text-foreground">
            {ticket.message}
          </div>
        </CardContent>
      </Card>

      {canReply && <ClientTicketReplyForm ticketId={ticketId} />}

      <ClientTicketMessageThread ticketId={ticketId} />
    </div>
  );
};

export default ClientTicketView;
