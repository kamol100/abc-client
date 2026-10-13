"use client";

import Link from "next/link";
import { PlugZap } from "lucide-react";
import { toast } from "react-toastify";

/**
 * Toast offered after an OLT with access was saved in the device form: a link to the OLT page that runs
 * "Test connection" there (?test=1). The toast container sits outside the i18n provider, so the texts
 * arrive translated.
 */
export function offerOltConnectionTest(oltId: string, texts: { message: string; button: string }) {
    toast.info(
        <div className="flex flex-col gap-2 text-sm">
            <span>{texts.message}</span>
            <Link
                href={`/olts/view/${oltId}?test=1`}
                className="inline-flex items-center gap-1.5 self-start rounded-md border border-primary px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary hover:text-primary-foreground"
            >
                <PlugZap className="h-3.5 w-3.5" aria-hidden />
                {texts.button}
            </Link>
        </div>,
        { autoClose: 15_000, closeOnClick: false }
    );
}

/** The OLT was saved with SNMP or CLI credentials in this request (a blank secret on edit keeps the stored one). */
export function savedOltAccess(
    payload: Record<string, unknown>,
    oltTypeIds: (string | number)[]
): boolean {
    const isOlt = oltTypeIds.some((id) => String(id) === String(payload.device_type_id));
    const hasAccess = !!payload.snmp_community || payload.cli_protocol === "telnet" || payload.cli_protocol === "ssh";
    return isOlt && hasAccess;
}
