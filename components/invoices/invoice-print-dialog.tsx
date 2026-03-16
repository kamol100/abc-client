"use client";

import { FC, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import ActionButton from "@/components/action-button";
import { DialogWrapper } from "@/components/dialog-wrapper";
import { Skeleton } from "@/components/ui/skeleton";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { parseApiError } from "@/lib/helper/helper";
import { Printer } from "lucide-react";
import InvoiceReceipt from "@/components/invoices/invoice-receipt";
import { InvoiceDetail, InvoiceDetailSchema } from "./invoice-type";

type InvoicePrintDialogProps = {
    invoiceId?: number | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

const InvoicePrintDialog: FC<InvoicePrintDialogProps> = ({
    invoiceId,
    open,
    onOpenChange,
}) => {
    const { t } = useTranslation();
    const receiptRef = useRef<HTMLDivElement | null>(null);

    const {
        data: detailResponse,
        isLoading: isDetailLoading,
        isError: isDetailError,
        error: detailError,
    } = useApiQuery<ApiResponse<InvoiceDetail>>({
        queryKey: ["invoices", "detail", invoiceId, "print"],
        url: `invoices/${invoiceId}`,
        pagination: false,
        enabled: open && !!invoiceId,
        staleTime: 30_000,
    });


    const invoice = useMemo(() => {
        if (!detailResponse?.data) return null;
        return detailResponse.data;
    }, [detailResponse]);

    const handlePrint = () => {
        if (!receiptRef.current) return;
        const printWindow = window.open(
            "",
            "_blank",
            "noopener,noreferrer,width=420,height=720",
        );
        if (!printWindow) return;

        const styleNodes = Array.from(
            document.querySelectorAll("style, link[rel='stylesheet']"),
        )
            .map((node) => node.outerHTML)
            .join("\n");

        printWindow.document.open();
        printWindow.document.write(`
            <html>
                <head>
                    <title>${t("invoice.print.title")}</title>
                    ${styleNodes}
                    <style>
                        @page { size: 95mm auto; margin: 5mm; }
                        body { margin: 0; padding: 0; background: #fff; }
                        .receipt-wrapper { width: 95mm; margin: 0 auto; }
                    </style>
                </head>
                <body>
                    <div class="receipt-wrapper">${receiptRef.current.outerHTML}</div>
                </body>
            </html>
        `);
        printWindow.document.close();

        setTimeout(() => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }, 350);
    };

    return (
        <DialogWrapper
            open={open}
            onOpenChange={onOpenChange}
            title="invoice.print.title"
            size="md"
            footer={({ close }) => (
                <>
                    <ActionButton
                        action="cancel"
                        variant="outline"
                        size="default"
                        onClick={close}
                        title={t("common.cancel")}
                    />
                    <ActionButton
                        variant="default"
                        size="default"
                        onClick={handlePrint}
                        disabled={!invoice}
                        title={t("invoice.print.print_button")}
                    >
                        <Printer className="h-4 w-4" />
                        <span>{t("invoice.print.print_button")}</span>
                    </ActionButton>
                </>
            )}
        >
            {isDetailLoading ? (
                <div className="space-y-3 py-1">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-[420px] w-full" />
                </div>
            ) : isDetailError || !invoice ? (
                <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                    {t(parseApiError(detailError) || "common.failed_to_load_data")}
                </div>
            ) : (
                <div className="max-h-[65vh] overflow-y-auto pr-1">
                    <div ref={receiptRef}>
                        <InvoiceReceipt invoice={invoice} />
                    </div>
                </div>
            )}
        </DialogWrapper>
    );
};

export default InvoicePrintDialog;
