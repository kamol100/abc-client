"use client";

import { FC } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import { Row } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import MyButton from "@/components/my-button";
import MyTooltip from "@/components/my-tooltip";
import { DeleteModal } from "@/components/delete-modal";
import { TicketRow } from "@/components/tickets/ticket-type";

interface Props {
  row: Row<TicketRow>;
}

const ClientTicketRowActions: FC<Props> = ({ row }) => {
  const { t } = useTranslation();
  const ticket = row.original;
  const canDelete = (ticket.messages_count ?? 0) === 0;

  return (
    <div className="flex items-center justify-end gap-2 mr-3">
      <MyTooltip content="common.view" placement="top" delay={0}>
        <MyButton variant="outline" size="icon" className="h-8 w-8" asChild>
          <Link
            href={`/client/tickets/${ticket.id}`}
            aria-label={t("common.view")}
          >
            <Eye className="h-4 w-4" />
          </Link>
        </MyButton>
      </MyTooltip>
      {canDelete && (
        <DeleteModal
          api_url={`/client-tickets/${ticket.id}`}
          keys="client-tickets"
          confirmMessage="ticket.delete_confirmation"
          buttonText="common.confirm_delete"
        />
      )}
    </div>
  );
};

export default ClientTicketRowActions;
