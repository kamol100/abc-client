"use client";

import { DataTableRowActions } from "@/components/data-table/data-table-row-actions";
import { DeleteModal } from "@/components/delete-modal";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { usePermissions } from "@/context/app-provider";
import { Row } from "@tanstack/react-table";
import { Eye, MessageSquare } from "lucide-react";
import Link from "next/link";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { TicketRow } from "./ticket-type";

interface TicketRowActionsProps {
    row: Row<TicketRow>;
}

const TicketRowActions: FC<TicketRowActionsProps> = ({ row }) => {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();
    const ticket = row.original;

    return (
        <div className="flex items-end justify-end gap-2 mr-3">
            <DataTableRowActions row={row}>
                {(hasPermission("tickets.show") || hasPermission("tickets.access")) && (
                    <DropdownMenuItem asChild>
                        <Link href={`/tickets/view/${ticket.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            {t("client.actions.view")}
                        </Link>
                    </DropdownMenuItem>
                )}
                {hasPermission("tickets.reply") && (
                    <DropdownMenuItem asChild>
                        <Link href={`/tickets/view/${ticket.id}`}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            {t("ticket.reply.title")}
                        </Link>
                    </DropdownMenuItem>
                )}
            </DataTableRowActions>
            {hasPermission("tickets.delete") && (
                <DeleteModal
                    api_url={`/tickets/${ticket.id}`}
                    keys="tickets"
                    confirmMessage="ticket.delete_confirmation"
                    buttonText="common.confirm_delete"
                />
            )}
        </div>
    );
};

export default TicketRowActions;
