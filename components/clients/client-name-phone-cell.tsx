"use client";

import { FC } from "react";
import { cn } from "@/lib/utils";
import { ClientRow } from "./client-type";

type Props = { client: ClientRow };

const ClientNamePhoneCell: FC<Props> = ({ client }) => {
    const inactive = client.status === 0;

    return (
        <div className="flex flex-col gap-0.5 min-w-[140px]">
            <span className={cn("font-semibold text-sm", inactive && "text-destructive")}>
                {client.pppoe_username || client.client_id || "—"}
            </span>
            <span className={cn("text-sm line-clamp-1", inactive ? "text-destructive/80" : "text-foreground")}>
                {client.name}
            </span>
            <span className={cn("text-xs", inactive ? "text-destructive/60" : "text-muted-foreground")}>
                {client.phone || "—"}
            </span>
        </div>
    );
};

export default ClientNamePhoneCell;
