"use client";

import { FC, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSettings } from "@/context/app-provider";
import { formatMoney, toNumber } from "@/lib/helper/helper";
import { cn } from "@/lib/utils";
import { InvoiceDetail } from "./invoice-type";

type InvoiceReceiptProps = {
    invoices: InvoiceDetail[];
    className?: string;
};

const getSettingString = (
    source: Record<string, unknown>,
    keys: string[],
): string | null => {
    for (const key of keys) {
        const value = source[key];
        if (typeof value === "string" && value.trim().length > 0) {
            return value.trim();
        }
    }
    return null;
};

const getInvoiceTotals = (invoice: InvoiceDetail) => {
    const subTotal = toNumber(invoice.total_amount);
    const totalDiscount =
        toNumber(invoice.total_discount) ||
        toNumber(invoice.discount) + toNumber(invoice.line_total_discount);
    const totalAmount =
        toNumber(invoice.after_discount_amount) || Math.max(subTotal - totalDiscount, 0);
    const amountPaid = toNumber(invoice.amount_paid);
    const amountDue =
        toNumber(invoice.amount_due) || Math.max(toNumber(totalAmount) - amountPaid, 0);

    return {
        subTotal,
        totalDiscount,
        totalAmount,
        amountPaid,
        amountDue,
    };
};

