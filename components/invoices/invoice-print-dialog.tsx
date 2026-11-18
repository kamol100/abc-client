"use client";

import { FC, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import MyButton from "@/components/my-button";
import { MyDialog } from "@/components/my-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useFetch } from "@/app/actions";
import { useSettings } from "@/context/app-provider";
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
import { InvoiceDetail, type InvoiceLine } from "@/components/invoices/invoice-type";
import { usePathname } from "next/navigation";

/** GOOJPRT PT-210: 58mm roll, 48mm print head, 203 dpi, 384 dots. */
const PT210_PRINT_WIDTH_MM = 48;
const PT210_PAGE_DOTS = 384;
const RECEIPT_MAX_PAGE_HEIGHT_MM = 280;
/** Print drivers auto-rotate pages that are not clearly taller than wide, which prints blank on the 58mm roll. */
const RECEIPT_MIN_PAGE_HEIGHT_MM = 60;
const RECEIPT_MIN_PAGE_DOTS = Math.ceil((RECEIPT_MIN_PAGE_HEIGHT_MM * PT210_PAGE_DOTS) / PT210_PRINT_WIDTH_MM);
const PAGE_CAPACITY_BUFFER_MM = 2;
const INK_THRESHOLD = 168;
/** Staging is already 384px wide — one CSS pixel per print-head dot — so a higher scale only adds delay. */
const THERMAL_CAPTURE_SCALE = 1;
const PREPARE_DELAY_MS = 250;
const RECEIPT_FONT_WAIT_MS = 400;

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

export const thermalPageHeightDots = (contentHeightDots: number) =>
    Math.max(Math.ceil(contentHeightDots), RECEIPT_MIN_PAGE_DOTS);

const padThermalCanvasToPortrait = (source: HTMLCanvasElement) => {
    const pageHeight = thermalPageHeightDots(source.height);
    if (pageHeight === source.height) return source;
    const target = document.createElement("canvas");
    target.width = source.width;
    target.height = pageHeight;
    const context = target.getContext("2d");
    if (!context) return source;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, target.width, target.height);
    context.drawImage(source, 0, 0);
    return target;
};

const toThermalCanvas = async (element: HTMLElement, typography: ReceiptTypography | null) => {
    const source = await html2canvas(element, {
        scale: THERMAL_CAPTURE_SCALE,
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

export const createThermalPdf = (pageFormat: [number, number], title: string) => {
    const pdf = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: pageFormat,
        compress: true,
    });
    pdf.setProperties({ title });
    // Without this the viewer fits the 48mm page to whatever paper the printer driver reports,
    // so the strip prints too big or too small. "None" makes actual size the default.
    pdf.viewerPreferences({ PrintScaling: "None" });
    return pdf;
};

const receiptDateStamp = () => {
    const date = new Date();
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear().toString().slice(-2);
    return `${day}-${month}-${year}`;
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

const nextPaint = () =>
    new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => resolve());
        });
    });

const yieldToMain = () =>
    new Promise<void>((resolve) => {
        window.setTimeout(resolve, 0);
    });

const waitForReceiptFonts = () => {
    if (!document.fonts || document.fonts.status === "loaded") return Promise.resolve();
    return Promise.race([
        document.fonts.ready.then(() => undefined),
        new Promise<void>((resolve) => {
            window.setTimeout(resolve, RECEIPT_FONT_WAIT_MS);
        }),
    ]);
};

const pxToMm = (px: number, widthPx: number) =>
    (px * PT210_PRINT_WIDTH_MM) / Math.max(widthPx, 1);

const companySettingKey = (settings: Record<string, unknown>) =>
    ["company", "company_address", "address", "company_phone", "phone", "support_phone"]
        .map((key) => {
            const value = settings[key];
            return typeof value === "string" ? value.trim() : "";
        })
        .join("|");

