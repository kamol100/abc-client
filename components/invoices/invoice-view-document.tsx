"use client";

import { forwardRef, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
    formatInvoiceAmount,
    type InvoiceViewModel,
} from "@/components/invoices/invoice-view-model";

type SummaryRow = {
    key: string;
    label: string;
    value: string;
    emphasize?: boolean;
};

const statusLabelKey = (status: string | null): string | null => {
    if (status === "paid") return "invoice.status.paid";
    if (status === "due") return "invoice.status.due";
    if (status === "partial" || status === "partial_paid") return "invoice.status.partial_paid";
    return null;
};

export const InvoiceViewDocument = forwardRef<HTMLDivElement, { model: InvoiceViewModel }>(
    function InvoiceViewDocument({ model }, ref) {
        const { t } = useTranslation();
        const [logoFailed, setLogoFailed] = useState(false);
        const showLogo = Boolean(model.merchantLogoUrl) && !logoFailed;

        useEffect(() => {
            setLogoFailed(false);
        }, [model.merchantLogoUrl]);

        const statusKey = statusLabelKey(model.status);
        const statusLabel = statusKey ? t(statusKey) : model.status;

        const meta = [
            { key: "number", label: t("invoice.invoice_id"), value: model.invoiceNumber },
            model.invoiceDate
                ? { key: "date", label: t("invoice.view.invoice_date"), value: model.invoiceDate }
                : null,
            model.dueDate
                ? { key: "due", label: t("invoice.due_date.label"), value: model.dueDate }
                : null,
            model.invoiceType
                ? { key: "type", label: t("invoice.type.label"), value: model.invoiceType }
                : null,
            { key: "bill", label: t("invoice.view.total_bill"), value: formatInvoiceAmount(model.total) },
        ].filter((item): item is { key: string; label: string; value: string } => Boolean(item));

        const summary: SummaryRow[] = [
            { key: "subtotal", label: t("invoice.reports.sub_total"), value: formatInvoiceAmount(model.subTotal) },
            ...(model.lineDiscount > 0
                ? [{ key: "line-discount", label: t("invoice.line.discount.label"), value: formatInvoiceAmount(model.lineDiscount) }]
                : []),
            ...(model.discount > 0
                ? [{ key: "discount", label: t("invoice.discount.label"), value: formatInvoiceAmount(model.discount) }]
                : []),
            ...(model.partialAmount > 0
                ? [{ key: "partial", label: t("invoice.partial_amount.label"), value: formatInvoiceAmount(model.partialAmount) }]
                : []),
            ...(model.amountPaid > 0
                ? [{ key: "paid", label: t("invoice.reports.paid"), value: formatInvoiceAmount(model.amountPaid) }]
                : []),
            ...(model.amountDue > 0
                ? [{ key: "due", label: t("invoice.receipt.due"), value: formatInvoiceAmount(model.amountDue) }]
                : []),
            ...(model.paymentMethod
                ? [{ key: "method", label: t("invoice.fund.label"), value: model.paymentMethod }]
                : []),
            ...(model.paymentDate
                ? [{ key: "paid-on", label: t("invoice.payment_date.label"), value: model.paymentDate }]
                : []),
            ...(model.transactionId
                ? [{ key: "txn", label: t("invoice.pay.transaction_id.label"), value: model.transactionId }]
                : []),
            ...(model.reference
                ? [{ key: "reference", label: t("invoice.pay.reference.label"), value: model.reference }]
                : []),
            {
                key: "total",
                label: t("invoice.reports.total"),
                value: formatInvoiceAmount(model.total),
                emphasize: true,
            },
        ];

        return (
            <div
                ref={ref}
                className="invoice-view-sheet bg-white px-4 py-5 text-sm text-neutral-900 sm:px-6"
            >
                <div className="invoice-view-header flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        {showLogo ? (
                            <img
                                src={model.merchantLogoUrl ?? ""}
                                alt={model.merchantName ?? ""}
                                onError={() => setLogoFailed(true)}
                                className="h-14 w-auto max-w-[180px] object-contain object-left"
                            />
                        ) : (
                            model.merchantName && (
                                <p className="text-lg font-bold leading-tight">{model.merchantName}</p>
                            )
                        )}
                    </div>
                    <div className="sm:text-right">
                        <h2 className="text-2xl font-bold tracking-wide">{t("invoice.view.heading")}</h2>
                        {statusLabel && (
                            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-neutral-700">
                                {statusLabel}
                            </p>
                        )}
                    </div>
                </div>

                <div className="invoice-view-meta mt-4 flex flex-col gap-2 bg-neutral-100 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                    {meta.map((item) => (
                        <p key={item.key} className="min-w-0">
                            <span className="font-medium">{item.label}:</span>{" "}
                            <span className="break-words">{item.value}</span>
                        </p>
                    ))}
                </div>

                <div className="invoice-view-parties mt-2 grid grid-cols-1 gap-4 bg-neutral-100 px-4 py-3 sm:grid-cols-2">
                    <div className="min-w-0">
                        <p className="font-semibold">{t("invoice.view.merchant")}:</p>
                        <div className="mt-1 space-y-0.5 break-words leading-5">
                            {model.merchantName && <p>{model.merchantName}</p>}
                            {model.merchantAddress && (
                                <p className="whitespace-pre-wrap">{model.merchantAddress}</p>
                            )}
                            {model.merchantPhone && <p>{model.merchantPhone}</p>}
                        </div>
                    </div>
                    <div className="min-w-0">
                        <p className="font-semibold">{t("invoice.view.customer")}:</p>
                        <div className="mt-1 space-y-0.5 break-words leading-5">
                            <p>{model.customerName ?? "—"}</p>
                            {model.customerCode && (
                                <p>
                                    {t("invoice.receipt.client_id")}: {model.customerCode}
                                </p>
                            )}
                            {model.customerAddress && (
                                <p className="whitespace-pre-wrap">{model.customerAddress}</p>
                            )}
                            {model.customerZone && <p>{model.customerZone}</p>}
                            {model.customerPhone && <p>{model.customerPhone}</p>}
                        </div>
                    </div>
                </div>

                <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-[520px] border-collapse text-sm print:min-w-0">
                        <thead>
                            <tr className="bg-black text-left text-white">
                                <th className="px-3 py-2 font-semibold">{t("invoice.view.product")}</th>
                                <th className="w-16 px-3 py-2 text-center font-semibold">{t("invoice.receipt.qty")}</th>
                                <th className="w-28 px-3 py-2 text-right font-semibold">{t("invoice.view.unit_price")}</th>
                                <th className="w-28 px-3 py-2 text-right font-semibold">{t("invoice.receipt.total")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {model.lines.length > 0 ? (
                                model.lines.map((line) => (
                                    <tr key={line.key} className="invoice-view-avoid-break border-b border-neutral-200 align-top">
                                        <td className="px-3 py-3">
                                            <p className="whitespace-pre-wrap break-words font-medium">{line.description}</p>
                                            {line.discount > 0 && (
                                                <p className="mt-1 text-xs text-neutral-600">
                                                    {t("invoice.line.discount.label")}: {formatInvoiceAmount(line.discount)}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-3 py-3 text-center">{line.quantity}</td>
                                        <td className="px-3 py-3 text-right">{formatInvoiceAmount(line.unitPrice)}</td>
                                        <td className="px-3 py-3 text-right">{formatInvoiceAmount(line.amount)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr className="border-b border-neutral-200">
                                    <td colSpan={4} className="px-3 py-4 text-neutral-500">—</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <p className="border-b border-neutral-200 px-3 py-3 font-semibold">
                    {t("invoice.view.total_quantity")}: {model.totalQuantity}
                </p>

                <div className="invoice-view-bottom mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                        {model.note && (
                            <div className="invoice-view-note px-3">
                                <p className="font-semibold">{t("invoice.note.label")}:</p>
                                <p data-invoice-note className="mt-1 whitespace-pre-wrap break-words leading-5">
                                    {model.note}
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="invoice-view-totals invoice-view-avoid-break w-full sm:w-72">
                        {summary.map((row) => (
                            <div
                                key={row.key}
                                className={cn(
                                    "flex items-start justify-between gap-4 px-3 py-2",
                                    row.emphasize
                                        ? "border-y-2 border-neutral-900 font-bold"
                                        : "border-b border-neutral-300",
                                )}
                            >
                                <span className={row.emphasize ? undefined : "font-semibold"}>{row.label}</span>
                                <span className="text-right">{row.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    },
);

InvoiceViewDocument.displayName = "InvoiceViewDocument";

