"use client";

import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { DeleteModal } from "@/components/delete-modal";
import { usePermissions } from "@/context/app-provider";
import { Row } from "@tanstack/react-table";
import { Eye, MessageSquare, Pencil } from "lucide-react";
import Link from "next/link";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { TicketRow } from "./ticket-type";
import ActionButton from "../action-button";

interface TicketRowActionsProps {
    row: Row<TicketRow>;
}

const TicketRowActions: FC<TicketRowActionsProps> = ({ row }) => {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();
    const ticket = row.original;
    const ticketId = String(ticket.id);
    const viewUrl = `/tickets/view/${ticket.id}`;
    const canDeleteAsClient = hasPermission("client.tickets.delete") && ticket.messages_count === 0;
    const deleteUrl = canDeleteAsClient ? `/client-tickets/${ticketId}` : `/tickets/${ticketId}`;

    return (
        <div className="flex items-center justify-end gap-2 mr-3">
            <TooltipProvider delayDuration={0}>
                {(hasPermission("tickets.show") || hasPermission("tickets.access")) && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                                <Link href={viewUrl} aria-label={t("common.view")}>
                                    <Eye className="h-4 w-4" />
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">{t("common.view")}</TooltipContent>
                    </Tooltip>
                )}
                {hasPermission("tickets.edit") && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <ActionButton variant="outline" size="icon" className="h-8 w-8" action="edit" aria-label={t("ticket.edit_title")}>
                            </ActionButton>
                        </TooltipTrigger>
                        <TooltipContent side="top">{t("ticket.edit_title")}</TooltipContent>
                    </Tooltip>
                )}
                {(hasPermission("tickets.reply") || hasPermission("client.tickets.reply")) && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                                <Link href={viewUrl} aria-label={t("ticket.reply.title")}>
                                    <MessageSquare className="h-4 w-4" />
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">{t("ticket.reply.title")}</TooltipContent>
                    </Tooltip>
                )}
            </TooltipProvider>
            {(hasPermission("tickets.delete") || canDeleteAsClient) && (
                <DeleteModal
                    api_url={deleteUrl}
                    keys="tickets"
                    confirmMessage="ticket.delete_confirmation"
                    buttonText="common.confirm_delete"
                />
            )}
        </div>
    );
};

export default TicketRowActions;