const invoicePrintKey = (
    invoiceList: InvoiceDetail[],
    printSettings: InvoicePrintSettings | null,
    language: string,
    settings: Record<string, unknown>,
) => {
    if (!printSettings || invoiceList.length === 0) return "";
    return JSON.stringify({
        language,
        company: companySettingKey(settings),
        printSettings,
        invoices: invoiceList.map((invoice) => ({
            id: invoice.uuid ?? invoice.id ?? null,
            trackID: invoice.trackID ?? null,
            total_amount: invoice.total_amount ?? null,
            total_discount: invoice.total_discount ?? null,
            discount: invoice.discount ?? null,
            line_total_discount: invoice.line_total_discount ?? null,
            after_discount_amount: invoice.after_discount_amount ?? null,
            amount_paid: invoice.amount_paid ?? null,
            amount_due: invoice.amount_due ?? null,
            client: invoice.client
                ? {
                    sid: invoice.client.sid ?? null,
                    name: invoice.client.name ?? null,
                    phone: invoice.client.phone ?? null,
                    pppoe_username: invoice.client.pppoe_username ?? null,
                }
                : null,
            lines: (invoice.lines ?? []).map((line: InvoiceLine) => ({
                uuid: line.uuid ?? null,
                description: line.description,
                quantity: line.quantity,
                amount: line.amount,
                total_amount: line.total_amount,
                discount: line.discount,
            })),
        })),
    });
};

export const paginateReceiptRows = (
    rowHeightsMm: number[],
    maxRowsPerPageMm: number,
    maxRowsWithSummaryMm: number,
): number[][] => {
    if (maxRowsWithSummaryMm <= 0) {
        throw new Error("Invoice summary is taller than printable page height.");
    }

    const pages: number[][] = [];
    let currentPageRows: number[] = [];
    let currentRowsHeightMm = 0;

    rowHeightsMm.forEach((rowHeightMm, index) => {
        const safeRowHeightMm = Math.max(rowHeightMm, 0.5);
        if (currentPageRows.length > 0 && currentRowsHeightMm + safeRowHeightMm > maxRowsPerPageMm) {
            pages.push(currentPageRows);
            currentPageRows = [index];
            currentRowsHeightMm = safeRowHeightMm;
            return;
        }
        currentPageRows.push(index);
        currentRowsHeightMm += safeRowHeightMm;
    });

    if (currentPageRows.length > 0 || pages.length === 0) {
        pages.push(currentPageRows);
    }

    const lastPageRows = pages[pages.length - 1] ?? [];
    const lastPageRowsHeightMm = lastPageRows.reduce(
        (total, rowIndex) => total + (rowHeightsMm[rowIndex] ?? 0),
        0,
    );
    if (lastPageRowsHeightMm > maxRowsWithSummaryMm) {
        pages.push([]);
    }

    return pages;
};

