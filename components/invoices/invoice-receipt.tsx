"use client";

import { FC, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSettings } from "@/context/app-provider";
import { formatMoney, toNumber } from "@/lib/helper/helper";
import { cn } from "@/lib/utils";
import { amountInWords } from "@/components/invoices/amount-in-words";
import {
    receiptContentPaddingX,
    receiptLineHeight,
    type InvoicePrintSettings,
} from "@/components/invoices/invoice-print-config";
import { InvoiceDetail } from "@/components/invoices/invoice-type";

type InvoiceReceiptProps = {
    invoices: InvoiceDetail[];
    className?: string;
    printSettings?: InvoicePrintSettings;
    printedAt?: Date;
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

const ReceiptPair = ({
    label,
    value,
    className,
}: {
    label: string;
    value: string;
    className: string;
}) => (
    <div className={cn("flex items-start justify-between gap-[12px] text-black", className)}>
        <span className="shrink-0">{label}:</span>
        <span className="min-w-0 break-words text-right tabular-nums">{value}</span>
    </div>
);

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

const InvoiceReceipt: FC<InvoiceReceiptProps> = ({
    invoices,
    className,
    printSettings,
    printedAt,
}) => {
    const { t } = useTranslation();
    const { settings } = useSettings();
    const printedDateTimeText = useMemo(
        () => (printedAt ?? new Date()).toLocaleString(),
        [printedAt],
    );
    const safeInvoices = useMemo(
        () => invoices.filter((invoice): invoice is InvoiceDetail => Boolean(invoice)),
        [invoices],
    );
    const configured = printSettings != null;

    const companyName = getSettingString(settings, [
        "company",
    ]) ?? t("invoice.receipt.default_company");
    const companyAddress = getSettingString(settings, [
        "company_address",
        "address",
    ]);
    const companyPhone = getSettingString(settings, ["company_phone", "phone"]);
    const companySupportPhone = getSettingString(settings, ["support_phone"]);

    const clientIds = useMemo(() => {
        const ids = safeInvoices
            .map((invoice) => invoice.client?.sid)
            .filter((sid): sid is number | string => sid !== null && sid !== undefined && String(sid).trim() !== "")
            .map((sid) => `#${sid}`);
        return Array.from(new Set(ids));
    }, [safeInvoices]);

    const clientNames = useMemo(() => {
        const names = safeInvoices
            .map((invoice) => invoice.client?.name?.trim())
            .filter((name): name is string => Boolean(name));
        return Array.from(new Set(names));
    }, [safeInvoices]);

    const clientPppoeUsernames = useMemo(() => {
        const usernames = safeInvoices
            .map((invoice) => invoice.client?.pppoe_username?.trim())
            .filter((username): username is string => Boolean(username));
        return Array.from(new Set(usernames));
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

    const showCompanyName = configured ? printSettings.show_company_name : true;
    const showCompanyAddress = (configured ? printSettings.show_company_address : true) && Boolean(companyAddress);
    const showCompanyPhone = (configured ? printSettings.show_company_phone : true) && Boolean(companyPhone);
    const showCompanyBlock = showCompanyName || showCompanyAddress || showCompanyPhone;
    const showClientId = (configured ? printSettings.show_client_id : true) && clientIds.length > 0;
    const showClientName = configured ? printSettings.show_client_name : true;
    const showPppoe = (configured ? printSettings.show_client_pppoe_id : true) && clientPppoeUsernames.length > 0;
    const showClientPhone = (configured ? printSettings.show_client_phone : true) && clientPhones.length > 0;
    const showDateTime = configured ? printSettings.show_date_time : true;
    const showClientBlock = showClientId || showClientName || showPppoe || showClientPhone || showDateTime;
    const showItemHeader = configured ? printSettings.show_item_amount_header : true;
    const showAmountInWords = configured ? printSettings.show_total_amount_in_words : false;
    const showThankYou = configured ? printSettings.show_thank_you : true;
    const showSupport = (configured ? printSettings.show_company_support_number : true) && Boolean(companySupportPhone);
    const showFooter = showAmountInWords || showThankYou || showSupport;

    const bodyText = configured
        ? "leading-[var(--receipt-line-height)]"
        : "text-[28px] font-bold leading-[36px]";
    const titleText = configured
        ? "leading-[var(--receipt-line-height)]"
        : "text-[36px] font-bold leading-[44px]";
    const itemText = configured
        ? "leading-[var(--receipt-line-height)]"
        : "text-[24px] font-bold leading-[30px]";
    const lineHeight = configured ? receiptLineHeight(printSettings.font_size) : undefined;
    const paddingX = configured ? receiptContentPaddingX(printSettings.content_spacing) : undefined;
    const itemLabelClass = paddingX === 0 ? "min-w-0 break-words" : "min-w-0 truncate";

    return (
        <div
            className={cn(
                "invoice-receipt-root mx-auto box-border w-[384px] max-w-full overflow-visible bg-white pb-[24px] pt-[16px] text-black",
                configured ? paddingX === 0 && "[overflow-wrap:anywhere]" : "px-[16px]",
                className,
            )}
            data-receipt-root
            data-receipt-variant={configured ? "custom" : "original"}
            data-receipt-font-size={configured ? printSettings.font_size : undefined}
            data-receipt-font-weight={configured ? printSettings.font_weight : undefined}
            data-receipt-padding-x={configured ? paddingX : undefined}
            style={configured ? {
                fontSize: `${printSettings.font_size}px`,
                fontWeight: printSettings.font_weight,
                lineHeight: `${lineHeight}px`,
                ["--receipt-line-height" as string]: `${lineHeight}px`,
                paddingLeft: `${paddingX}px`,
                paddingRight: `${paddingX}px`,
            } : undefined}
        >
            {(showCompanyBlock || showClientBlock) && (
                <div data-receipt-header>
                    {showCompanyBlock && (
                        <div className="border-b-[3px] border-solid border-black pb-[12px] text-center text-black">
                            {showCompanyName && (
                                <h3 className={cn("break-words", titleText)}>{companyName}</h3>
                            )}
                            {showCompanyAddress && (
                                <p className={cn("mt-[6px] break-words", bodyText)}>{companyAddress}</p>
                            )}
                            {showCompanyPhone && (
                                <p className={cn("mt-[4px] break-words", bodyText)}>
                                    {t("invoice.receipt.phone")}: {companyPhone}
                                </p>
                            )}
                        </div>
                    )}

                    {showClientBlock && (
                        <div className="space-y-[4px] border-b-[3px] border-solid border-black py-[12px]">
                            {showClientId && (
                                <ReceiptPair
                                    label={t("invoice.receipt.client_id")}
                                    value={clientIds.join(", ")}
                                    className={bodyText}
                                />
                            )}
                            {showClientName && (
                                <ReceiptPair
                                    label={t("invoice.receipt.client")}
                                    value={clientNames.length > 0 ? clientNames.join(", ") : "—"}
                                    className={bodyText}
                                />
                            )}
                            {showPppoe && (
                                <ReceiptPair
                                    label={t("invoice.receipt.pppoe_id")}
                                    value={clientPppoeUsernames.join(", ")}
                                    className={bodyText}
                                />
                            )}
                            {showClientPhone && (
                                <ReceiptPair
                                    label={t("common.phone")}
                                    value={clientPhones.join(", ")}
                                    className={bodyText}
                                />
                            )}
                            {showDateTime && (
                                <ReceiptPair
                                    label={t("invoice.receipt.date")}
                                    value={printedDateTimeText}
                                    className={bodyText}
                                />
                            )}
                        </div>
                    )}
                </div>
            )}

            {showItemHeader && (
                <div
                    className={cn(
                        "flex items-start justify-between gap-[12px] border-b-[3px] border-solid border-black py-[8px] text-black",
                        bodyText,
                    )}
                    data-receipt-items-head
                >
                    <span>{t("invoice.receipt.item")}</span>
                    <span>{t("invoice.receipt.amount")}</span>
                </div>
            )}
            <div data-receipt-items-body className="py-[8px]">
                {invoiceGroups.map((group, groupIndex) => (
                    <div key={group.key} className="invoice-group">
                        {groupIndex > 0 && (
                            <div
                                className="invoice-group-separator my-[8px] border-t-[3px] border-solid border-black"
                                data-receipt-item-row
                            />
                        )}
                        {group.lines.length > 0 ? (
                            group.lines.map((line, lineIndex) => (
                                <div
                                    key={line.key}
                                    className={cn(
                                        "flex items-baseline justify-between gap-[8px] break-inside-avoid py-[4px] text-black",
                                        itemText,
                                    )}
                                    data-receipt-item-row
                                >
                                    <span className={itemLabelClass}>
                                        {lineIndex === 0 ? `${group.invoiceLabel}: ` : ""}
                                        {line.description} {line.quantity}x{formatMoney(line.unitPrice)}
                                    </span>
                                    <span className="shrink-0 tabular-nums">{formatMoney(line.amount)}</span>
                                </div>
                            ))
                        ) : (
                            <div
                                className={cn(
                                    "flex items-baseline justify-between gap-[8px] break-inside-avoid py-[4px] text-black",
                                    itemText,
                                )}
                                data-receipt-item-row
                            >
                                <span className={itemLabelClass}>{group.invoiceLabel}: —</span>
                                <span className="shrink-0 tabular-nums">{formatMoney(0)}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div
                className="space-y-[4px] break-inside-avoid border-t-[3px] border-solid border-black pt-[12px]"
                data-receipt-summary
            >
                <ReceiptPair label={t("invoice.receipt.sub_total")} value={formatMoney(totals.subTotal)} className={bodyText} />
                <ReceiptPair label={t("invoice.receipt.discount")} value={formatMoney(totals.totalDiscount)} className={bodyText} />
                <ReceiptPair label={t("invoice.receipt.total")} value={formatMoney(totals.totalAmount)} className={titleText} />
                <ReceiptPair label={t("invoice.receipt.paid")} value={formatMoney(totals.amountPaid)} className={bodyText} />
                {totals.amountDue > 0 && (
                    <ReceiptPair label={t("invoice.receipt.due")} value={formatMoney(totals.amountDue)} className={titleText} />
                )}
                {showFooter && (
                    <div className={cn("mt-[12px] border-t-[3px] border-solid border-black pt-[12px] text-center text-black", bodyText)}>
                        {showAmountInWords && (
                            <p className="break-words">
                                {amountInWords(totals.totalAmount)} {t("invoice.receipt.only")}
                            </p>
                        )}
                        {showThankYou && (
                            <p className={cn(showAmountInWords && "mt-[12px]")}>{t("invoice.receipt.thank_you")}</p>
                        )}
                        {showSupport && (
                            <p className={cn("break-words", (showThankYou || showAmountInWords) && "mt-[6px]")}>
                                {t("common.help")}: {companySupportPhone}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InvoiceReceipt;
