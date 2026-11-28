"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { FilePlus2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import MyButton from "@/components/my-button";

// Loaded on the first click; the button itself is in the toolbar from the first render.
const MissingInvoiceDialog = dynamic(() => import("@/components/invoices/missing-invoice-dialog"), {
    ssr: false,
});

/** Toolbar button that opens the "clients with no invoice this month" dialog. */
export default function MissingInvoiceButton() {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [loaded, setLoaded] = useState(false);

    return (
        <>
            <MyButton
                size="icon"
                variant="outline"
                className="shrink-0"
                tooltip="invoice.missing.button"
                aria-label={t("invoice.missing.button")}
                onClick={() => {
                    setLoaded(true);
                    setOpen(true);
                }}
            >
                <FilePlus2 className="h-4 w-4" />
            </MyButton>
            {loaded && <MissingInvoiceDialog open={open} onOpenChange={setOpen} />}
        </>
    );
}
