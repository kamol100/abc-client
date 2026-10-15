"use client";

import { FC } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

type Props = {
    phone: string;
    className?: string;
};

export function whatsAppHref(phone: string): string {
    let digits = phone.replace(/\D/g, "");
    if (digits.startsWith("00")) digits = digits.slice(2);
    if (/^01\d{9}$/.test(digits)) digits = `880${digits.slice(1)}`;
    else if (/^1\d{9}$/.test(digits)) digits = `880${digits}`;
    return `https://wa.me/${digits}`;
}

function WhatsAppIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
            <path d="M20.52 3.48A11.86 11.86 0 0 0 12.06 0C5.5 0 .16 5.33.16 11.89c0 2.1.55 4.15 1.6 5.96L0 24l6.3-1.65a11.9 11.9 0 0 0 5.76 1.47h.01c6.56 0 11.9-5.34 11.9-11.9 0-3.18-1.24-6.16-3.45-8.44ZM12.07 21.8h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.64-.23-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.89 9.9-9.89 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.9 9.88Zm5.42-7.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z" />
        </svg>
    );
}

const ClientWhatsAppLink: FC<Props> = ({ phone, className }) => {
    const { t } = useTranslation();
    const trimmed = phone.trim();
    if (!trimmed) return null;

    return (
        <a
            href={whatsAppHref(trimmed)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("client.whatsapp")}
            title={t("client.whatsapp")}
            onClick={(event) => event.stopPropagation()}
            className={cn(
                "inline-flex text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300",
                className
            )}
        >
            <WhatsAppIcon className="h-3.5 w-3.5" />
        </a>
    );
};

export default ClientWhatsAppLink;
