"use client";

import { FC } from "react";
import { cn } from "@/lib/utils";
import { ClientRow } from "@/components/clients/client-type";
import ClientWhatsAppLink from "@/components/clients/client-whatsapp-link";
import { Phone } from "lucide-react";

type Props = { client: ClientRow };

const ClientNamePhoneCell: FC<Props> = ({ client }) => {
    const inactive = client.status === 0;
    const phone = client.phone?.trim() ?? "";

    return (
        <div className="flex flex-col gap-0.5 min-w-[140px]">
            <span className={cn("font-semibold text-sm", inactive && "text-destructive")}>
                {client.pppoe_username || client.client_id || "—"}
            </span>
            <span className={cn("text-sm line-clamp-1", inactive ? "text-destructive/80" : "text-foreground")}>
                {client.name}
            </span>
            <span className={cn("inline-flex items-center gap-2.5 text-xs", inactive ? "text-destructive/60" : "text-muted-foreground")}>
                {phone ? (<>
                    <a
                        href={`tel:${client.phone}`}
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                        <Phone className="h-3.5 w-3.5" />
                        {client.phone}
                    </a>
                    <div>
                        <ClientWhatsAppLink phone={phone} />
                    </div>
                </>) : "—"}
            </span>
        </div>
    );
};

export default ClientNamePhoneCell;
