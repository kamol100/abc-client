"use client";

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
import MyButton from "../my-button";
import TicketForm from "./ticket-form";

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
                            <MyButton variant="outline" size="icon" className="h-8 w-8" asChild>
                                <Link href={viewUrl} aria-label={t("common.view")}>
                                    <Eye className="h-4 w-4" />
                                </Link>
                            </MyButton>
                        </TooltipTrigger>
                        <TooltipContent side="top">{t("common.view")}</TooltipContent>
                    </Tooltip>
                )}
                {hasPermission("tickets.edit") && (
                    <TicketForm
                        mode="edit"
                        data={{ id: ticket.id }}
                        api="/tickets"
                        method="PUT"
                    />
                )}
                {(hasPermission("tickets.reply") || hasPermission("client.tickets.reply")) && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <MyButton variant="outline" size="icon" className="h-8 w-8" asChild>
                                <Link href={viewUrl} aria-label={t("ticket.reply.title")}>
                                    <MessageSquare className="h-4 w-4" />
                                </Link>
                            </MyButton>
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
