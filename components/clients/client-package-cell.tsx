"use client";

import { FC } from "react";
import { cn } from "@/lib/utils";
import { ClientRow } from "./client-type";

type Props = { client: ClientRow };

const ClientPackageCell: FC<Props> = ({ client }) => {
    const inactive = client.status === 0;
    const connLabel = [client.connection_type, client.connection_mode]
        .filter(Boolean)
        .join(" / ");

    return (
        <div className="flex flex-col gap-0.5 min-w-[130px]">
            <span className={cn("font-semibold text-sm", inactive && "text-destructive")}>
                {connLabel || "—"}
            </span>
            <span className={cn("text-sm", inactive ? "text-destructive/80" : "text-foreground")}>
                {client.package?.name || "—"}
            </span>
            <span className={cn("text-xs font-mono", inactive ? "text-destructive/60" : "text-muted-foreground")}>
                {client.ip_address || "—"}
            </span>
        </div>
    );
};

export default ClientPackageCell;
