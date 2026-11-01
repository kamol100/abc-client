"use client";

import { FC, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import MyButton from "@/components/my-button";
import { MyDialog } from "@/components/my-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useFetch } from "@/app/actions";
import { ApiResponse } from "@/hooks/use-api-query";
import { parseApiError } from "@/lib/helper/helper";
import { Loader2, Printer } from "lucide-react";
import InvoiceReceipt from "@/components/invoices/invoice-receipt";
import { InvoiceDetail } from "./invoice-type";

/** GOOJPRT PT-210: 58mm roll, 48mm print head, 203 dpi, 384 dots. */
const PT210_PRINT_WIDTH_MM = 48;
const PT210_PAGE_DOTS = 384;
const RECEIPT_MAX_PAGE_HEIGHT_MM = 280;
const PAGE_CAPACITY_BUFFER_MM = 2;
const INK_THRESHOLD = 168;

const canvasHeightToMm = (canvas: HTMLCanvasElement, widthMm: number) =>
    (canvas.height * widthMm) / Math.max(canvas.width, 1);

const thermalFontFamily = () => {
    const hindFamily = getComputedStyle(document.documentElement)
        .getPropertyValue("--font-hind")
        .trim();
    return hindFamily.length > 0 ? `${hindFamily}, sans-serif` : "sans-serif";
};

const paintThermalSurface = (element: HTMLElement) => {
    element.style.boxSizing = "border-box";
    element.style.width = `${PT210_PAGE_DOTS}px`;
    element.style.margin = "0";
    element.style.padding = "16px 16px 24px";
    element.style.border = "0";
    element.style.background = "#ffffff";
    element.style.color = "#000000";
    element.style.fontFamily = thermalFontFamily();
    element.style.fontWeight = "700";
    element.style.fontSize = "28px";
    element.style.lineHeight = "36px";
    element.style.letterSpacing = "0px";
    element.style.setProperty("-webkit-font-smoothing", "auto");
    element.style.setProperty("-moz-osx-font-smoothing", "auto");
};

const forceThermalInk = (root: HTMLElement) => {
    const paint = (node: HTMLElement, keepWhiteBackground: boolean) => {
        node.style.color = "#000000";
        node.style.borderColor = "#000000";
        node.style.textShadow = "none";
        node.style.boxShadow = "none";
        node.style.opacity = "1";
        node.style.filter = "none";
        node.style.backgroundColor = keepWhiteBackground ? "#ffffff" : "transparent";
        node.style.fontFamily = thermalFontFamily();
        node.style.fontWeight = "700";
        node.style.setProperty("-webkit-font-smoothing", "auto");
    };

    paint(root, true);
    root.querySelectorAll<HTMLElement>("*").forEach((node) => paint(node, false));
};

const toCanvas = async (element: HTMLElement) =>
    html2canvas(element, {
        scale: 1,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
    });

const flattenToInk = (source: HTMLCanvasElement) => {
    const targetWidth = PT210_PAGE_DOTS;
    const targetHeight = Math.max(
        1,
        Math.round((source.height * targetWidth) / Math.max(source.width, 1)),
    );
    const target = document.createElement("canvas");
    target.width = targetWidth;
    target.height = targetHeight;
    const context = target.getContext("2d", { willReadFrequently: true });
    if (!context) return source;

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, targetWidth, targetHeight);
    context.drawImage(source, 0, 0, targetWidth, targetHeight);

    const image = context.getImageData(0, 0, targetWidth, targetHeight);
    const pixels = image.data;
    for (let index = 0; index < pixels.length; index += 4) {
        const luminance = pixels[index] * 0.299 + pixels[index + 1] * 0.587 + pixels[index + 2] * 0.114;
        const ink = luminance < INK_THRESHOLD ? 0 : 255;
        pixels[index] = ink;
        pixels[index + 1] = ink;
        pixels[index + 2] = ink;
        pixels[index + 3] = 255;
    }
    context.putImageData(image, 0, 0);
    return target;
};

const toThermalCanvas = async (element: HTMLElement) => {
    const source = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        onclone: (_clonedDocument, clonedElement) => {
            forceThermalInk(clonedElement);
        },
    });
    return flattenToInk(source);
};

/** jsPDF swaps a portrait page when the strip is shorter than it is wide. */
const thermalPageSize = (heightMm: number): { orientation: "p" | "l"; format: [number, number] } => {
    const orientation = heightMm >= PT210_PRINT_WIDTH_MM ? "p" : "l";
    return { orientation, format: [PT210_PRINT_WIDTH_MM, heightMm] };
};

const cloneForPdf = (element: HTMLElement) => {
    const clonedElement = element.cloneNode(true) as HTMLElement;
    clonedElement.style.width = "100%";
    clonedElement.style.maxWidth = "none";
    clonedElement.style.color = "#000000";
    clonedElement.style.background = "transparent";
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
            await document.fonts.ready;
            const pageContentWidthMm = PT210_PRINT_WIDTH_MM;
            const pageContentHeightMm = RECEIPT_MAX_PAGE_HEIGHT_MM;

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
            stagingContainer.style.width = `${PT210_PAGE_DOTS}px`;
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

            let pdf: jsPDF | null = null;

            for (let pageIndex = 0; pageIndex < paginatedRowIndexes.length; pageIndex++) {

                const pageRows = paginatedRowIndexes[pageIndex] ?? [];
                const includeSummary = pageIndex === paginatedRowIndexes.length - 1;

                const pageContainer = document.createElement("div");
                paintThermalSurface(pageContainer);
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
                const pageCanvas = await toThermalCanvas(pageContainer);
                stagingContainer.removeChild(pageContainer);

                const pageImageHeightMm = Math.max(
                    canvasHeightToMm(pageCanvas, PT210_PRINT_WIDTH_MM),
                    20,
                );
                const pageSize = thermalPageSize(pageImageHeightMm);
                if (!pdf) {
                    pdf = new jsPDF({
                        orientation: pageSize.orientation,
                        unit: "mm",
                        format: pageSize.format,
                        compress: true,
                    });
                    pdf.setProperties({ title: pdfName });
                } else {
                    pdf.addPage(pageSize.format, pageSize.orientation);
                }

                pdf.addImage(
                    pageCanvas.toDataURL("image/png"),
                    "PNG",
                    0,
                    0,
                    PT210_PRINT_WIDTH_MM,
                    pageImageHeightMm,
                    undefined,
                    "NONE",
                );
            }

            if (!pdf) return;

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
        <MyDialog
            open={open}
            onOpenChange={onOpenChange}
            title="invoice.print.title"
            size="md"
            footer={({ close }) => (
                <div className="flex justify-center w-full">
                    <div className="flex items-center gap-2">
                        <MyButton
                            action="cancel"
                            variant="outline"
                            size="default"
                            onClick={close}
                            title={t("common.cancel")}
                        />
                        <MyButton
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
                        </MyButton>
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
                    <p className="mt-3 text-center text-xs text-muted-foreground">
                        {t("invoice.print.paper_hint")}
                    </p>
                </div>
            )}
        </MyDialog>
    );
};

export default InvoicePrintDialog;
