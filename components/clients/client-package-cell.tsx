"use client";

import { FC } from "react";
import { cn } from "@/lib/utils";
import { ClientRow } from "./client-type";
import DisplayCount from "../display-count";
import { toNumber } from "@/lib/helper/helper";

type Props = { client: ClientRow };

const ClientPackageCell: FC<Props> = ({ client }) => {
    console.log(client);
    const inactive = client.status === 0;
    const connLabel = [client.connection_type, client.connection_mode]
        .filter(Boolean)
        .join(" / ");

    return (
        <div className="flex flex-col gap-0.5 min-w-[130px]">
            <span className={cn("font-semibold text-sm", inactive && "text-destructive")}>
                {client.connection_date ? client.connection_date.toString() : "—"}
            </span>
            <span className={cn("text-sm", inactive ? "text-destructive/80" : "text-foreground")}>
                {client.package?.name || "—"}
            </span>
            <span className={cn("text-xs font-mono", inactive ? "text-destructive/60" : "text-muted-foreground")}>
                {client.package?.price ? <DisplayCount amount={toNumber(client.package.price as string)} formatCurrency /> : "—"}
            </span>
        </div>
    );
};

export default ClientPackageCell;
