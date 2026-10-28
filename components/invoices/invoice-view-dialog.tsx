"use client";

import { FC, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Printer } from "lucide-react";
import MyButton from "@/components/my-button";
import { MyDialog } from "@/components/my-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { useSafeProfile, useSettings } from "@/context/app-provider";
import { resolveApiAssetUrl } from "@/lib/helper/helper";
import type { InvoiceRow } from "@/components/invoices/invoice-type";
import { buildInvoiceViewModel } from "@/components/invoices/invoice-view-model";
import { InvoiceViewDocument } from "@/components/invoices/invoice-view-document";

type InvoiceViewDialogProps = {
    invoiceKey: string;
    fallback?: InvoiceRow;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

const InvoiceViewDialog: FC<InvoiceViewDialogProps> = ({
    invoiceKey,
    fallback,
    open,
    onOpenChange,
}) => {
    const { t } = useTranslation();
    const { settings } = useSettings();
    const profile = useSafeProfile()?.profile;
    const logoUrl = resolveApiAssetUrl(profile?.reseller?.logo || profile?.company?.logo);
    const sheetRef = useRef<HTMLDivElement | null>(null);
    const canFetch = open && invoiceKey.length > 0;

    const {
        data: detailResponse,
        isLoading,
        isError,
        error,
    } = useApiQuery<ApiResponse<unknown>>({
        queryKey: ["invoices", "detail", "view", invoiceKey],
        url: `invoices/${invoiceKey}`,
        pagination: false,
        enabled: canFetch,
        staleTime: 30_000,
    });

    const model = useMemo(() => {
        const fromDetail = buildInvoiceViewModel(detailResponse?.data, settings, logoUrl);
        if (fromDetail) return fromDetail;
        if (canFetch && !isError) return null;
        return buildInvoiceViewModel(fallback, settings, logoUrl);
    }, [canFetch, detailResponse?.data, fallback, isError, logoUrl, settings]);

    const handlePrint = () => {
        const sheet = sheetRef.current;
        if (!sheet || !model) return;

        const mount = document.createElement("div");
        mount.id = "invoice-view-print-root";
        mount.appendChild(sheet.cloneNode(true));
        document.body.appendChild(mount);
        document.body.classList.add("invoice-view-printing");

        const previousTitle = document.title;
        document.title = `${t("invoice.view.heading")} ${model.invoiceNumber}`;

        const cleanup = () => {
            document.title = previousTitle;
            document.body.classList.remove("invoice-view-printing");
            mount.remove();
            window.removeEventListener("afterprint", cleanup);
        };

        window.addEventListener("afterprint", cleanup);
        try {
            window.print();
        } catch {
            cleanup();
        }
    };

    return (
        <MyDialog
            open={open}
            onOpenChange={onOpenChange}
            title="invoice.view.title"
            size="4xl"
            showFooter={false}
            headerAction={(
                <MyButton
                    type="button"
                    variant="default"
                    size="default"
                    onClick={(event) => {
                        event.stopPropagation();
                        handlePrint();
                    }}
                    disabled={!model}
                    aria-label={t("invoice.actions.print")}
                >
                    <Printer className="h-4 w-4" />
                    <span>{t("invoice.print.print_button")}</span>
                </MyButton>
            )}
        >

            {isLoading && !model ? (
                <div className="space-y-3 py-1">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            ) : model ? (
                <InvoiceViewDocument ref={sheetRef} model={model} />
            ) : (
                <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                    {t(error?.message || "common.failed_to_load_data")}
                </div>
            )}
        </MyDialog>
    );
};

export default InvoiceViewDialog;
