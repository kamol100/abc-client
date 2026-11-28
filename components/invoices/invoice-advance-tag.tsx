"use client";

import { useTranslation } from "react-i18next";
import MyTooltip from "@/components/my-tooltip";
import { formatMoney, toNumber } from "@/lib/helper/helper";

/** The figures of a bill that used the client's advance, or null when it used none. */
export function invoiceAdvance(row: {
    advance_amount?: number | null;
    bill_amount?: number | null;
    after_discount_amount?: number | null;
}): { bill: number; advance: number; payable: number } | null {
    const advance = toNumber(row.advance_amount);
    if (advance <= 0) return null;

    const payable = toNumber(row.after_discount_amount);
    // Older API answers have no bill_amount: the bill is what is left plus the advance.
    const bill = row.bill_amount == null ? payable + advance : toNumber(row.bill_amount);

    return { bill, advance, payable };
}

type Props = {
    bill: number;
    advance: number;
    payable: number;
    /** "tag" is the pill; "note" is plain small text with the amount, for a note line under the bill. */
    variant?: "tag" | "note";
};

/**
 * A small "Advance paid" tag for the amount cell of a bill that used the client's
 * advance. Hovering shows how the amount came about: the bill, less the advance.
 */
export default function InvoiceAdvanceTag({ bill, advance, payable, variant = "tag" }: Props) {
    const { t } = useTranslation();

    return (
        <MyTooltip
            content={
                <dl className="grid grid-cols-[auto_auto] gap-x-4 gap-y-0.5 text-xs">
                    <dt>{t("invoice.advance.total_bill")}</dt>
                    <dd className="text-right font-semibold">৳{formatMoney(bill)}</dd>
                    <dt>{t("invoice.advance.advance_paid")}</dt>
                    <dd className="text-right font-semibold">− ৳{formatMoney(advance)}</dd>
                    <dt className="border-t border-current/30 pt-0.5">{t("invoice.advance.to_pay")}</dt>
                    <dd className="border-t border-current/30 pt-0.5 text-right font-semibold">৳{formatMoney(payable)}</dd>
                </dl>
            }
        >
            {variant === "note" ? (
                <span tabIndex={0} className="theme-tone-info cursor-default whitespace-nowrap">
                    {t("invoice.reports.advance_payment")}:{formatMoney(advance)}
                </span>
            ) : (
                <span
                    tabIndex={0}
                    className="theme-badge-info inline-flex cursor-default items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-none whitespace-nowrap"
                >
                    {t("invoice.advance.tag")}
                </span>
            )}
        </MyTooltip>
    );
}
