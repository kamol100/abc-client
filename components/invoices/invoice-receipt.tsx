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

const ReceiptPair = ({
    label,
    value,
    emphasized = false,
}: {
    label: string;
    value: string;
    emphasized?: boolean;
}) => (
    <div
        className={cn(
            "flex items-start justify-between gap-[12px] font-bold text-black",
            emphasized ? "text-[36px] leading-[44px]" : "text-[28px] leading-[36px]",
        )}
    >
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

    return (
        <div
            className={cn(
                "invoice-receipt-root mx-auto box-border w-[384px] max-w-full overflow-visible bg-white px-[16px] pb-[24px] pt-[16px] text-black",
                className,
            )}
            data-receipt-root
        >
            <div data-receipt-header>
                <div className="border-b-[3px] border-solid border-black pb-[12px] text-center text-black">
                    <h3 className="break-words text-[36px] font-bold leading-[44px]">{companyName}</h3>
                    {companyAddress && (
                        <p className="mt-[6px] break-words text-[28px] font-bold leading-[36px]">{companyAddress}</p>
                    )}
                    {companyPhone && (
                        <p className="mt-[4px] break-words text-[28px] font-bold leading-[36px]">
                            {t("invoice.receipt.phone")}: {companyPhone}
                        </p>
                    )}
                </div>

                <div className="space-y-[4px] border-b-[3px] border-solid border-black py-[12px]">
                    {clientIds.length > 0 && (
                        <ReceiptPair label={t("invoice.receipt.client_id")} value={clientIds.join(", ")} />
                    )}
                    <ReceiptPair
                        label={t("invoice.receipt.client")}
                        value={clientNames.length > 0 ? clientNames.join(", ") : "—"}
                    />
                    {clientPppoeUsernames.length > 0 && (
                        <ReceiptPair
                            label={t("invoice.receipt.pppoe_id")}
                            value={clientPppoeUsernames.join(", ")}
                        />
                    )}
                    {clientPhones.length > 0 && (
                        <ReceiptPair label={t("common.phone")} value={clientPhones.join(", ")} />
                    )}
                    <ReceiptPair label={t("invoice.receipt.date")} value={printedDateTimeText} />
                </div>
            </div>

            <div
                className="flex items-start justify-between gap-[12px] border-b-[3px] border-solid border-black py-[8px] text-[28px] font-bold leading-[36px] text-black"
                data-receipt-items-head
            >
                <span>{t("invoice.receipt.item")}</span>
                <span>{t("invoice.receipt.amount")}</span>
            </div>
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
                                    className="flex items-baseline justify-between gap-[8px] break-inside-avoid py-[4px] text-[24px] font-bold leading-[30px] text-black"
                                    data-receipt-item-row
                                >
                                    <span className="min-w-0 truncate">
                                        {lineIndex === 0 ? `${group.invoiceLabel}: ` : ""}
                                        {line.description} {line.quantity}x{formatMoney(line.unitPrice)}
                                    </span>
                                    <span className="shrink-0 tabular-nums">{formatMoney(line.amount)}</span>
                                </div>
                            ))
                        ) : (
                            <div
                                className="flex items-baseline justify-between gap-[8px] break-inside-avoid py-[4px] text-[24px] font-bold leading-[30px] text-black"
                                data-receipt-item-row
                            >
                                <span className="min-w-0 truncate">{group.invoiceLabel}: —</span>
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
                <ReceiptPair label={t("invoice.receipt.sub_total")} value={formatMoney(totals.subTotal)} />
                <ReceiptPair label={t("invoice.receipt.discount")} value={formatMoney(totals.totalDiscount)} />
                <ReceiptPair label={t("invoice.receipt.total")} value={formatMoney(totals.totalAmount)} emphasized />
                <ReceiptPair label={t("invoice.receipt.paid")} value={formatMoney(totals.amountPaid)} />
                {totals.amountDue > 0 && (
                    <ReceiptPair label={t("invoice.receipt.due")} value={formatMoney(totals.amountDue)} emphasized />
                )}
                <div className="mt-[12px] border-t-[3px] border-solid border-black pt-[12px] text-center text-[28px] font-bold leading-[36px] text-black">
                    {t("invoice.receipt.thank_you")}
                    {companyPhone && (
                        <p className="mt-[6px] break-words">
                            {t("invoice.receipt.for_support")}: {companyPhone}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InvoiceReceipt;
