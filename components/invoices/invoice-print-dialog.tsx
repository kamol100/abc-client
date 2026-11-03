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
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { parseApiError } from "@/lib/helper/helper";
import { Loader2, Printer } from "lucide-react";
import InvoiceReceipt from "@/components/invoices/invoice-receipt";
import {
    InvoicePrintSettingsSchema,
    receiptContentPaddingX,
    receiptLineHeight,
    type InvoicePrintSettings,
} from "@/components/invoices/invoice-print-config";
import { InvoiceDetail } from "@/components/invoices/invoice-type";
import { usePathname } from "next/navigation";

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

type ReceiptTypography = {
    fontSize: number;
    fontWeight: number;
};

const typographyFromReceipt = (element: HTMLElement): ReceiptTypography | null => {
    const fontSize = Number(element.dataset.receiptFontSize);
    const fontWeight = Number(element.dataset.receiptFontWeight);
    if (!Number.isFinite(fontSize) || fontSize <= 0) return null;

    return {
        fontSize,
        fontWeight: Number.isFinite(fontWeight) && fontWeight > 0 ? fontWeight : 700,
    };
};

const paddingXFromReceipt = (element: HTMLElement): number => {
    const raw = element.dataset.receiptPaddingX;
    if (raw === undefined || raw === "") return receiptContentPaddingX("standard");
    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed < 0) return receiptContentPaddingX("standard");
    return parsed;
};

const paintThermalSurface = (
    element: HTMLElement,
    typography: ReceiptTypography | null,
    paddingX: number,
) => {
    const fontSize = typography?.fontSize ?? 28;
    const fontWeight = typography?.fontWeight ?? 700;
    element.style.boxSizing = "border-box";
    element.style.width = `${PT210_PAGE_DOTS}px`;
    element.style.margin = "0";
    element.style.paddingTop = "16px";
    element.style.paddingRight = `${paddingX}px`;
    element.style.paddingBottom = "24px";
    element.style.paddingLeft = `${paddingX}px`;
    element.style.overflow = "visible";
    if (paddingX === 0) element.style.overflowWrap = "anywhere";
    element.style.border = "0";
    element.style.background = "#ffffff";
    element.style.color = "#000000";
    element.style.fontFamily = thermalFontFamily();
    element.style.fontWeight = String(fontWeight);
    element.style.fontSize = `${fontSize}px`;
    element.style.lineHeight = `${receiptLineHeight(fontSize)}px`;
    element.style.letterSpacing = "0px";
    element.style.setProperty("-webkit-font-smoothing", "auto");
    element.style.setProperty("-moz-osx-font-smoothing", "auto");
    element.dataset.thermalSurface = "true";
};

const forceThermalInk = (root: HTMLElement, typography: ReceiptTypography | null) => {
    const paint = (node: HTMLElement, keepWhiteBackground: boolean) => {
        node.style.color = "#000000";
        node.style.borderColor = "#000000";
        node.style.textShadow = "none";
        node.style.boxShadow = "none";
        node.style.opacity = "1";
        node.style.filter = "none";
        node.style.backgroundColor = keepWhiteBackground ? "#ffffff" : "transparent";
        node.style.fontFamily = thermalFontFamily();
        node.style.setProperty("-webkit-font-smoothing", "auto");
        const inlineSize = node.dataset.thermalSurface === "true"
            ? Number.NaN
            : Number.parseFloat(node.style.fontSize);
        if (Number.isFinite(inlineSize) && inlineSize > 0) {
            const inlineWeight = Number.parseFloat(node.style.fontWeight);
            node.style.fontSize = `${inlineSize}px`;
            node.style.lineHeight = `${Math.round(inlineSize * 1.2)}px`;
            if (Number.isFinite(inlineWeight) && inlineWeight > 0) {
                node.style.fontWeight = String(inlineWeight);
            }
            return;
        }
        node.style.fontWeight = String(typography?.fontWeight ?? 700);
        if (typography) {
            node.style.fontSize = `${typography.fontSize}px`;
            node.style.lineHeight = `${receiptLineHeight(typography.fontSize)}px`;
        }
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

/** A short basic slip is wider than it is tall. Landscape pages come out blank on the PT-210. */
const padThermalCanvasToPortrait = (source: HTMLCanvasElement) => {
    if (source.height >= source.width) return source;
    const target = document.createElement("canvas");
    target.width = source.width;
    target.height = source.width;
    const context = target.getContext("2d");
    if (!context) return source;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, target.width, target.height);
    context.drawImage(source, 0, 0);
    return target;
};

const toThermalCanvas = async (element: HTMLElement, typography: ReceiptTypography | null) => {
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
            forceThermalInk(clonedElement, typography);
        },
    });
    return flattenToInk(source);
};

/** jsPDF swaps a portrait page when the strip is shorter than it is wide. */
const thermalPageSize = (heightMm: number): { orientation: "p" | "l"; format: [number, number] } => {
    const orientation = heightMm >= PT210_PRINT_WIDTH_MM ? "p" : "l";
    return { orientation, format: [PT210_PRINT_WIDTH_MM, heightMm] };
};

