"use client";

import { FC } from "react";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { Badge } from "@/components/ui/badge";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Card from "../card";
import { Skeleton } from "@/components/ui/skeleton";
import MyButton from "@/components/my-button";
import { useTranslation } from "react-i18next";
import { TicketRow } from "./ticket-type";
import TicketReplyForm from "./ticket-reply-form";
import TicketMessageThread from "./ticket-message-thread";

interface TicketViewProps {
    ticketId: string;
}

const priorityVariant = (p: string) => {
    switch (p) {
        case "high": return "destructive" as const;
        case "medium": return "secondary" as const;
        case "low": return "outline" as const;
        default: return "secondary" as const;
    }
};

const statusVariant = (s: string) => {
    switch (s) {
        case "open": return "default" as const;
        case "in_progress": return "secondary" as const;
        case "resolved": return "outline" as const;
        case "closed": return "outline" as const;
        default: return "default" as const;
    }
};

const TicketView: FC<TicketViewProps> = ({ ticketId }) => {
    const { t } = useTranslation();

    const { data, isLoading } = useApiQuery<ApiResponse<TicketRow>>({
        queryKey: ["ticket", ticketId],
        url: `tickets/${ticketId}`,
        pagination: false,
    });

    const ticket = data?.data;

    if (isLoading) {
        return (
            <div className="space-y-6 w-full">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-9 w-32" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-40 w-full rounded-xl" />
                    <Skeleton className="h-40 w-full rounded-xl" />
                </div>
                <Skeleton className="h-32 w-full rounded-xl" />
            </div>
        );
    }

    if (!ticket) return null;

    return (
        <div className="space-y-6 w-full">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                        {t("ticket.title_single")} #{ticket.ticketId}
                    </h1>
                    <Badge variant={priorityVariant(ticket.priority)} className="capitalize shrink-0">
                        {ticket.priority}
                    </Badge>
                    <Badge variant={statusVariant(ticket.status)} className="capitalize shrink-0">
                        {ticket.status.replace("_", " ")}
                    </Badge>
                </div>
                <MyButton
                    action="cancel"
                    url="/tickets"
                    title={t("ticket.back_to_list")}
                    className="shrink-0"
                />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                <Card className="border-border bg-card">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-medium">
                            {t("ticket.client.label")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-1">
                            <span className="shrink-0 text-muted-foreground">
                                {t("ticket.client_name")}:
                            </span>
                            <span className="break-words">{ticket.client?.name ?? "—"}</span>
                        </div>
                        <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-1">
                            <span className="shrink-0 text-muted-foreground">
                                {t("ticket.client_phone")}:
                            </span>
                            <span className="break-words">{ticket.client?.phone ?? "—"}</span>
                        </div>
                        {ticket.client?.current_address && (
                            <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-1">
                                <span className="shrink-0 text-muted-foreground">
                                    {t("ticket.client_address")}:
                                </span>
                                <span className="break-words">{ticket.client.current_address}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-border bg-card">
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
                        {ticket.tag && ticket.tag.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5">
                                <span className="shrink-0 text-muted-foreground">
                                    {t("ticket.tags.label")}:
                                </span>
                                <span className="flex flex-wrap gap-1">
                                    {ticket.tag.map((tag) => (
                                        <Badge
                                            key={tag.id}
                                            variant="outline"
                                            className="text-xs font-normal"
                                        >
                                            {tag.name}
                                        </Badge>
                                    ))}
                                </span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card className="border-border bg-card">
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

            <TicketReplyForm ticketId={ticketId} />

            <TicketMessageThread ticketId={ticketId} />
        </div>
    );
};

export default TicketView;
