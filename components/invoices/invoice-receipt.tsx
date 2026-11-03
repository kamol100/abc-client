"use client";

import { CSSProperties, FC, useMemo } from "react";
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

const BASIC_FONT_RATIO = {
    address: 0.6,
    meta: 0.6,
    client: 0.8,
    contact: 0.64,
    label: 0.76,
    amount: 0.8,
    words: 0.68,
    thanks: 0.72,
    help: 0.6,
} as const;

const basicFontSize = (base: number, ratio: number) => Math.max(8, Math.round(base * ratio));

const basicTextStyle = (
    base: number,
    weight: number,
    ratio: number,
    regular = false,
): CSSProperties => {
    const size = ratio === 1 ? base : basicFontSize(base, ratio);
    return {
        fontSize: `${size}px`,
        lineHeight: `${Math.round(size * 1.2)}px`,
        fontWeight: regular ? 400 : weight,
    };
};

const formatBasicPrintedAt = (date: Date): string => {
    const month = date.toLocaleString("en-US", { month: "long" });
    const hours24 = date.getHours();
    const hours = hours24 % 12 || 12;
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const suffix = hours24 >= 12 ? "pm" : "am";
    return `${month}-${date.getDate()}, ${date.getFullYear()} ${hours}:${minutes}${suffix}`;
};

const clientContactLine = (invoice: InvoiceDetail): string => {
    const sidValue = invoice.client?.sid;
    const sid = sidValue == null ? "" : String(sidValue).trim();
    const phone = invoice.client?.phone?.trim() ?? "";
    if (sid && phone) return `${sid}@${phone}`;
    return sid || phone;
};

const BasicMoneyRow = ({
    label,
    value,
    labelStyle,
    valueStyle,
}: {
    label: string;
    value: string;
    labelStyle: CSSProperties;
    valueStyle: CSSProperties;
}) => (
    <div className="flex items-baseline justify-between gap-3 text-black">
        <span className="min-w-0 break-words" style={labelStyle}>{label}</span>
        <span className="shrink-0 tabular-nums" style={valueStyle}>{value}</span>
    </div>
);

