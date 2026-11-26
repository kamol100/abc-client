"use client";

import { FC } from "react";
import { Phone } from "lucide-react";
import ClientCopyPhoneButton from "@/components/clients/client-copy-phone-button";
import { ClientRow, getClientId } from "@/components/clients/client-type";
import ClientViewLink from "@/components/clients/view-mode/client-view-link";
import ClientWhatsAppLink from "@/components/clients/client-whatsapp-link";
import { usePermissions } from "@/context/app-provider";
import { cn } from "@/lib/utils";

type Props = {
    client: ClientRow;
    linkToView?: boolean;
};

const ClientNamePhoneCell: FC<Props> = ({ client, linkToView = true }) => {
    const { hasPermission } = usePermissions();
    const inactive = client.status === 0;
    const phone = client.phone?.trim() ?? "";
    const clientId = getClientId(client);
    const identity = client.pppoe_username || client.client_id || "—";
    const canView = linkToView && Boolean(clientId) && identity !== "—" && hasPermission("clients.show");
    const identityClass = cn(
        "font-semibold text-sm w-fit",
        inactive && "text-destructive",
        canView && "underline-offset-4 hover:underline",
    );

    return (
        <div className="flex flex-col gap-0.5 min-w-[140px]">
            {canView ? (
                <ClientViewLink clientId={clientId ?? ""} className={identityClass}>
                    {identity}
                </ClientViewLink>
            ) : (
                <span className={identityClass}>{identity}</span>
            )}
            <span className={cn("text-sm line-clamp-1", inactive ? "text-destructive/80" : "text-foreground")}>
                {client.name}
            </span>
            <span className={cn("inline-flex items-center gap-2.5 text-xs", inactive ? "text-destructive/60" : "text-muted-foreground")}>
                {phone ? (<>
                    <a
                        href={`tel:${client.phone}`}
                        className="inline-flex items-center gap-1 hover:underline"
                    >
                        <Phone className="h-3.5 w-3.5" />
                        {client.phone}
                    </a>
                    <div>
                        <ClientWhatsAppLink phone={phone} />
                    </div>
                    <ClientCopyPhoneButton phone={phone} />
                </>) : "—"}
            </span>
        </div>
    );
};

export default ClientNamePhoneCell;
