"use client";

import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Copy, Phone } from "lucide-react";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import { ClientRow } from "@/components/clients/client-type";
import ClientWhatsAppLink from "@/components/clients/client-whatsapp-link";

type Props = { client: ClientRow };

type LegacyClipboard = {
    execCommand(commandId: string): boolean;
};

function copyWithCommand(value: string): boolean {
    const field = document.createElement("textarea");
    field.value = value;
    field.readOnly = true;
    field.tabIndex = -1;
    field.setAttribute("aria-hidden", "true");
    field.className = "absolute -left-[9999px] top-0";
    document.body.appendChild(field);

    let copied = false;
    try {
        field.focus();
        field.select();
        const legacyClipboard = document as unknown as LegacyClipboard;
        copied = legacyClipboard.execCommand("copy");
    } catch {
        copied = false;
    } finally {
        field.remove();
    }

    return copied;
}

const ClientNamePhoneCell: FC<Props> = ({ client }) => {
    const { t } = useTranslation();
    const inactive = client.status === 0;
    const phone = client.phone?.trim() ?? "";

    const notifyCopied = (copied: boolean) => {
        if (copied) toast.success(t("client.phone_copied"));
        else toast.error(t("common.request_failed"));
    };

    const handleCopyPhone = () => {
        if (!phone) return;

        if (window.isSecureContext && navigator.clipboard?.writeText) {
            void navigator.clipboard.writeText(phone).then(
                () => notifyCopied(true),
                () => notifyCopied(copyWithCommand(phone)),
            );
            return;
        }

        notifyCopied(copyWithCommand(phone));
    };

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
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            void handleCopyPhone();
                        }}
                        aria-label={t("client.copy_phone")}
                        title={t("client.copy_phone")}
                        className="inline-flex shrink-0 text-muted-foreground hover:text-foreground"
                    >
                        <Copy className="h-3.5 w-3.5" />
                    </button>
                </>) : "—"}
            </span>
        </div>
    );
};

export default ClientNamePhoneCell;
