"use client";

import { FC } from "react";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { TicketMessage } from "./ticket-type";
import { cn } from "@/lib/utils";

interface TicketMessageThreadProps {
    ticketId: string;
}

const TicketMessageThread: FC<TicketMessageThreadProps> = ({ ticketId }) => {
    const { t } = useTranslation();

    const { data, isLoading } = useApiQuery<ApiResponse<TicketMessage[]>>({
        queryKey: ["ticket-messages", ticketId],
        url: `tickets/${ticketId}/messages`,
        pagination: false,
        refetchInterval: 5000,
    });

    const messages = data?.data ?? [];

    if (isLoading) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <Skeleton className="h-5 w-24" />
                </CardHeader>
                <CardContent className="space-y-3">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base">
                    {t("ticket.replies")} ({messages.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                {messages.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t("ticket.no_messages")}</p>
                ) : (
                    <div className="space-y-3">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={cn(
                                    "rounded-md border p-3 text-sm",
                                    msg.client?.name
                                        ? "bg-muted/50"
                                        : "bg-background"
                                )}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-xs">
                                        {t("ticket.replied_by")}:{" "}
                                        <span className="text-muted-foreground">
                                            {msg.staff?.name ?? msg.client?.name ?? "—"}
                                        </span>
                                    </span>
                                    {msg.created_at && (
                                        <span className="text-xs text-muted-foreground">
                                            {msg.created_at}
                                        </span>
                                    )}
                                </div>
                                <p>{msg.message}</p>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default TicketMessageThread;
