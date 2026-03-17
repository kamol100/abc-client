"use client";

import { FC, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import ActionButton from "@/components/action-button";
import { DialogWrapper } from "@/components/dialog-wrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { useFetch } from "@/app/actions";
import { ApiResponse } from "@/hooks/use-api-query";
import { parseApiError } from "@/lib/helper/helper";
import { Loader2, Printer } from "lucide-react";
import InvoiceReceipt from "@/components/invoices/invoice-receipt";
import { InvoiceDetail } from "./invoice-type";

const RECEIPT_PAGE_WIDTH_MM = 82;
const RECEIPT_PAGE_HEIGHT_MM = 180;
const RECEIPT_MARGIN_MM = 1;
const RECEIPT_PDF_SCALE = 2;
const PAGE_CAPACITY_BUFFER_MM = 1.5;

const toCanvas = async (element: HTMLElement) =>
    html2canvas(element, {
        scale: RECEIPT_PDF_SCALE,
        useCORS: true,
        backgroundColor: "#ffffff",
    });

const canvasHeightToMm = (canvas: HTMLCanvasElement, widthMm: number) =>
    (canvas.height * widthMm) / canvas.width;

const cloneForPdf = (element: HTMLElement) => {
    const clonedElement = element.cloneNode(true) as HTMLElement;
    clonedElement.style.width = "100%";
    clonedElement.style.maxWidth = "none";
    return clonedElement;
};

type InvoicePrintDialogProps = {
    invoices?: InvoiceDetail[];
    invoiceIds?: Array<number | null | undefined>;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

const InvoicePrintDialog: FC<InvoicePrintDialogProps> = ({
    invoices: providedInvoices = [],
    invoiceIds = [],
    open,
    onOpenChange,
}) => {
    const { t } = useTranslation();
    const receiptRef = useRef<HTMLDivElement | null>(null);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const normalizedProvidedInvoices = useMemo(
        () => providedInvoices.filter((invoice): invoice is InvoiceDetail => Boolean(invoice)),
        [providedInvoices],
    );
    const normalizedInvoiceIds = useMemo(() => Array.from(new Set(
        invoiceIds
            .map((id) => Number(id))
            .filter((id) => Number.isFinite(id) && id > 0),
    ),
    ),
        [invoiceIds],
    );

    const {
        data: detailResponse,
        isLoading: isDetailLoading,
        isError: isDetailError,
        error: detailError,
    } = useQuery<ApiResponse<InvoiceDetail[]>, Error>({
        queryKey: ["invoices", "detail", "print", normalizedInvoiceIds],
        enabled: open && normalizedProvidedInvoices.length === 0 && normalizedInvoiceIds.length > 0,
        staleTime: 30_000,
        queryFn: async () => {
            const responses = await Promise.all(
                normalizedInvoiceIds.map(
                    (invoiceId) =>
                        useFetch({ url: `/invoices/${invoiceId}` }) as Promise<ApiResponse<InvoiceDetail>>,
                ),
            );

            const invoices: InvoiceDetail[] = [];
            for (const response of responses) {
                if (!response?.success) {
                    throw new Error(parseApiError(response) || "common.failed_to_load_data");
                }
                if (response.data) invoices.push(response.data);
            }

            return {
                success: true,
                data: invoices,
            };
        },
    });

    const invoices = useMemo(
        () =>
            normalizedProvidedInvoices.length > 0
                ? normalizedProvidedInvoices
                : (detailResponse?.data ?? []),
        [detailResponse, normalizedProvidedInvoices],
    );

    const dateFormat = () => {
        const date = new Date();
        const day = date.getDate();
        const month = date.toLocaleString("en-US", { month: "long" });
        const year = date.getFullYear().toString().slice(-2);
        return `${day}-${month}-${year}`;
    };

    const handleGeneratePDF = async () => {
        if (invoices.length === 0 || !receiptRef.current) return;

        const receiptElement = receiptRef.current;
        const receiptHeader = receiptElement.querySelector<HTMLElement>("[data-receipt-header]");
        const receiptItemsHead = receiptElement.querySelector<HTMLElement>("[data-receipt-items-head]");
        const receiptItemsBody = receiptElement.querySelector<HTMLElement>("[data-receipt-items-body]");
        const receiptSummary = receiptElement.querySelector<HTMLElement>("[data-receipt-summary]");
        const receiptRows = Array.from(
            receiptElement.querySelectorAll<HTMLElement>("[data-receipt-item-row]"),
        );

        if (!receiptHeader || !receiptItemsHead || !receiptItemsBody || !receiptSummary) return;

        setIsGeneratingPdf(true);
        let stagingContainer: HTMLDivElement | null = null;
        try {
            const pageContentWidthMm = RECEIPT_PAGE_WIDTH_MM - RECEIPT_MARGIN_MM * 2;
            const pageContentHeightMm = RECEIPT_PAGE_HEIGHT_MM - RECEIPT_MARGIN_MM * 2;

            const firstInvoice = invoices[0];
            const clientName =
                firstInvoice?.client?.name?.replace(/\s+/g, "-").toLowerCase() ?? "client";
            const invoiceLabel =
                invoices.length > 1
                    ? "bulk-invoices"
                    : (firstInvoice?.trackID ?? `invoice-${firstInvoice?.id ?? ""}`);
            const pdfName = `${invoiceLabel}-${clientName}-${dateFormat()}`;

            stagingContainer = document.createElement("div");
            stagingContainer.style.position = "fixed";
            stagingContainer.style.left = "-99999px";
            stagingContainer.style.top = "0";
            stagingContainer.style.width = `${pageContentWidthMm}mm`;
            stagingContainer.style.pointerEvents = "none";
            stagingContainer.style.background = "#ffffff";
            document.body.appendChild(stagingContainer);

            const headerProbe = cloneForPdf(receiptHeader);
            const itemsHeadProbe = cloneForPdf(receiptItemsHead);
            const summaryProbe = cloneForPdf(receiptSummary);

            stagingContainer.appendChild(headerProbe);
            stagingContainer.appendChild(itemsHeadProbe);
            stagingContainer.appendChild(summaryProbe);

            const [headerCanvas, itemsHeadCanvas, summaryCanvas] = await Promise.all([
                toCanvas(headerProbe),
                toCanvas(itemsHeadProbe),
                toCanvas(summaryProbe),
            ]);

            const headerHeightMm = canvasHeightToMm(headerCanvas, pageContentWidthMm);
            const itemsHeadHeightMm = canvasHeightToMm(itemsHeadCanvas, pageContentWidthMm);
            const summaryHeightMm = canvasHeightToMm(summaryCanvas, pageContentWidthMm);

            stagingContainer.innerHTML = "";

            const rowContainerWidthPx =
                receiptItemsBody.getBoundingClientRect().width ||
                receiptElement.getBoundingClientRect().width ||
                1;
            const rowHeightsMm = receiptRows.map((row) => (
                (row.getBoundingClientRect().height * pageContentWidthMm) / rowContainerWidthPx
            ));

            const maxRowsPerPageMm = Math.max(
                pageContentHeightMm - headerHeightMm - itemsHeadHeightMm - PAGE_CAPACITY_BUFFER_MM,
                10,
            );
            const maxRowsWithSummaryMm = maxRowsPerPageMm - summaryHeightMm;

            if (maxRowsWithSummaryMm <= 0) {
                throw new Error("Invoice summary is taller than printable page height.");
            }

            const paginatedRowIndexes: number[][] = [];
            let currentPageRows: number[] = [];
            let currentRowsHeightMm = 0;

            rowHeightsMm.forEach((rowHeightMm, index) => {
                const safeRowHeightMm = Math.max(rowHeightMm, 0.5);
                if (
                    currentPageRows.length > 0 &&
                    currentRowsHeightMm + safeRowHeightMm > maxRowsPerPageMm
                ) {
                    paginatedRowIndexes.push(currentPageRows);
                    currentPageRows = [index];
                    currentRowsHeightMm = safeRowHeightMm;
                    return;
                }
                currentPageRows.push(index);
                currentRowsHeightMm += safeRowHeightMm;
            });

            if (currentPageRows.length > 0 || paginatedRowIndexes.length === 0) {
                paginatedRowIndexes.push(currentPageRows);
            }

            const lastPageRows = paginatedRowIndexes[paginatedRowIndexes.length - 1] ?? [];
            const lastPageRowsHeightMm = lastPageRows.reduce(
                (acc, rowIndex) => acc + (rowHeightsMm[rowIndex] ?? 0),
                0,
            );
            if (lastPageRowsHeightMm > maxRowsWithSummaryMm) {
                paginatedRowIndexes.push([]);
            }

            const pdf = new jsPDF({
                orientation: "p",
                unit: "mm",
                format: [RECEIPT_PAGE_WIDTH_MM, RECEIPT_PAGE_HEIGHT_MM],
                compress: true,
            });

            pdf.setProperties({ title: pdfName });

            for (let pageIndex = 0; pageIndex < paginatedRowIndexes.length; pageIndex++) {
                if (pageIndex > 0) {
                    pdf.addPage([RECEIPT_PAGE_WIDTH_MM, RECEIPT_PAGE_HEIGHT_MM], "p");
                }

                const pageRows = paginatedRowIndexes[pageIndex] ?? [];
                const includeSummary = pageIndex === paginatedRowIndexes.length - 1;

                const pageContainer = document.createElement("div");
                pageContainer.style.width = "100%";
                pageContainer.style.background = "#ffffff";
                pageContainer.style.color = "#111827";
                pageContainer.style.boxSizing = "border-box";
                pageContainer.appendChild(cloneForPdf(receiptHeader));
                pageContainer.appendChild(cloneForPdf(receiptItemsHead));

                const pageRowsContainer = cloneForPdf(receiptItemsBody);
                pageRowsContainer.innerHTML = "";
                pageRows.forEach((rowIndex) => {
                    const sourceRow = receiptRows[rowIndex];
                    if (sourceRow) {
                        pageRowsContainer.appendChild(cloneForPdf(sourceRow));
                    }
                });
                pageContainer.appendChild(pageRowsContainer);

                if (includeSummary) {
                    pageContainer.appendChild(cloneForPdf(receiptSummary));
                }

                stagingContainer.appendChild(pageContainer);
                const pageCanvas = await toCanvas(pageContainer);
                stagingContainer.removeChild(pageContainer);

                const pageImageHeightMm = canvasHeightToMm(pageCanvas, pageContentWidthMm);
                const drawableHeightMm = Math.max(pageContentHeightMm, 10);
                const drawHeightMm = Math.min(pageImageHeightMm, drawableHeightMm);

                pdf.addImage(
                    pageCanvas.toDataURL("image/png"),
                    "PNG",
                    RECEIPT_MARGIN_MM,
                    RECEIPT_MARGIN_MM,
                    pageContentWidthMm,
                    drawHeightMm,
                );
            }

            pdf.save(`${pdfName}.pdf`);
            onOpenChange(false);
        } catch (error) {
            console.error(error);
        } finally {
            stagingContainer?.remove();
            setIsGeneratingPdf(false);
        }
    };

    return (
        <DialogWrapper
            open={open}
            onOpenChange={onOpenChange}
            title="invoice.print.title"
            size="sm"
            footer={({ close }) => (
                <div className="flex justify-center w-full">
                    <div className="flex items-center gap-2">
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
                            onClick={handleGeneratePDF}
                            disabled={invoices.length === 0 || isGeneratingPdf}
                            title={t("invoice.print.print_button")}
                        >
                            {isGeneratingPdf ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Printer className="h-4 w-4" />
                            )}
                            <span>{t("invoice.print.print_button")}</span>
                        </ActionButton>
                    </div>

                </div>
            )}
        >
            {isDetailLoading && normalizedProvidedInvoices.length === 0 ? (
                <div className="space-y-3 py-1">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-[300px] w-full" />
                </div>
            ) : normalizedProvidedInvoices.length === 0 && normalizedInvoiceIds.length === 0 ? (
                <div className="rounded-md border border-muted p-3 text-sm text-muted-foreground">
                    {t("invoice.no_invoices")}
                </div>
            ) : isDetailError ? (
                <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                    {t(parseApiError(detailError) || "common.failed_to_load_data")}
                </div>
            ) : invoices.length === 0 ? (
                <div className="rounded-md border border-muted p-3 text-sm text-muted-foreground">
                    {t("invoice.no_invoices")}
                </div>
            ) : (
                <div className="h-full overflow-y-auto pr-1">
                    <div ref={receiptRef} className="bg-white">
                        <InvoiceReceipt invoices={invoices} />
                    </div>
                </div>
            )}
        </DialogWrapper>
    );
};

export default InvoicePrintDialog;
