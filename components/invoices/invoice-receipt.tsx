"use client";

import { FC } from "react";
import { useTranslation } from "react-i18next";
import { useSettings } from "@/context/app-provider";
import { formatMoney, toNumber } from "@/lib/helper/helper";
import { cn } from "@/lib/utils";
import { InvoiceDetail } from "./invoice-type";

type InvoiceReceiptProps = {
    invoice: InvoiceDetail;
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

const InvoiceReceipt: FC<InvoiceReceiptProps> = ({ invoice, className }) => {
    const { t } = useTranslation();
    const { settings } = useSettings();

    const companyName = getSettingString(settings, [
        "company_name",
        "name",
        "app_name",
    ]) ?? t("invoice.receipt.default_company");
    const companyAddress = getSettingString(settings, [
        "company_address",
        "address",
    ]);
    const companyPhone = getSettingString(settings, ["company_phone", "phone"]);

    const subTotal = toNumber(invoice.total_amount);
    const totalDiscount =
        toNumber(invoice.total_discount) ||
        toNumber(invoice.discount) + toNumber(invoice.line_total_discount);
    const totalAmount =
        toNumber(invoice.after_discount_amount) || Math.max(subTotal - totalDiscount, 0);
    const amountPaid = toNumber(invoice.amount_paid);
    const amountDue =
        toNumber(invoice.amount_due) || Math.max(toNumber(totalAmount) - amountPaid, 0);

    return (
        <div
            className={cn(
                "mx-auto w-full max-w-[95mm] rounded-md border bg-background p-3 text-xs",
                className,
            )}
        >
            <div className="text-center space-y-0.5 border-b pb-2">
                <h3 className="text-sm font-bold">{companyName}</h3>
                {companyAddress && (
                    <p className="text-muted-foreground">{companyAddress}</p>
                )}
                {companyPhone && (
                    <p className="text-muted-foreground">
                        {t("invoice.receipt.phone")}: {companyPhone}
                    </p>
                )}
            </div>

            <div className="border-b py-2 space-y-1">
                <div className="flex justify-between gap-2">
                    <span>{t("invoice.receipt.client")}:</span>
                    <span className="font-medium text-right">
                        {invoice.client?.name || "—"}
                    </span>
                </div>
                {invoice.client?.phone && (
                    <div className="flex justify-between gap-2">
                        <span>{t("invoice.receipt.client_phone")}:</span>
                        <span className="text-right">{invoice.client.phone}</span>
                    </div>
                )}
                <div className="flex justify-between gap-2">
                    <span>{t("invoice.receipt.invoice_id")}:</span>
                    <span className="font-medium">{invoice.trackID || "—"}</span>
                </div>
                <div className="flex justify-between gap-2">
                    <span>{t("invoice.receipt.date")}:</span>
                    <span>{new Date().toISOString().slice(0, 10)}</span>
                </div>
            </div>

            <div className="py-2">
                <div className="grid grid-cols-12 gap-1 border-b pb-1 font-semibold">
                    <div className="col-span-5">{t("invoice.receipt.item")}</div>
                    <div className="col-span-2 text-center">
                        {t("invoice.receipt.qty")}
                    </div>
                    <div className="col-span-2 text-right">
                        {t("invoice.receipt.price")}
                    </div>
                    <div className="col-span-3 text-right">
                        {t("invoice.receipt.amount")}
                    </div>
                </div>
                <div className="space-y-1 pt-1">
                    {invoice.lines?.map((line, index) => {
                        const lineTotal =
                            toNumber(line.total_amount) ||
                            Math.max(
                                toNumber(line.amount) * toNumber(line.quantity || 1) -
                                    toNumber(line.discount),
                                0,
                            );
                        return (
                            <div
                                key={line.uuid ?? `${line.description}-${index}`}
                                className="grid grid-cols-12 gap-1"
                            >
                                <div className="col-span-5 line-clamp-2">
                                    {line.description}
                                </div>
                                <div className="col-span-2 text-center">
                                    {toNumber(line.quantity || 1)}
                                </div>
                                <div className="col-span-2 text-right">
                                    {formatMoney(line.amount)}
                                </div>
                                <div className="col-span-3 text-right font-medium">
                                    {formatMoney(lineTotal)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="border-t pt-2 space-y-1">
                <div className="flex justify-between">
                    <span>{t("invoice.receipt.sub_total")}:</span>
                    <span>{formatMoney(subTotal)}</span>
                </div>
                <div className="flex justify-between">
                    <span>{t("invoice.receipt.discount")}:</span>
                    <span>{formatMoney(totalDiscount)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                    <span>{t("invoice.receipt.total")}:</span>
                    <span>{formatMoney(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                    <span>{t("invoice.receipt.paid")}:</span>
                    <span>{formatMoney(amountPaid)}</span>
                </div>
                <div className="flex justify-between font-semibold text-destructive">
                    <span>{t("invoice.receipt.due")}:</span>
                    <span>{formatMoney(amountDue)}</span>
                </div>
            </div>

            <div className="pt-3 text-center font-semibold">
                {t("invoice.receipt.thank_you")}
            </div>
        </div>
    );
};

export default InvoiceReceipt;