const InvoiceReceipt: FC<InvoiceReceiptProps> = ({ invoices, className }) => {
    const { t } = useTranslation();
    const { settings } = useSettings();
    const printedDateTimeText = useMemo(() => new Date().toLocaleString(), []);
    const safeInvoices = useMemo(
        () => invoices.filter((invoice): invoice is InvoiceDetail => Boolean(invoice)),
        [invoices],
    );

    const companyName = getSettingString(settings, [
        "company",
    ]) ?? t("invoice.receipt.default_company");
    const companyAddress = getSettingString(settings, [
        "company_address",
        "address",
    ]);
    const companyPhone = getSettingString(settings, ["company_phone", "phone"]);

    const clientNames = useMemo(() => {
        const names = safeInvoices
            .map((invoice) => invoice.client?.name?.trim())
            .filter((name): name is string => Boolean(name));
        return Array.from(new Set(names));
    }, [safeInvoices]);

    const clientPhones = useMemo(() => {
        const phones = safeInvoices
            .map((invoice) => invoice.client?.phone?.trim())
            .filter((phone): phone is string => Boolean(phone));
        return Array.from(new Set(phones));
    }, [safeInvoices]);

    const invoiceGroups = useMemo(
        () =>
            safeInvoices.map((invoice, invoiceIndex) => {
                const invoiceLabel =
                    invoice.trackID || (invoice.id ? `#${invoice.id}` : `#${invoiceIndex + 1}`);
                const lines = (invoice.lines ?? []).map((line, lineIndex) => {
                    const quantity = Math.max(1, toNumber(line.quantity || 1));
                    const unitPrice = toNumber(line.amount);
                    const amount =
                        toNumber(line.total_amount) ||
                        Math.max(unitPrice * quantity - toNumber(line.discount), 0);

                    return {
                        key: `${line.uuid ?? `${invoiceLabel}-${line.description}`}-${lineIndex}`,
                        description: line.description || "—",
                        quantity,
                        unitPrice,
                        amount,
                    };
                });

                return {
                    key: `${invoice.uuid ?? invoice.id ?? invoiceLabel}-${invoiceIndex}`,
                    invoiceLabel,
                    lines,
                };
            }),
        [safeInvoices],
    );

    const totals = useMemo(
        () =>
            safeInvoices.reduce(
                (acc, invoice) => {
                    const currentTotals = getInvoiceTotals(invoice);
                    return {
                        subTotal: acc.subTotal + currentTotals.subTotal,
                        totalDiscount: acc.totalDiscount + currentTotals.totalDiscount,
                        totalAmount: acc.totalAmount + currentTotals.totalAmount,
                        amountPaid: acc.amountPaid + currentTotals.amountPaid,
                        amountDue: acc.amountDue + currentTotals.amountDue,
                    };
                },
                {
                    subTotal: 0,
                    totalDiscount: 0,
                    totalAmount: 0,
                    amountPaid: 0,
                    amountDue: 0,
                },
            ),
        [safeInvoices],
    );

    return (
        <div
            className={cn(
                "invoice-receipt-root mx-auto w-full max-w-[80mm] overflow-visible bg-background text-xs leading-tight",
                className,
            )}
            data-receipt-root
        >
            <div data-receipt-header className="p-2">
                <div className="text-center space-y-0.5 border-b pb-2">
                    <h3 className="text-sm font-bold">{companyName}</h3>
                    {companyAddress && (
                        <p className="text-muted-foreground text-xs">{companyAddress}</p>
                    )}
                    {companyPhone && (
                        <p className="text-muted-foreground">
                            {t("invoice.receipt.phone")}: {companyPhone}
                        </p>
                    )}
                </div>

                <div className="border-b pt-2 pb-3">
                    <div className="flex justify-between gap-2">
                        <span className="font-medium text-xs ">{t("invoice.receipt.client")}:</span>
                        <span className="text-right font-medium text-xs">
                            {clientNames.length > 0 ? clientNames.join(", ") : "—"}
                        </span>
                    </div>
                    {clientPhones.length > 0 && (
                        <div className="flex justify-between gap-2">
                            <span className="font-medium text-xs">{t("common.phone")}:</span>
                            <span className="text-right font-medium text-xs">{clientPhones.join(", ")}</span>
                        </div>
                    )}
                    <div className="flex justify-between gap-2">
                        <span className="font-medium text-xs">{t("invoice.receipt.date")}:</span>
                        <span className="text-right font-medium text-xs">{printedDateTimeText}</span>
                    </div>
                </div>
            </div>

            <div>
                <div
                    className="grid grid-cols-12 gap-1 border-b p-2 pt-0 font-semibold text-[11px]"
                    data-receipt-items-head
                >
                    <div className="col-span-2">{t("invoice.receipt.invoice_id")}</div>
                    <div className="col-span-4">{t("invoice.receipt.item")}</div>
                    <div className="col-span-1 text-center">
                        {t("invoice.receipt.qty")}
                    </div>
                    <div className="col-span-2 text-right">
                        {t("invoice.receipt.price")}
                    </div>
                    <div className="col-span-3 text-right">
                        {t("invoice.receipt.amount")}
                    </div>
                </div>
                <div
                    className="px-2"
                    data-receipt-items-body
                >
                    {invoiceGroups.map((group, groupIndex) => (
                        <div key={group.key} className="invoice-group">
                            {groupIndex > 0 && (
                                <div
                                    className="invoice-group-separator my-1 border-t border-dashed"
                                    data-receipt-item-row
                                />
                            )}
                            {group.lines.length > 0 ? (
                                group.lines.map((line, lineIndex) => (
                                    <div
                                        key={line.key}
                                        className="grid grid-cols-12 gap-1 text-[11px] items-start break-inside-avoid"
                                        data-receipt-item-row
                                    >
                                        <div className="col-span-2 break-words">
                                            {lineIndex === 0 ? group.invoiceLabel : ""}
                                        </div>
                                        <div className="col-span-4 whitespace-pre-wrap break-words">
                                            {line.description}
                                        </div>
                                        <div className="col-span-1 text-center">
                                            {line.quantity}
                                        </div>
                                        <div className="col-span-2 text-right">
                                            {formatMoney(line.unitPrice)}
                                        </div>
                                        <div className="col-span-3 text-right font-medium">
                                            {formatMoney(line.amount)}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div
                                    className="grid grid-cols-12 gap-1 text-[11px] text-muted-foreground items-start break-inside-avoid"
                                    data-receipt-item-row
                                >
                                    <div className="col-span-2 break-words">{group.invoiceLabel}</div>
                                    <div className="col-span-4">—</div>
                                    <div className="col-span-1 text-center">0</div>
                                    <div className="col-span-2 text-right">{formatMoney(0)}</div>
                                    <div className="col-span-3 text-right font-medium">{formatMoney(0)}</div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div
                className="border-t px-2 font-medium text-xs  mt-2 space-y-1 break-inside-avoid"
                data-receipt-summary
            >
                <div className="flex justify-between">
                    <span>{t("invoice.receipt.sub_total")}:</span>
                    <span>{formatMoney(totals.subTotal)}</span>
                </div>
                <div className="flex justify-between">
                    <span>{t("invoice.receipt.discount")}:</span>
                    <span>{formatMoney(totals.totalDiscount)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                    <span>{t("invoice.receipt.total")}:</span>
                    <span>{formatMoney(totals.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                    <span>{t("invoice.receipt.paid")}:</span>
                    <span>{formatMoney(totals.amountPaid)}</span>
                </div>
                {totals.amountDue > 0 && (
                    <div className="flex justify-between font-semibold text-destructive">
                        <span>{t("invoice.receipt.due")}:</span>
                        <span>{formatMoney(totals.amountDue)}</span>
                    </div>
                )}
                <div className="pt-2 pb-1 text-center font-semibold">
                    {t("invoice.receipt.thank_you")}
                </div>
            </div>
        </div>
    );
};

export default InvoiceReceipt;
