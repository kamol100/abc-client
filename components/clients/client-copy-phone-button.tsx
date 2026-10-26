"use client";

import { useTranslation } from "react-i18next";
import { Copy } from "lucide-react";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";

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

type Props = {
    phone: string;
    className?: string;
};

export default function ClientCopyPhoneButton({ phone, className }: Props) {
    const { t } = useTranslation();
    const value = phone.trim();
    if (!value) return null;

    const notifyCopied = (copied: boolean) => {
        if (copied) toast.success(t("client.phone_copied"));
        else toast.error(t("common.request_failed"));
    };

    const handleCopyPhone = () => {
        if (window.isSecureContext && navigator.clipboard?.writeText) {
            void navigator.clipboard.writeText(value).then(
                () => notifyCopied(true),
                () => notifyCopied(copyWithCommand(value)),
            );
            return;
        }

        notifyCopied(copyWithCommand(value));
    };

    return (
        <button
            type="button"
            onClick={(event) => {
                event.stopPropagation();
                void handleCopyPhone();
            }}
            aria-label={t("client.copy_phone")}
            title={t("client.copy_phone")}
            className={cn("inline-flex shrink-0 text-muted-foreground hover:text-foreground", className)}
        >
            <Copy className="h-3.5 w-3.5" />
        </button>
    );
}