const BasicInvoiceReceipt = ({
    className,
    printSettings,
    companyName,
    companyAddress,
    companySupportPhone,
    stamp,
    clientNames,
    clientContacts,
    totalBill,
    paidAndDiscount,
    totalDue,
    showAmountInWords,
    showThankYou,
    showSupport,
}: {
    className?: string;
    printSettings: InvoicePrintSettings;
    companyName: string;
    companyAddress: string | null;
    companySupportPhone: string | null;
    stamp: string;
    clientNames: string[];
    clientContacts: string[];
    totalBill: number;
    paidAndDiscount: number;
    totalDue: number;
    showAmountInWords: boolean;
    showThankYou: boolean;
    showSupport: boolean;
}) => {
    const { t } = useTranslation();
    const fontSize = printSettings.font_size;
    const fontWeight = printSettings.font_weight;
    const paddingX = receiptContentPaddingX(printSettings.content_spacing);
    const companyStyle = basicTextStyle(fontSize, fontWeight, 1);
    const addressStyle = basicTextStyle(fontSize, fontWeight, BASIC_FONT_RATIO.address, true);
    const metaStyle = basicTextStyle(fontSize, fontWeight, BASIC_FONT_RATIO.meta, true);
    const clientStyle = basicTextStyle(fontSize, fontWeight, BASIC_FONT_RATIO.client);
    const contactStyle = basicTextStyle(fontSize, fontWeight, BASIC_FONT_RATIO.contact, true);
    const labelStyle = basicTextStyle(fontSize, fontWeight, BASIC_FONT_RATIO.label, true);
    const amountStyle = basicTextStyle(fontSize, fontWeight, BASIC_FONT_RATIO.amount);
    const wordsStyle = basicTextStyle(fontSize, fontWeight, BASIC_FONT_RATIO.words, true);
    const thanksStyle = basicTextStyle(fontSize, fontWeight, BASIC_FONT_RATIO.thanks, true);
    const helpStyle = basicTextStyle(fontSize, fontWeight, BASIC_FONT_RATIO.help);
    const showFooter = showAmountInWords || showThankYou || showSupport;

    return (
        <div
            className={cn(
                "invoice-receipt-root mx-auto box-border w-[384px] max-w-full overflow-visible bg-white p-1.5 text-black",
                paddingX === 0 && "[overflow-wrap:anywhere]",
                className,
            )}
            data-receipt-root
            data-receipt-variant="basic"
            data-receipt-font-size={fontSize}
            data-receipt-font-weight={fontWeight}
            data-receipt-padding-x={paddingX}
            style={{
                fontSize: `${fontSize}px`,
                fontWeight,
                lineHeight: `${receiptLineHeight(fontSize)}px`,
            }}
        >
            <div
                className="border border-solid border-black/20 pb-[1.15em] pt-[0.9em]"
                data-receipt-frame
                style={{ paddingLeft: `${paddingX}px`, paddingRight: `${paddingX}px` }}
            >
                <div data-receipt-header>
                    <div className="text-center text-black">
                        <h3 className="break-words" style={companyStyle}>{companyName}</h3>
                        {companyAddress && (
                            <p className="mt-[0.45em] break-words" style={addressStyle}>{companyAddress}</p>
                        )}
                        <p className="mt-[0.35em] break-words" style={metaStyle}>{stamp}</p>
                    </div>

                    <div className="mt-[1.45em] text-center text-black">
                        <p className="break-words" style={clientStyle}>
                            {clientNames.length > 0 ? clientNames.join(", ") : "—"}
                        </p>
                        {clientContacts.map((contact) => (
                            <p key={contact} className="mt-[0.35em] break-words" style={contactStyle}>{contact}</p>
                        ))}
                    </div>
                </div>

                <div data-receipt-items-body />

                <div className="mt-[1.7em] space-y-[0.42em] text-black" data-receipt-summary>
                    <BasicMoneyRow
                        label={t("invoice.receipt.total_bill")}
                        value={formatMoney(totalBill, 2)}
                        labelStyle={labelStyle}
                        valueStyle={amountStyle}
                    />
                    <BasicMoneyRow
                        label={t("invoice.receipt.paid_and_discount")}
                        value={formatMoney(paidAndDiscount, 2)}
                        labelStyle={{ ...labelStyle, fontWeight: 700 }}
                        valueStyle={amountStyle}
                    />
                    <div className="flex justify-end" aria-hidden>
                        <span className="block w-[5.5em] border-b-2 border-solid border-black" />
                    </div>
                    <BasicMoneyRow
                        label={t("invoice.receipt.total_due")}
                        value={formatMoney(totalDue, 2)}
                        labelStyle={labelStyle}
                        valueStyle={amountStyle}
                    />
                    {showFooter && (
                        <div className="pt-[1.15em] text-center">
                            {showAmountInWords && (
                                <p className="break-words" style={wordsStyle}>
                                    {amountInWords(totalBill)} {t("invoice.receipt.taka")}.
                                </p>
                            )}
                            {showThankYou && (
                                <p className={cn(showAmountInWords && "mt-[1.05em]")} style={thanksStyle}>
                                    {t("invoice.receipt.thank_you")}
                                </p>
                            )}
                            {showSupport && companySupportPhone && (
                                <p
                                    className={cn("break-words", (showThankYou || showAmountInWords) && "mt-[0.75em]")}
                                    style={helpStyle}
                                >
                                    {t("invoice.receipt.help")} - {companySupportPhone}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
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

    const clientContacts = useMemo(() => {
        const contacts = safeInvoices
            .map((invoice) => clientContactLine(invoice))
            .filter((contact) => contact.length > 0);
        return Array.from(new Set(contacts));
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

    const basicStamp = useMemo(() => {
        const labels = invoiceGroups.map((group) => group.invoiceLabel).filter((label) => label.length > 0);
        const invoiceLabel = labels.length > 0 ? labels.join(", ") : "—";
        return `${invoiceLabel} / ${formatBasicPrintedAt(printedAt ?? new Date())}`;
    }, [invoiceGroups, printedAt]);

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

    if (configured && printSettings.mode === "basic") {
        return (
            <BasicInvoiceReceipt
                className={className}
                printSettings={printSettings}
                companyName={companyName}
                companyAddress={companyAddress}
                companySupportPhone={companySupportPhone}
                stamp={basicStamp}
                clientNames={clientNames}
                clientContacts={clientContacts}
                totalBill={totals.subTotal}
                paidAndDiscount={totals.amountPaid + totals.totalDiscount}
                totalDue={totals.amountDue}
                showAmountInWords={showAmountInWords}
                showThankYou={showThankYou}
                showSupport={showSupport}
            />
        );
    }

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
