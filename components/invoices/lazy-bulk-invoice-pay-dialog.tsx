"use client";

import { FC, useEffect, useState } from "react";
import { InvoiceDueItem } from "@/components/clients/client-type";

type PayDialogComponent = typeof import("@/components/invoices/bulk-invoice-pay-dialog").default;

interface LazyBulkInvoicePayDialogProps {
    invoiceDue: InvoiceDueItem[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onLoadingChange?: (loading: boolean) => void;
}

const LazyBulkInvoicePayDialog: FC<LazyBulkInvoicePayDialogProps> = ({
    invoiceDue,
    open,
    onOpenChange,
    onLoadingChange,
}) => {
    const [PayDialog, setPayDialog] = useState<PayDialogComponent | null>(null);

    useEffect(() => {
        if (!open || PayDialog) {
            if (PayDialog) onLoadingChange?.(false);
            return;
        }

        let cancelled = false;
        onLoadingChange?.(true);

        void import("@/components/invoices/bulk-invoice-pay-dialog")
            .then((mod) => {
                if (cancelled) return;
                setPayDialog(() => mod.default);
                onLoadingChange?.(false);
            })
            .catch(() => {
                if (!cancelled) onLoadingChange?.(false);
            });

        return () => {
            cancelled = true;
        };
    }, [open, PayDialog, onLoadingChange]);

    if (!PayDialog) return null;

    return (
        <PayDialog
            invoiceDue={invoiceDue}
            open={open}
            onOpenChange={onOpenChange}
        />
    );
};

export default LazyBulkInvoicePayDialog;
