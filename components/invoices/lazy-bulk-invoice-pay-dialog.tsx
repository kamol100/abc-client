"use client";

import dynamic from "next/dynamic";
import { FC, useEffect, useState } from "react";
import { InvoiceDueItem } from "@/components/clients/client-type";

const BulkInvoicePayDialog = dynamic(
    () => import("@/components/invoices/bulk-invoice-pay-dialog"),
    { ssr: false },
);

interface LazyBulkInvoicePayDialogProps {
    invoiceDue: InvoiceDueItem[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const LazyBulkInvoicePayDialog: FC<LazyBulkInvoicePayDialogProps> = ({
    invoiceDue,
    open,
    onOpenChange,
}) => {
    const [keepMounted, setKeepMounted] = useState(false);

    useEffect(() => {
        if (open) setKeepMounted(true);
    }, [open]);

    if (!open && !keepMounted) return null;

    return (
        <BulkInvoicePayDialog
            invoiceDue={invoiceDue}
            open={open}
            onOpenChange={onOpenChange}
        />
    );
};

export default LazyBulkInvoicePayDialog;