const createReceiptPdf = async (
    receiptElement: HTMLElement,
    title: string,
    isCancelled: () => boolean,
): Promise<jsPDF | null> => {
    const receiptRoot = receiptElement.querySelector<HTMLElement>("[data-receipt-root]") ?? receiptElement;
    const receiptHeader = receiptElement.querySelector<HTMLElement>("[data-receipt-header]");
    const receiptItemsHead = receiptElement.querySelector<HTMLElement>("[data-receipt-items-head]");
    const receiptItemsBody = receiptElement.querySelector<HTMLElement>("[data-receipt-items-body]");
    const receiptSummary = receiptElement.querySelector<HTMLElement>("[data-receipt-summary]");
    const receiptRows = Array.from(receiptElement.querySelectorAll<HTMLElement>("[data-receipt-item-row]"));

    if (!receiptItemsBody || !receiptSummary || isCancelled()) return null;

    await waitForReceiptFonts();
    await yieldToMain();
    if (isCancelled()) return null;

    const typography = typographyFromReceipt(receiptRoot);
    const paddingX = paddingXFromReceipt(receiptRoot);
    const stagingContainer = document.createElement("div");
    stagingContainer.style.position = "fixed";
    stagingContainer.style.left = "-99999px";
    stagingContainer.style.top = "0";
    stagingContainer.style.width = `${PT210_PAGE_DOTS}px`;
    stagingContainer.style.pointerEvents = "none";
    stagingContainer.style.background = "#ffffff";
    document.body.appendChild(stagingContainer);

    try {
        const buildPage = (rowIndexes: number[], includeSummary: boolean) => {
            const pageContainer = document.createElement("div");
            paintThermalSurface(pageContainer, typography, paddingX);
            if (receiptHeader) pageContainer.appendChild(cloneForPdf(receiptHeader));
            if (receiptItemsHead) pageContainer.appendChild(cloneForPdf(receiptItemsHead));

            const pageRowsContainer = cloneForPdf(receiptItemsBody);
            pageRowsContainer.innerHTML = "";
            rowIndexes.forEach((rowIndex) => {
                const sourceRow = receiptRows[rowIndex];
                if (sourceRow) pageRowsContainer.appendChild(cloneForPdf(sourceRow));
            });
            pageContainer.appendChild(pageRowsContainer);
            if (includeSummary) pageContainer.appendChild(cloneForPdf(receiptSummary));
            forceThermalInk(pageContainer, typography);
            return pageContainer;
        };

        const fullPage = buildPage(receiptRows.map((_, index) => index), true);
        stagingContainer.appendChild(fullPage);
        const widthPx = fullPage.getBoundingClientRect().width;
        const contentHeightMm = widthPx > 0 ? pxToMm(fullPage.scrollHeight, widthPx) : 0;
        const pages: HTMLElement[] = [];

        if (widthPx <= 0 || contentHeightMm <= RECEIPT_MAX_PAGE_HEIGHT_MM) {
            pages.push(fullPage);
        } else {
            const headerHeightMm = pxToMm(
                fullPage.querySelector<HTMLElement>("[data-receipt-header]")?.getBoundingClientRect().height ?? 0,
                widthPx,
            );
            const itemsHeadHeightMm = pxToMm(
                fullPage.querySelector<HTMLElement>("[data-receipt-items-head]")?.getBoundingClientRect().height ?? 0,
                widthPx,
            );
            const summaryHeightMm = pxToMm(
                fullPage.querySelector<HTMLElement>("[data-receipt-summary]")?.getBoundingClientRect().height ?? 0,
                widthPx,
            );
            const rowHeightsMm = Array.from(
                fullPage.querySelectorAll<HTMLElement>("[data-receipt-item-row]"),
            ).map((row) => pxToMm(row.getBoundingClientRect().height, widthPx));

            fullPage.remove();
            const maxRowsPerPageMm = Math.max(
                RECEIPT_MAX_PAGE_HEIGHT_MM - headerHeightMm - itemsHeadHeightMm - PAGE_CAPACITY_BUFFER_MM,
                10,
            );
            paginateReceiptRows(
                rowHeightsMm,
                maxRowsPerPageMm,
                maxRowsPerPageMm - summaryHeightMm,
            ).forEach((rowIndexes, pageIndex, pageIndexes) => {
                pages.push(buildPage(rowIndexes, pageIndex === pageIndexes.length - 1));
            });
        }

        let pdf: jsPDF | null = null;
        for (let pageIndex = 0; pageIndex < pages.length; pageIndex += 1) {
            if (isCancelled()) return null;
            if (pageIndex > 0) await yieldToMain();
            const pageContainer = pages[pageIndex];
            if (!pageContainer) continue;
            if (!pageContainer.isConnected) stagingContainer.appendChild(pageContainer);

            const pageCanvas = padThermalCanvasToPortrait(await toThermalCanvas(pageContainer, typography));
            pageContainer.remove();
            if (isCancelled()) return null;

            const pageImageHeightMm = canvasHeightToMm(pageCanvas, PT210_PRINT_WIDTH_MM);
            const pageFormat: [number, number] = [PT210_PRINT_WIDTH_MM, pageImageHeightMm];
            if (!pdf) {
                pdf = createThermalPdf(pageFormat, title);
            } else {
                pdf.addPage(pageFormat, "p");
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

        return isCancelled() ? null : pdf;
    } finally {
        stagingContainer.remove();
    }
};

type PreparedPdf = {
    key: string;
    title: string;
    settled: boolean;
    cancelled: boolean;
    promise: Promise<jsPDF | null>;
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
    const { t, i18n } = useTranslation();
    const { settings } = useSettings();
    const pathname = usePathname();
    const settingsUrl = pathname === "/client" || pathname.startsWith("/client/")
        ? "client-invoice-print-settings"
        : "invoice-print-settings";
    const receiptRef = useRef<HTMLDivElement | null>(null);
    const preparedPdfRef = useRef<PreparedPdf | null>(null);
    const savingRef = useRef(false);
    const savedRef = useRef(false);
    const openRef = useRef(open);
    const startPrepareRef = useRef<() => PreparedPdf | null>(() => null);
    openRef.current = open;
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

    const prepareKey = useMemo(
        () => invoicePrintKey(invoices, printSettings, i18n.language, settings),
        [i18n.language, invoices, printSettings, settings],
    );

    const startPrepare = (): PreparedPdf | null => {
        const receiptElement = receiptRef.current;
        if (!openRef.current || !receiptElement || prepareKey === "") return null;

        const existing = preparedPdfRef.current;
        if (existing && existing.key === prepareKey && !existing.cancelled) return existing;

        const task: PreparedPdf = {
            key: prepareKey,
            title: receiptPdfName(invoices, receiptDateStamp()),
            settled: false,
            cancelled: false,
            promise: Promise.resolve(null),
        };
        task.promise = createReceiptPdf(receiptElement, task.title, () => task.cancelled).then(
            (pdf) => {
                task.settled = true;
                if (!pdf || task.cancelled) {
                    if (preparedPdfRef.current === task) preparedPdfRef.current = null;
                    return null;
                }
                return pdf;
            },
            (error: unknown) => {
                console.error(error);
                task.settled = true;
                if (preparedPdfRef.current === task) preparedPdfRef.current = null;
                return null;
            },
        );
        preparedPdfRef.current = task;
        return task;
    };
    startPrepareRef.current = startPrepare;

    useEffect(() => {
        if (!open || prepareKey === "") {
            const current = preparedPdfRef.current;
            if (current && !savedRef.current) {
                current.cancelled = true;
                preparedPdfRef.current = null;
            }
            if (!open) {
                savingRef.current = false;
                savedRef.current = false;
                setIsGeneratingPdf(false);
            }
            return;
        }

        let effectCancelled = false;
        const timeoutId = window.setTimeout(() => {
            const start = () => {
                if (effectCancelled || !receiptRef.current) return;
                startPrepareRef.current();
            };
            if (receiptRef.current) start();
            else requestAnimationFrame(start);
        }, PREPARE_DELAY_MS);

        return () => {
            effectCancelled = true;
            window.clearTimeout(timeoutId);
            if (savedRef.current) return;
            const current = preparedPdfRef.current;
            if (current?.key === prepareKey) {
                current.cancelled = true;
                preparedPdfRef.current = null;
            }
        };
    }, [open, prepareKey]);

    const handlePrint = async () => {
        if (savingRef.current || invoices.length === 0 || !receiptRef.current || prepareKey === "") return;

        savingRef.current = true;
        const existing = preparedPdfRef.current;
        const ready = existing && existing.key === prepareKey && existing.settled && !existing.cancelled
            ? existing
            : null;

        if (!ready) {
            setIsGeneratingPdf(true);
            await nextPaint();
        }

        let saved = false;
        try {
            const task = ready ?? startPrepare();
            const pdf = await task?.promise;
            if (!task || !pdf || task.cancelled || !openRef.current) return;
            pdf.save(`${task.title}.pdf`);
            saved = true;
            savedRef.current = true;
            onOpenChange(false);
        } catch (error) {
            console.error(error);
        } finally {
            if (!saved) {
                savingRef.current = false;
                setIsGeneratingPdf(false);
            }
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
                            onClick={handlePrint}
                            disabled={invoices.length === 0 || isGeneratingPdf || !printSettings}
                            aria-busy={isGeneratingPdf}
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
