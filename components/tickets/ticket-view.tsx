"use client";

import { FC } from "react";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ActionButton from "@/components/action-button";
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
            <div className="space-y-4 p-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (!ticket) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold">
                        {t("ticket.title_single")} #{ticket.ticketId}
                    </h1>
                    <Badge variant={priorityVariant(ticket.priority)} className="capitalize">
                        {ticket.priority}
                    </Badge>
                    <Badge variant={statusVariant(ticket.status)} className="capitalize">
                        {ticket.status.replace("_", " ")}
                    </Badge>
                </div>
                <ActionButton action="cancel" url="/tickets" title={t("ticket.back_to_list")} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">{t("ticket.client.label")}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                        <div>
                            <span className="text-muted-foreground">{t("ticket.client_name")}: </span>
                            {ticket.client?.name ?? "—"}
                        </div>
                        <div>
                            <span className="text-muted-foreground">{t("ticket.client_phone")}: </span>
                            {ticket.client?.phone ?? "—"}
                        </div>
                        {ticket.client?.current_address && (
                            <div>
                                <span className="text-muted-foreground">{t("ticket.client_address")}: </span>
                                {ticket.client.current_address}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">{t("ticket.information")}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                        <div>
                            <span className="text-muted-foreground">{t("ticket.subject.label")}: </span>
                            {ticket.subject?.name ?? "—"}
                        </div>
                        <div>
                            <span className="text-muted-foreground">{t("ticket.assigned_to.label")}: </span>
                            {ticket.staff?.name ?? t("ticket.not_assigned")}
                        </div>
                        {ticket.tag && ticket.tag.length > 0 && (
                            <div className="flex items-center gap-1 flex-wrap">
                                <span className="text-muted-foreground">{t("ticket.tags.label")}: </span>
                                {ticket.tag.map((tag) => (
                                    <Badge key={tag.id} variant="outline" className="text-xs">
                                        {tag.name}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">{t("ticket.message.label")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md bg-muted p-4 text-sm">
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