const receiptPdfName = (invoices: InvoiceDetail[], stamped: string) => {
    const firstInvoice = invoices[0];
    const clientName = firstInvoice?.client?.name?.replace(/\s+/g, "-").toLowerCase() ?? "client";
    const invoiceLabel = invoices.length > 1
        ? "bulk-invoices"
        : (firstInvoice?.trackID ?? `invoice-${firstInvoice?.id ?? ""}`);
    return `${invoiceLabel}-${clientName}-${stamped}`;
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
    const pathname = usePathname();
    const settingsUrl = pathname === "/client" || pathname.startsWith("/client/")
        ? "client-invoice-print-settings"
        : "invoice-print-settings";
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

    const {
        data: printSettingsResponse,
        isLoading: isSettingsLoading,
        isError: isSettingsError,
        error: settingsError,
    } = useApiQuery<ApiResponse<InvoicePrintSettings>>({
        queryKey: ["invoice-print-settings", settingsUrl],
        url: settingsUrl,
        pagination: false,
        enabled: open,
        staleTime: 0,
    });

    const printSettings = useMemo(() => {
        const parsed = InvoicePrintSettingsSchema.safeParse(printSettingsResponse?.data);
        return parsed.success ? parsed.data : null;
    }, [printSettingsResponse]);

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
        const receiptRoot = receiptElement.querySelector<HTMLElement>("[data-receipt-root]") ?? receiptElement;
        const receiptHeader = receiptElement.querySelector<HTMLElement>("[data-receipt-header]");
        const receiptItemsHead = receiptElement.querySelector<HTMLElement>("[data-receipt-items-head]");
        const receiptItemsBody = receiptElement.querySelector<HTMLElement>("[data-receipt-items-body]");
        const receiptSummary = receiptElement.querySelector<HTMLElement>("[data-receipt-summary]");
        const receiptRows = Array.from(
            receiptElement.querySelectorAll<HTMLElement>("[data-receipt-item-row]"),
        );

        if (!receiptItemsBody || !receiptSummary) return;

        setIsGeneratingPdf(true);
        let stagingContainer: HTMLDivElement | null = null;
        try {
            await document.fonts.ready;
            const typography = typographyFromReceipt(receiptRoot);
            const paddingX = paddingXFromReceipt(receiptRoot);
            const pageContentWidthMm = PT210_PRINT_WIDTH_MM;
            const pageContentHeightMm = RECEIPT_MAX_PAGE_HEIGHT_MM;
            const pdfName = receiptPdfName(invoices, dateFormat());

            stagingContainer = document.createElement("div");
            stagingContainer.style.position = "fixed";
            stagingContainer.style.left = "-99999px";
            stagingContainer.style.top = "0";
            stagingContainer.style.width = `${PT210_PAGE_DOTS}px`;
            stagingContainer.style.pointerEvents = "none";
            stagingContainer.style.background = "#ffffff";
            document.body.appendChild(stagingContainer);

            const headerProbe = receiptHeader ? cloneForPdf(receiptHeader) : null;
            const itemsHeadProbe = receiptItemsHead ? cloneForPdf(receiptItemsHead) : null;
            const summaryProbe = cloneForPdf(receiptSummary);

            if (headerProbe) stagingContainer.appendChild(headerProbe);
            if (itemsHeadProbe) stagingContainer.appendChild(itemsHeadProbe);
            stagingContainer.appendChild(summaryProbe);

            const [headerCanvas, itemsHeadCanvas, summaryCanvas] = await Promise.all([
                headerProbe ? toCanvas(headerProbe) : Promise.resolve(null),
                itemsHeadProbe ? toCanvas(itemsHeadProbe) : Promise.resolve(null),
                toCanvas(summaryProbe),
            ]);

            const headerHeightMm = headerCanvas ? canvasHeightToMm(headerCanvas, pageContentWidthMm) : 0;
            const itemsHeadHeightMm = itemsHeadCanvas ? canvasHeightToMm(itemsHeadCanvas, pageContentWidthMm) : 0;
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
                paintThermalSurface(pageContainer, typography, paddingX);
                if (receiptHeader) pageContainer.appendChild(cloneForPdf(receiptHeader));
                if (receiptItemsHead) pageContainer.appendChild(cloneForPdf(receiptItemsHead));

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
                const capturedCanvas = await toThermalCanvas(pageContainer, typography);
                const pageCanvas = receiptRoot.dataset.receiptVariant === "basic"
                    ? padThermalCanvasToPortrait(capturedCanvas)
                    : capturedCanvas;
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
                            disabled={invoices.length === 0 || isGeneratingPdf || !printSettings}
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
            {((isDetailLoading && normalizedProvidedInvoices.length === 0) || isSettingsLoading) ? (
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
            ) : isSettingsError || !printSettings ? (
                <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                    {t(parseApiError(settingsError) || "settings.invoice_print.load_error")}
                </div>
            ) : invoices.length === 0 ? (
                <div className="rounded-md border border-muted p-3 text-sm text-muted-foreground">
                    {t("invoice.no_invoices")}
                </div>
            ) : (
                <div className="h-full overflow-y-auto pr-1">
                    <div ref={receiptRef} className="bg-white">
                        <InvoiceReceipt invoices={invoices} printSettings={printSettings} />
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
